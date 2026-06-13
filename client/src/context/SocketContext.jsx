import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";
import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};
export const SocketProvider = ({ children }) => {
  const socket = useRef();
  const { userInfo } = useAppStore();
  useEffect(() => {
    if (userInfo) {
      socket.current = io(HOST, {
        withCredentials: true,
        query: { userId: userInfo.id },
      });
      socket.current.on("connect", () => {
        console.log("connected to socket server");
      });
      const handleReceiveMessage = (message) => {
        const {
          selectedChatType,
          selectedChatData,
          addMessage,
          addContactsInDMContacts,
        } = useAppStore.getState();
        if (
          selectedChatType !== undefined &&
          (selectedChatData._id === message.sender._id ||
            selectedChatData._id === message.recipient._id)
        ) {
          console.log("message receive", message);

          addMessage(message);
        } else {
          console.log("message didnt receive");
        }
        addContactsInDMContacts(message);
      };
      const handleReceiveChannelMessage = (message) => {
        const {
          selectedChatType,
          selectedChatData,
          addMessage,
          addChannelInChannelList,
        } = useAppStore.getState();
        if (
          selectedChatType !== undefined &&
          selectedChatData._id === message.channelId
        ) {
          addMessage(message);
        }
        addChannelInChannelList(message);
      };
      const handleMessageStatusUpdate = ({ messageId, status }) => {
        const { updateMessageStatus } = useAppStore.getState();
        updateMessageStatus(messageId, status);
      };
      const handleUserTyping = ({ senderId }) => {
        const { setTyping } = useAppStore.getState();
        setTyping(senderId, true);
      };
      const handleUserStopTyping = ({ senderId }) => {
        const { setTyping } = useAppStore.getState();
        setTyping(senderId, false);
      };
      socket.current.on("receiveMessage", handleReceiveMessage);
      socket.current.on("receive-channel-message", handleReceiveChannelMessage);
      socket.current.on("messageStatusUpdate", handleMessageStatusUpdate);
      socket.current.on("userTyping", handleUserTyping);
      socket.current.on("userStopTyping", handleUserStopTyping);
      return () => {
        socket.current.off("messageStatusUpdate", handleMessageStatusUpdate);
        socket.current.off("userTyping", handleUserTyping);
        socket.current.off("userStopTyping", handleUserStopTyping);

        socket.current.disconnect();
      };
    }
  }, [userInfo]);
  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
};
