import { useEffect, useRef, useState } from "react";
import { GrAttachment } from "react-icons/gr";
import { RiEmojiStickerLine } from "react-icons/ri";
import { IoSend } from "react-icons/io5";
import EmojiPicker from "emoji-picker-react";
import { useAppStore } from "@/store";
import { useSocket } from "@/context/SocketContext";
import apiClient from "@/lib/api-client";
import { UPLOAD_FILE_ROUTE } from "@/utils/constants";

const MessageBar = () => {
  const emojiRef = useRef();
  const fileInputRef = useRef();
  const socket = useSocket();

  const {
    selectedChatType,
    selectedChatData,
    userInfo,
    setIsUploading,
    setFileUploadProgress,
  } = useAppStore();

  const [message, setMessage] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  /* --------------------------------------------------------
     ADD EMOJI TO MESSAGE
  --------------------------------------------------------- */
  const handleAddEmoji = (emoji) => {
    setMessage((msg) => msg + emoji.emoji);
  };

  /* --------------------------------------------------------
     CLOSE EMOJI PICKER WHEN CLICKING OUTSIDE
  --------------------------------------------------------- */
  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setEmojiPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* --------------------------------------------------------
     SEND MESSAGE WHEN PRESSING ENTER
  --------------------------------------------------------- */
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Enter" && message.trim()) {
        handleSendMessage();
      }
    };
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [message]);

  /* --------------------------------------------------------
     CLICK ATTACHMENT BUTTON => OPEN FILE INPUT
  --------------------------------------------------------- */
  const handleAttachmentClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  /* --------------------------------------------------------
     SEND MESSAGE TO SOCKET (TEXT OR CHANNEL)
  --------------------------------------------------------- */
  const handleSendMessage = async () => {
    if (!message.trim()) return;

    if (selectedChatType === "contact") {
      socket.emit("sendMessage", {
        sender: userInfo.id,
        content: message,
        recipient: selectedChatData._id,
        messageType: "text",
      });
    } else {
      socket.emit("send-channel-message", {
        sender: userInfo.id,
        content: message,
        messageType: "text",
        channelId: selectedChatData._id,
      });
    }

    setMessage("");
  };

  /* --------------------------------------------------------
     FILE UPLOAD => SEND AS FILE MESSAGE
  --------------------------------------------------------- */
  const handleAttachmentChange = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      setIsUploading(true);

      const response = await apiClient.post(UPLOAD_FILE_ROUTE, formData, {
        withCredentials: true,
        onUploadProgress: (data) =>
          setFileUploadProgress(Math.round((100 * data.loaded) / data.total)),
      });

      setIsUploading(false);

      if (response.status === 200 && response.data) {
        const payload = {
          sender: userInfo.id,
          messageType: "file",
          fileUrl: response.data.filePath,
        };

        if (selectedChatType === "contact") {
          socket.emit("sendMessage", {
            ...payload,
            recipient: selectedChatData._id,
          });
        } else {
          socket.emit("send-channel-message", {
            ...payload,
            channelId: selectedChatData._id,
          });
        }
      }
    } catch (error) {
      setIsUploading(false);
      console.log(error);
    }
  };

  return (
    <div
      className="
        bg-[#1c1d25] 
        flex items-center gap-4 
        px-4 sm:px-6 md:px-8 
        py-4
        w-full
      "
    >
      {/* ---------------------------- MESSAGE INPUT AREA ---------------------------- */}
      <div
        className="
          flex-1 flex items-center 
          bg-[#2a2b33] 
          rounded-md 
          px-3 sm:px-4 
          gap-3 sm:gap-4
        "
      >
        {/* TEXT INPUT */}
        <input
          type="text"
          className="
            flex-1 p-3 sm:p-4 
            bg-transparent 
            text-sm sm:text-base
            focus:outline-none
          "
          placeholder="Enter Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        {/* ATTACHMENT BUTTON */}
        <button
          className="text-neutral-500 hover:text-white transition"
          onClick={handleAttachmentClick}
        >
          <GrAttachment className="text-xl sm:text-2xl" />
        </button>

        {/* HIDDEN FILE INPUT */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAttachmentChange}
          className="hidden"
        />

        {/* EMOJI PICKER */}
        <div className="relative">
          <button
            className="text-neutral-500 hover:text-white transition"
            onClick={() => setEmojiPickerOpen((prev) => !prev)}
          >
            <RiEmojiStickerLine className="text-xl sm:text-2xl" />
          </button>

          {/* EMOJI DROPDOWN */}
          <div
            ref={emojiRef}
            className="absolute bottom-14 right-0 sm:right-2 z-50"
          >
            <EmojiPicker
              theme="dark"
              open={emojiPickerOpen}
              onEmojiClick={handleAddEmoji}
              autoFocusSearch={false}
            />
          </div>
        </div>
      </div>

      {/* ---------------------------- SEND BUTTON ---------------------------- */}
      <button
        onClick={handleSendMessage}
        className="
          bg-[#8417ff] 
          hover:bg-[#741bda] 
          p-4 sm:p-5 
          rounded-md 
          flex items-center justify-center 
          transition
        "
      >
        <IoSend className="text-xl sm:text-2xl" />
      </button>
    </div>
  );
};

export default MessageBar;
