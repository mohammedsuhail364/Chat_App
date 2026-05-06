import apiClient from "@/lib/api-client";
import { useAppStore } from "@/store";
import {
  GET_ALL_MESSAGES_ROUTE,
  GET_CHANNEL_MESSAGES,
  HOST,
} from "@/utils/constants";
import moment from "moment";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { MdFolderZip } from "react-icons/md";
import { IoMdArrowRoundDown } from "react-icons/io";
import { IoCloseSharp } from "react-icons/io5";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { getColor } from "@/lib/utils";
import { useSocket } from "@/context/SocketContext";
import { LuClock, LuCheckCheck, LuEye, LuCheck } from "react-icons/lu";

const MessageContainer = () => {
  const scrollRef = useRef(null);
  const containerRef = useRef(null);
  const socket = useSocket();

  const {
    selectedChatType,
    selectedChatData,
    selectedChatMessages,
    prependMessages,
    setSelectedChatMessages,
    setFileDownloadProgress,
    setIsDownloading,
    userInfo,
    closeChat,
  } = useAppStore();

  const [showImage, setShowImage] = useState(false);
  const [imageURL, setImageURL] = useState(null);
  const [isFetchingOldMessages, setIsFetchingOldMessages] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // hides container until first batch is ready

  // Refs — mutations here never trigger re-renders
  const seenEmittedRef = useRef(new Set());
  const shouldRestoreScroll = useRef(false);
  const prevScrollHeight = useRef(0);
  const isInitialLoad = useRef(false);  // true → snap to bottom after messages set
  const isFetchingRef = useRef(false);  // stable guard — won't destabilise useCallback
  const loadOlderRef = useRef(null);    // always holds the latest loadOlderMessages

  /* ---------------------------------------------------------
     KEYDOWN — ESC closes chat
  ---------------------------------------------------------- */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeChat();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeChat]);

  /* ---------------------------------------------------------
     FETCH MESSAGES ON CHAT OPEN
     - dep is selectedChatData._id (string), not the object
       → stable reference, no infinite loop
     - setIsLoading(true) at effect start → skeleton shown immediately
       on every chat switch, eliminates the empty-paint flicker
     - AbortController cancels the in-flight request on fast chat switch
     - isInitialLoad.current = true tells useLayoutEffect to snap to bottom
  ---------------------------------------------------------- */
  useEffect(() => {
    const controller = new AbortController();

    // Show skeleton immediately whenever we switch chats
    setIsLoading(true);

    const getMessages = async () => {
      try {
        setHasMore(false);
        setCursor(null);
        isInitialLoad.current = true; // signal: snap to bottom after set

        const response = await apiClient.post(
          GET_ALL_MESSAGES_ROUTE,
          { id: selectedChatData._id },
          { withCredentials: true, signal: controller.signal },
        );

        if (response.data.messages) {
          setSelectedChatMessages(response.data.messages);
          setHasMore(response.data.hasMore);
          // messages[0] is the oldest after backend reverses — correct cursor
          setCursor(response.data.messages[0]?.timestamp ?? null);
        }
      } catch (error) {
        if (error.name !== "CanceledError") console.log(error);
      } finally {
        setIsLoading(false); // reveal messages — first batch is ready
      }
    };

    const getChannelMessages = async () => {
      try {
        isInitialLoad.current = true;

        const response = await apiClient.get(
          `${GET_CHANNEL_MESSAGES}/${selectedChatData._id}`,
          { withCredentials: true, signal: controller.signal },
        );
        if (response.data.messages) {
          setSelectedChatMessages(response.data.messages);
        }
      } catch (error) {
        if (error.name !== "CanceledError") console.log(error);
      } finally {
        setIsLoading(false); // reveal messages
      }
    };

    if (selectedChatData._id) {
      selectedChatType === "contact" ? getMessages() : getChannelMessages();
    }

    // Cancel in-flight request when chat switches or component unmounts
    return () => controller.abort();
  }, [selectedChatData._id, selectedChatType]);

  /* ---------------------------------------------------------
     CLEAR SEEN SET ON CHAT SWITCH
  ---------------------------------------------------------- */
  useEffect(() => {
    seenEmittedRef.current = new Set();
  }, [selectedChatData._id]);

  /* ---------------------------------------------------------
     LOAD OLDER MESSAGES (scroll-up pagination)
     isFetchingRef (not isFetchingOldMessages state) used as guard
     → useCallback stays stable, scroll listener never re-attaches
  ---------------------------------------------------------- */
  const loadOlderMessages = useCallback(async () => {
    if (!hasMore || isFetchingRef.current || !cursor) return;

    isFetchingRef.current = true;
    setIsFetchingOldMessages(true);

    try {
      const response = await apiClient.post(
        GET_ALL_MESSAGES_ROUTE,
        { id: selectedChatData._id, cursor },
        { withCredentials: true },
      );

      if (response.data.messages?.length) {
        // Capture scroll height BEFORE prepend so we can restore position after
        prevScrollHeight.current = containerRef.current.scrollHeight;
        shouldRestoreScroll.current = true; // signal: restore, not snap to bottom

        prependMessages(response.data.messages);
        setCursor(response.data.messages[0].timestamp);
        setHasMore(response.data.hasMore);
      }
    } catch (error) {
      console.log(error);
    } finally {
      isFetchingRef.current = false;
      setIsFetchingOldMessages(false);
    }
  }, [hasMore, cursor, selectedChatData._id, prependMessages]);

  // Always keep loadOlderRef pointing at the latest callback
  // so the scroll listener never closes over a stale version
  useEffect(() => {
    loadOlderRef.current = loadOlderMessages;
  }, [loadOlderMessages]);

  /* ---------------------------------------------------------
     AUTO-FILL: if initial batch doesn't fill the screen, load more.
     Intentionally excludes loadOlderMessages from deps — only
     triggers when cursor/hasMore change (i.e. after a fetch lands).
  ---------------------------------------------------------- */
  useEffect(() => {
    if (!hasMore || !cursor || isFetchingRef.current) return;
    const el = containerRef.current;
    if (el && el.scrollHeight <= el.clientHeight) {
      loadOlderRef.current?.();
    }
  }, [cursor, hasMore]);

  /* ---------------------------------------------------------
     SCROLL LISTENER — attaches once per selectedChatType change.
     Reads loadOlderRef so it always calls the latest callback
     without needing to re-attach on every render.
  ---------------------------------------------------------- */
  useEffect(() => {
    const handleScroll = () => {
      if (
        containerRef.current?.scrollTop === 0 &&
        selectedChatType === "contact"
      ) {
        loadOlderRef.current?.();
      }
    };

    const el = containerRef.current;
    el?.addEventListener("scroll", handleScroll);
    return () => el?.removeEventListener("scroll", handleScroll);
  }, [selectedChatType]);

  /* ---------------------------------------------------------
     EMIT messageSeen
     dep is selectedChatData._id (string) not the object —
     object changes reference every render → would fire constantly
  ---------------------------------------------------------- */
  useEffect(() => {
    if (
      !socket ||
      !selectedChatMessages.length ||
      selectedChatType !== "contact"
    )
      return;

    const unseenMessages = selectedChatMessages.filter(
      (msg) =>
        msg.sender === selectedChatData._id &&
        msg.status !== "seen" &&
        !seenEmittedRef.current.has(msg._id),
    );

    unseenMessages.forEach((msg) => {
      seenEmittedRef.current.add(msg._id);
      socket.emit("messageSeen", {
        messageId: msg._id,
        senderId: selectedChatData._id,
      });
    });
  }, [selectedChatMessages, selectedChatData._id, socket, selectedChatType]);

  /* ---------------------------------------------------------
     SCROLL RESTORE / AUTO SCROLL
     useLayoutEffect fires BEFORE browser paint → no visible flicker.

     Three cases checked in priority order:
       1. shouldRestoreScroll → older batch prepended, restore height delta
       2. isInitialLoad       → first fetch done, snap to bottom instantly
       3. neither             → real-time message arrived, smooth scroll down
  ---------------------------------------------------------- */
  useLayoutEffect(() => {
    // Case 1: older messages were prepended — restore position so view doesn't jump
    if (shouldRestoreScroll.current && containerRef.current) {
      containerRef.current.scrollTop =
        containerRef.current.scrollHeight - prevScrollHeight.current;
      shouldRestoreScroll.current = false;
      return;
    }

    // Case 2: initial load — snap to bottom instantly (smooth would cause a flash)
    if (isInitialLoad.current) {
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: "instant" });
      }
      isInitialLoad.current = false;
      return;
    }

    // Case 3: new real-time message — smooth scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChatMessages]);

  /* ---------------------------------------------------------
     HELPERS
  ---------------------------------------------------------- */
  const checkIfImage = (filePath) => {
    const imageRegex = /\.(jpg|jpeg|png|gif|bmp|tiff|webp|svg|heic|heif)$/i;
    return imageRegex.test(filePath);
  };

  const downloadFile = async (url) => {
    setIsDownloading(true);
    setFileDownloadProgress(0);

    // imageURL is already absolute (HOST + path).
    // apiClient prepends baseURL → use native fetch for absolute URLs to avoid double-routing
    const isAbsolute = url.startsWith("http://") || url.startsWith("https://");
    const response = isAbsolute
      ? await fetch(url)
          .then((r) => r.blob())
          .then((b) => ({ data: b }))
      : await apiClient.get(url, {
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
     SKELETON — shown while first batch loads.
     Alternates left/right to match the real message layout
     so the transition from skeleton → messages feels seamless.
  ---------------------------------------------------------- */
  const renderSkeleton = () => (
    <div className="flex flex-col gap-4 p-3 sm:p-4 md:p-6 animate-pulse">
      {[180, 120, 220, 90, 160].map((width, i) => (
        <div
          key={i}
          className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
        >
          <div
            className="h-10 rounded-2xl bg-white/5"
            style={{ width: `${width}px` }}
          />
        </div>
      ))}
    </div>
  );

  /* ---------------------------------------------------------
     MESSAGE RENDERER
  ---------------------------------------------------------- */
  const renderMessages = () => {
    if (!Array.isArray(selectedChatMessages)) return null;
    let lastDate = null;

    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;

      return (
        <div key={message._id || index}>
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
      {message.messageType === "text" && (
        <div
          className={`${
            message.sender !== selectedChatData._id
              ? "bg-gradient-to-br from-[#8417ff]/20 to-[#8417ff]/10 text-white border-[#8417ff]/30 shadow-[0_0_15px_rgba(132,23,255,0.15)]"
              : "bg-gradient-to-br from-[#2a2b33]/40 to-[#2a2b33]/20 text-white/90 border-white/10 shadow-lg"
          } border backdrop-blur-sm inline-block p-4 rounded-2xl my-1 max-w-[80%] sm:max-w-[55%] break-words
          transition-all duration-300 hover:scale-[1.02] hover:shadow-xl relative overflow-hidden
          before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity`}
        >
          {message.content}
        </div>
      )}

      {message.messageType === "file" && (
        <div
          className={`${
            message.sender !== selectedChatData._id
              ? "bg-gradient-to-br from-[#8417ff]/20 to-[#8417ff]/10 text-white border-[#8417ff]/30 shadow-[0_0_15px_rgba(132,23,255,0.15)]"
              : "bg-gradient-to-br from-[#2a2b33]/40 to-[#2a2b33]/20 text-white/90 border-white/10 shadow-lg"
          } border backdrop-blur-sm inline-block p-4 rounded-2xl my-1 max-w-[80%] sm:max-w-[55%] break-words
          transition-all duration-300 hover:scale-[1.02] hover:shadow-xl relative overflow-hidden`}
        >
          {checkIfImage(message.fileUrl) ? (
            <div className="relative group">
              <img
                onClick={() => {
                  setImageURL(`${HOST}/${message.fileUrl}`);
                  setShowImage(true);
                }}
                src={`${HOST}/${message.fileUrl}`}
                className="max-h-[250px] sm:max-h-[300px] w-auto rounded-xl cursor-pointer object-contain transition-transform duration-300 group-hover:scale-105"
              />
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

      <div
        className={`text-xs text-gray-500 mt-1 flex items-center gap-1 ${
          message.sender !== selectedChatData._id ? "justify-end" : ""
        }`}
      >
        {message.sender !== selectedChatData._id ? (
          <>
            <span>{moment(message.timestamp).format("LT")}</span>
            {!message.status && (
              <LuClock
                className="text-gray-500 animate-[spin_3s_linear_infinite]"
                style={{ animationTimingFunction: "steps(8, end)" }}
              />
            )}
            {message.status === "sent" && (
              <LuCheck className="text-gray-500" />
            )}
            {message.status === "delivered" && (
              <LuCheckCheck className="text-[#8417ff] animate-[popIn_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)]" />
            )}
            {message.status === "seen" && (
              <LuEye className="text-blue-400 animate-[blink_1.5s_ease-in-out_2]" />
            )}
          </>
        ) : (
          <>
            <span className="text-gray-500 text-xs"></span>
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
      {message.messageType === "text" && (
        <div
          className={`${
            message.sender._id === userInfo.id
              ? "bg-gradient-to-br from-[#8417ff]/20 to-[#8417ff]/10 text-white border-[#8417ff]/30 shadow-[0_0_15px_rgba(132,23,255,0.15)]"
              : "bg-gradient-to-br from-[#2a2b33]/40 to-[#2a2b33]/20 text-white/90 border-white/10 shadow-lg"
          } border backdrop-blur-sm inline-block p-4 rounded-2xl my-1 max-w-[80%] sm:max-w-[55%] break-words ml-11
          transition-all duration-300 hover:scale-[1.02] hover:shadow-xl relative overflow-hidden
          before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity`}
        >
          {message.content}
        </div>
      )}

      {message.messageType === "file" && (
        <div
          className={`${
            message.sender._id === userInfo.id
              ? "bg-gradient-to-br from-[#8417ff]/20 to-[#8417ff]/10 text-white border-[#8417ff]/30 shadow-[0_0_15px_rgba(132,23,255,0.15)]"
              : "bg-gradient-to-br from-[#2a2b33]/40 to-[#2a2b33]/20 text-white/90 border-white/10 shadow-lg"
          } border backdrop-blur-sm inline-block p-4 rounded-2xl my-1 max-w-[80%] sm:max-w-[55%] break-words
          transition-all duration-300 hover:scale-[1.02] hover:shadow-xl relative overflow-hidden`}
        >
          {checkIfImage(message.fileUrl) ? (
            <div className="relative group">
              <img
                onClick={() => {
                  setImageURL(`${HOST}/${message.fileUrl}`);
                  setShowImage(true);
                }}
                src={`${HOST}/${message.fileUrl}`}
                className="max-h-[250px] sm:max-h-[300px] w-auto rounded-xl cursor-pointer object-contain transition-transform duration-300 group-hover:scale-105"
              />
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

      {message.sender._id !== userInfo.id && (
        <div className="flex items-center gap-2 mt-1">
          <Avatar className="h-7 w-7 rounded-full overflow-hidden ring-2 ring-white/10">
            <AvatarImage
              src={`${HOST}/${message.sender.image}`}
              className="object-cover w-full h-full"
            />
            <AvatarFallback
              className={`uppercase h-7 w-7 flex items-center justify-center rounded-full ${getColor(message.sender.color)}`}
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
     RENDER
  ---------------------------------------------------------- */
  return (
    <div
      ref={containerRef}
      className="overflow-y-auto scrollbar-hidden w-full h-full"
    >
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {isLoading ? (
        // Skeleton fills the space while the first batch loads —
        // eliminates the empty-container flash entirely
        renderSkeleton()
      ) : (
        <div className="p-3 sm:p-4 md:p-6">
          {isFetchingOldMessages && (
            <div className="text-center text-gray-400 text-sm py-2 animate-pulse">
              Loading older messages...
            </div>
          )}

          {renderMessages()}

          {/* Scroll anchor — scrollIntoView targets this on initial load and new messages */}
          <div ref={scrollRef} />
        </div>
      )}

      {/* Image lightbox — outside the loading gate, always renderable */}
      {showImage && (
        <div className="fixed z-[1000] top-0 left-0 h-screen w-screen flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <img
            src={imageURL}
            className="max-h-[80vh] max-w-full object-contain rounded-md"
          />
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