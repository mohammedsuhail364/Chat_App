import { useAppStore } from "@/store";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { ContactsContainer } from "./components/contacts-container";
import { EmptyChatContainer } from "./components/empty-chat-container";
import ChatContainer from "./components/chat-container";

const Chat = () => {
  const navigate = useNavigate();

  const {
    userInfo,
    selectedChatType,
    isUploading,
    isDownloading,
    fileUploadProgress,
    fileDownloadProgress,
  } = useAppStore();

  /* --------------------------------------------------------
     PROFILE CHECK ON LOAD
     Redirects user to /profile if setup incomplete
  --------------------------------------------------------- */
  useEffect(() => {
    if (!userInfo.profileSetup) {
      toast("Please setup your profile to continue");
      navigate("/profile");
    }
  }, [userInfo, navigate]);

  return (
    <div
      className="
        flex 
        h-screen w-full 
        text-white 
        overflow-hidden 
        bg-[#1c1d25]
      "
    >
      {/* --------------------------------------------------------
         FILE UPLOADING OVERLAY (Full Screen)
      --------------------------------------------------------- */}
      {isUploading && (
        <div
          className="
            fixed inset-0 z-20 
            bg-black/80 backdrop-blur-sm 
            flex flex-col items-center justify-center gap-6
            px-4 text-center
          "
        >
          <h5 className="text-4xl sm:text-5xl font-semibold animate-pulse">
            Uploading File <br /> {fileUploadProgress}%
          </h5>
        </div>
      )}

      {/* --------------------------------------------------------
         FILE DOWNLOADING OVERLAY (Full Screen)
      --------------------------------------------------------- */}
      {isDownloading && (
        <div
          className="
            fixed inset-0 z-20 
            bg-black/80 backdrop-blur-sm 
            flex flex-col items-center justify-center gap-6
            px-4 text-center
          "
        >
          <h5 className="text-4xl sm:text-5xl font-semibold animate-pulse">
            Downloading File <br /> {fileDownloadProgress}%
          </h5>
        </div>
      )}

      {/* --------------------------------------------------------
         LEFT SIDEBAR (Contacts + Channels + Profile)
      --------------------------------------------------------- */}
      <ContactsContainer />

      {/* --------------------------------------------------------
         RIGHT SIDE (Chat Container OR Empty Screen)
      --------------------------------------------------------- */}
      {selectedChatType === undefined ? (
        <EmptyChatContainer />
      ) : (
        <ChatContainer />
      )}
    </div>
  );
};

export default Chat;
