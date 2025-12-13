import apiClient from "@/lib/api-client";
import { useAppStore } from "@/store";
import {
  GET_ALL_MESSAGES_ROUTE,
  GET_CHANNEL_MESSAGES,
  HOST,
} from "@/utils/constants";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { MdFolderZip } from "react-icons/md";
import { IoMdArrowRoundDown } from "react-icons/io";
import { IoCloseSharp } from "react-icons/io5";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { getColor } from "@/lib/utils";

const MessageContainer = () => {
  const scrollRef = useRef();
  const containerRef = useRef(null);

  const {
    selectedChatType,
    selectedChatData,
    selectedChatMessages,
    setSelectedChatMessages,
    setFileDownloadProgress,
    setIsDownloading,
    userInfo,
  } = useAppStore();

  const [showImage, setShowImage] = useState(false);
  const [imageURL, setImageURL] = useState(null);

  const [isFetchingOldMessages, setIsFetchingOldMessages] = useState(false);

  /* ---------------------------------------------------------
     FETCH MESSAGES (DM or CHANNEL)
  ---------------------------------------------------------- */
  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await apiClient.post(
          GET_ALL_MESSAGES_ROUTE,
          { id: selectedChatData._id },
          { withCredentials: true }
        );
        if (response.data.messages) {
          setSelectedChatMessages(response.data.messages);
        }
      } catch (error) {
        console.log(error);
      }
    };

    const getChannelMessages = async () => {
      try {
        const response = await apiClient.get(
          `${GET_CHANNEL_MESSAGES}/${selectedChatData._id}`,
          { withCredentials: true }
        );
        if (response.data.messages) {
          setSelectedChatMessages(response.data.messages);
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (selectedChatData._id) {
      selectedChatType === "contact" ? getMessages() : getChannelMessages();
    }
  }, [selectedChatData, selectedChatType]);

  /* ---------------------------------------------------------
     AUTO SCROLL TO BOTTOM ON NEW MESSAGES
  ---------------------------------------------------------- */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChatMessages]);

  /* ---------------------------------------------------------
     DETECT SCROLL-TO-TOP → LOAD OLDER MESSAGES
  ---------------------------------------------------------- */
  useEffect(() => {
    const handleScroll = () => {
      if (
        containerRef.current &&
        containerRef.current.scrollTop === 0 &&
        !isFetchingOldMessages
      ) {
        setIsFetchingOldMessages(true);
        setTimeout(() => setIsFetchingOldMessages(false), 1000);
      }
    };

    const el = containerRef.current;
    if (el) el.addEventListener("scroll", handleScroll);

    return () => el && el.removeEventListener("scroll", handleScroll);
  }, [isFetchingOldMessages]);

  /* ---------------------------------------------------------
     CHECK IF FILE IS AN IMAGE
  ---------------------------------------------------------- */
  const checkIfImage = (filePath) => {
    const imageRegex = /\.(jpg|jpeg|png|gif|bmp|tiff|webp|svg|heic|heif)$/i;
    return imageRegex.test(filePath);
  };

  /* ---------------------------------------------------------
     FILE DOWNLOAD HANDLER
  ---------------------------------------------------------- */
  const downloadFile = async (url) => {
    setIsDownloading(true);
    setFileDownloadProgress(0);

    const response = await apiClient.get(`${HOST}/${url}`, {
      responseType: "blob",
      onDownloadProgress: ({ loaded, total }) => {
        setFileDownloadProgress(Math.round((loaded * 100) / total));
      },
    });

    const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = urlBlob;
    link.setAttribute("download", url.split("/").pop());
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(urlBlob);
    setIsDownloading(false);
    setFileDownloadProgress(0);
  };

  /* ---------------------------------------------------------
     MESSAGE RENDERER (LOOP)
  ---------------------------------------------------------- */
  const renderMessages = () => {
    let lastDate = null;

    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;

      return (
        <div key={index}>
          {showDate && (
            <div className="text-center text-gray-500 my-3 text-sm">
              {moment(message.timestamp).format("LL")}
            </div>
          )}

          {selectedChatType === "contact"
            ? renderDMMessages(message)
            : renderChannelMessages(message)}
        </div>
      );
    });
  };

  /* ---------------------------------------------------------
     DM MESSAGE UI
  ---------------------------------------------------------- */
  const renderDMMessages = (message) => (
    <div
      className={`${
        message.sender === selectedChatData._id ? "text-left" : "text-right"
      } mb-2 animate-[slideIn_0.3s_ease-out]`}
    >
      {/* TEXT MESSAGE */}
      {message.messageType === "text" && (
        <div
          className={`${
            message.sender !== selectedChatData._id
              ? "bg-gradient-to-br from-[#8417ff]/20 to-[#8417ff]/10 text-white border-[#8417ff]/30 shadow-[0_0_15px_rgba(132,23,255,0.15)]"
              : "bg-gradient-to-br from-[#2a2b33]/40 to-[#2a2b33]/20 text-white/90 border-white/10 shadow-lg"
          }
          border backdrop-blur-sm inline-block p-4 rounded-2xl my-1 
          max-w-[80%] sm:max-w-[55%] break-words
          transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
          relative overflow-hidden
          before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity`}
        >
          {message.content}
        </div>
      )}

      {/* FILE MESSAGE */}
      {message.messageType === "file" && (
        <div
          className={`${
            message.sender !== selectedChatData._id
              ? "bg-gradient-to-br from-[#8417ff]/20 to-[#8417ff]/10 text-white border-[#8417ff]/30 shadow-[0_0_15px_rgba(132,23,255,0.15)]"
              : "bg-gradient-to-br from-[#2a2b33]/40 to-[#2a2b33]/20 text-white/90 border-white/10 shadow-lg"
          }
          border backdrop-blur-sm inline-block p-4 rounded-2xl my-1 
          max-w-[80%] sm:max-w-[55%] break-words
          transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
          relative overflow-hidden`}
        >
          {checkIfImage(message.fileUrl) ? (
            /* IMAGE FILE */
            <div className="relative group">
              <img
                onClick={() => {
                  setImageURL(message.fileUrl);
                  setShowImage(true);
                }}
                src={`${HOST}/${message.fileUrl}`}
                className="max-h-[250px] sm:max-h-[300px] w-auto rounded-xl cursor-pointer object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-xl flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-sm bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                  Click to view
                </span>
              </div>
            </div>
          ) : (
            /* NORMAL FILE */
            <div className="flex items-center justify-center gap-3 group">
              <span className="text-3xl p-3 bg-gradient-to-br from-black/40 to-black/20 rounded-xl transition-transform duration-300 group-hover:scale-110">
                <MdFolderZip />
              </span>
              <span className="truncate max-w-[150px] sm:max-w-[200px] font-medium">
                {message.fileUrl.split("/").pop()}
              </span>
              <span
                className="bg-gradient-to-br from-[#8417ff]/30 to-[#8417ff]/20 p-3 text-xl rounded-xl hover:from-[#8417ff]/50 hover:to-[#8417ff]/30 cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95"
                onClick={() => downloadFile(message.fileUrl)}
              >
                <IoMdArrowRoundDown />
              </span>
            </div>
          )}
        </div>
      )}

      <div
        className={`text-xs text-gray-500 mt-1 flex items-center gap-1 ${
          message.sender !== selectedChatData._id ? "justify-end" : ""
        }`}
      >
        {message.sender !== selectedChatData._id ? (
          // User sent → timestamp then tick
          <>
            <span>{moment(message.timestamp).format("LT")}</span>
            <span className="text-[#8417ff]/70 text-xs">✓</span>
          </>
        ) : (
          // User received → tick then timestamp
          <>
            <span className="text-[#8417ff]/70 text-xs">✓</span>
            <span>{moment(message.timestamp).format("LT")}</span>
          </>
        )}
      </div>
    </div>
  );

  /* ---------------------------------------------------------
     CHANNEL MESSAGE UI
  ---------------------------------------------------------- */
  const renderChannelMessages = (message) => (
    <div
      className={`mt-5 ${
        message.sender._id !== userInfo.id ? "text-left" : "text-right"
      } animate-[slideIn_0.3s_ease-out]`}
    >
      {/* TEXT MESSAGE */}
      {message.messageType === "text" && (
        <div
          className={`${
            message.sender._id === userInfo.id
              ? "bg-gradient-to-br from-[#8417ff]/20 to-[#8417ff]/10 text-white border-[#8417ff]/30 shadow-[0_0_15px_rgba(132,23,255,0.15)]"
              : "bg-gradient-to-br from-[#2a2b33]/40 to-[#2a2b33]/20 text-white/90 border-white/10 shadow-lg"
          }
          border backdrop-blur-sm inline-block p-4 rounded-2xl my-1 
          max-w-[80%] sm:max-w-[55%] break-words ml-11
          transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
          relative overflow-hidden
          before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity`}
        >
          {message.content}
        </div>
      )}

      {/* FILE MESSAGE */}
      {message.messageType === "file" && (
        <div
          className={`${
            message.sender._id === userInfo.id
              ? "bg-gradient-to-br from-[#8417ff]/20 to-[#8417ff]/10 text-white border-[#8417ff]/30 shadow-[0_0_15px_rgba(132,23,255,0.15)]"
              : "bg-gradient-to-br from-[#2a2b33]/40 to-[#2a2b33]/20 text-white/90 border-white/10 shadow-lg"
          }
          border backdrop-blur-sm inline-block p-4 rounded-2xl my-1 
          max-w-[80%] sm:max-w-[55%] break-words
          transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
          relative overflow-hidden`}
        >
          {checkIfImage(message.fileUrl) ? (
            <div className="relative group">
              <img
                onClick={() => {
                  setImageURL(message.fileUrl);
                  setShowImage(true);
                }}
                src={`${HOST}/${message.fileUrl}`}
                className="max-h-[250px] sm:max-h-[300px] w-auto rounded-xl cursor-pointer object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-xl flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-sm bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                  Click to view
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 group">
              <span className="text-3xl p-3 bg-gradient-to-br from-black/40 to-black/20 rounded-xl transition-transform duration-300 group-hover:scale-110">
                <MdFolderZip />
              </span>
              <span className="truncate max-w-[150px] sm:max-w-[200px] font-medium">
                {message.fileUrl.split("/").pop()}
              </span>
              <span
                className="bg-gradient-to-br from-[#8417ff]/30 to-[#8417ff]/20 p-3 text-xl rounded-xl hover:from-[#8417ff]/50 hover:to-[#8417ff]/30 cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95"
                onClick={() => downloadFile(message.fileUrl)}
              >
                <IoMdArrowRoundDown />
              </span>
            </div>
          )}
        </div>
      )}

      {/* USER INFO UNDER MESSAGE */}
      {message.sender._id !== userInfo.id && (
        <div className="flex items-center gap-2 mt-1">
          <Avatar className="h-7 w-7 rounded-full overflow-hidden ring-2 ring-white/10">
            <AvatarImage
              src={`${HOST}/${message.sender.image}`}
              className="object-cover w-full h-full"
            />
            <AvatarFallback
              className={`uppercase h-7 w-7 flex items-center justify-center rounded-full ${getColor(
                message.sender.color
              )}`}
            >
              {message.sender.firstName
                ? message.sender.firstName[0]
                : message.sender.email[0]}
            </AvatarFallback>
          </Avatar>

          <span className="text-sm text-white/60 font-medium">
            {message.sender.firstName} {message.sender.lastName}
          </span>

          <span className="text-sm text-white/40">
            {moment(message.timestamp).format("LT")}
          </span>
        </div>
      )}

      {message.sender._id === userInfo.id && (
        <div className="text-sm text-white/40 mt-1">
          {moment(message.timestamp).format("LT")}
        </div>
      )}
    </div>
  );

  /* ---------------------------------------------------------
     FULLSCREEN IMAGE VIEWER
  ---------------------------------------------------------- */
  return (
    <div
      ref={containerRef}
      className="
        flex-1 overflow-auto scrollbar-hidden 
        p-3 sm:p-4 md:p-6 
        w-full 
      "
    >
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {renderMessages()}
      <div ref={scrollRef} />

      {showImage && (
        <div className="fixed z-[1000] top-0 left-0 h-screen w-screen flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <img
            src={`${HOST}/${imageURL}`}
            className="max-h-[80vh] max-w-full object-contain rounded-md"
          />

          {/* IMAGE ACTION BUTTONS */}
          <div className="fixed top-4 right-4 flex gap-4">
            <button
              onClick={() => downloadFile(imageURL)}
              className="bg-black/50 p-3 rounded-full text-2xl hover:bg-black/80 transition"
            >
              <IoMdArrowRoundDown />
            </button>
            <button
              onClick={() => {
                setShowImage(false);
                setImageURL(null);
              }}
              className="bg-black/50 p-3 rounded-full text-2xl hover:bg-black/80 transition"
            >
              <IoCloseSharp />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageContainer;
