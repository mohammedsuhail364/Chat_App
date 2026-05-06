import Messages from "../models/messagesModel.js";
const LIMIT=5;
export const getMessages = async (req, res, next) => {
  try {
    const user1 = req.userId;
    const user2 = req.body.id;
    const cursor = req.body.cursor; // ISO timestamp - load messages older than this
    if (!user1 || !user2) {
      return res.status(400).send("Both user ID's are required.");
    }
    const filter = {
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 },
      ],
    };
    if(cursor){
      filter.timestamp={$lt:new Date(cursor)};
    }
    const raw = await Messages.find(filter).sort({ timestamp: -1 }).limit(LIMIT+1).lean();
    const hasMore=raw.length>LIMIT;
    if(hasMore) raw.pop();
    raw.reverse(); //oldest to newest for display
    return res.status(200).json({ messages:raw,hasMore});
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server Error");
  }
};
export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).send("File is required");
    }
    console.log(req.file);

    return res.status(200).json({
      filePath: req.file.path, // Cloudinary CDN URL
    });
  } catch (error) {
    console.log("error during file upload", error);
    return res.status(500).send("Internal server Error");
  }
};
