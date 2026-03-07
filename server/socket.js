import { Server as SocketIoServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter"; // NEW
import { pubClient, subClient } from "./utils/redis.js"; // NEW
import Message from "./models/messagesModel.js";
import Channel from "./models/channelModel.js";

const setupSocket = (server) => {
  const io = new SocketIoServer(server, {
    cors: {
      origin: [process.env.FRONTEND_URL],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // NEW — replaces in-memory Map with Redis adapter
  // This handles pub/sub between servers automatically
  io.adapter(createAdapter(pubClient, subClient));

  // REMOVED — const userSocketMap = new Map();
  // Redis is now the map

  // NEW — helper function (replaces userSocketMap.get)
  const getUserSocketId = async (userId) => {
    return await pubClient.get(`socket:user:${userId}`);
  };

  // CHANGED — was sync, now async because Redis is a network call
  const disconnect = async (socket) => {
    console.log(`Client Disconnected: ${socket.id}`);
    const userId = socket.handshake.query.userId;
    if (userId) {
      await pubClient.del(`socket:user:${userId}`); // replaces userSocketMap.delete
      console.log(`Cleared Redis entry for: ${userId}`);
    }
  };

  // CHANGED — all userSocketMap.get() replaced with await getUserSocketId()
  // CHANGED — added try/catch (was missing before)
  // CHANGED — added .lean() for faster MongoDB reads
  const sendMessage = async (message, socket) => {
    try {
      const senderSocketId = await getUserSocketId(message.sender); // was: userSocketMap.get(message.sender)
      const recipientSocketId = await getUserSocketId(message.recipient); // was: userSocketMap.get(message.recipient)

      const createdMessage = await Message.create(message);
      const messageData = await Message.findById(createdMessage._id)
        .populate("sender", "id email firstName lastName image color")
        .populate("recipient", "id email firstName lastName image color")
        .lean(); // NEW — plain JS object, faster

      if (recipientSocketId) {
        // Recipient is online — upgrade to "delivered" immediately
        await Message.findByIdAndUpdate(createdMessage._id, {
          status: "delivered",
        });

        io.to(recipientSocketId).emit("receiveMessage", {
          ...messageData,
          status: "delivered",
        });
        io.to(senderSocketId).emit("receiveMessage", {
          ...messageData,
          status: "delivered",
        });
        // Also tell the sender it was delivered
        io.to(senderSocketId).emit("messageStatusUpdate", {
          messageId: createdMessage._id,
          status: "delivered",
        });
      } else {
        // Recipient offline — stays "sent"
        io.to(senderSocketId).emit("receiveMessage", {
          ...messageData,
          status: "sent",
        });
      }
    } catch (err) {
      console.error("sendMessage error:", err);
      socket.emit("error", { message: "Failed to send message" }); // NEW — tell client something failed
    }
  };

  // CHANGED — fixed N+1 query using Promise.all
  // CHANGED — all userSocketMap.get() replaced with await getUserSocketId()
  // CHANGED — added try/catch
  const sendChannelMessage = async (message, socket) => {
    try {
      const { channelId, sender, content, messageType, fileUrl } = message;

      // NEW — run both DB calls at the same time instead of one after another
      const [createdMessage, channel] = await Promise.all([
        Message.create({
          sender,
          recipient: null,
          content,
          messageType,
          timestamp: new Date(),
          fileUrl,
        }),
        Channel.findById(channelId).populate("members").lean(), // was: separate query AFTER create
      ]);

      // these two can also run together
      const [messageData] = await Promise.all([
        Message.findById(createdMessage._id)
          .populate("sender", "id email firstName lastName image color")
          .lean(), // NEW — .lean() replaces ._doc
        Channel.findByIdAndUpdate(channelId, {
          $push: { messages: createdMessage._id },
        }),
      ]);

      const finalData = { ...messageData, channelId: channel._id }; // was: messageData._doc (not needed with .lean())

      if (channel && channel.members) {
        for (const member of channel.members) {
          const memberSocketId = await getUserSocketId(member._id.toString()); // was: userSocketMap.get()
          
           
          if (memberSocketId) {
            io.to(memberSocketId).emit("receive-channel-message", finalData);
          }
        }
        // admin
        const adminSocketId = await getUserSocketId(
          channel.admin._id.toString(),
        ); // was: userSocketMap.get()
        if (adminSocketId) {
          io.to(adminSocketId).emit("receive-channel-message", finalData);
        }
      }
    } catch (err) {
      console.error("sendChannelMessage error:", err);
      socket.emit("error", { message: "Failed to send channel message" }); // NEW
    }
  };

  io.on("connection", async (socket) => {
    // CHANGED — added async
    const userId = socket.handshake.query.userId;
    if (userId) {
      await pubClient.set(`socket:user:${userId}`, socket.id, { EX: 86400 }); // was: userSocketMap.set() — EX = auto delete after 24hrs
      console.log(`User connected: ${userId} with socket ID: ${socket.id}`);
    } else {
      console.log("User ID not provided during connection.");
    }

    // CHANGED — pass socket into handlers so they can emit errors back
    socket.on("sendMessage", (message) => sendMessage(message, socket));
    socket.on("messageSeen", async ({ messageId, senderId }) => {
      await Message.findByIdAndUpdate(messageId, { status: "seen" });

      const senderSocketId = await pubClient.get(`socket:user:${senderId}`);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageStatusUpdate", {
          messageId,
          status: "seen",
        });
      }
    });
    socket.on("send-channel-message", (message) =>
      sendChannelMessage(message, socket),
    );
    socket.on("disconnect", () => disconnect(socket)); // disconnect unchanged in behavior
  });
};

export default setupSocket;
