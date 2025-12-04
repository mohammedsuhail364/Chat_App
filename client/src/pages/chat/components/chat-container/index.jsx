import ChatHeader from "./components/chat-header";
import MessageBar from "./components/message-bar";
import MessageContainer from "./components/message-container";

const ChatContainer = () => {
  return (
    <div
      className="
        flex flex-col 
        bg-[#1c1d25] 
        h-screen w-full 
        md:static md:flex-1
      "
    >
      {/* ---------------------------------------------------
         CHAT HEADER (top bar showing name + close button)
      ---------------------------------------------------- */}
      <ChatHeader />

      {/* ---------------------------------------------------
         MESSAGE AREA (takes all remaining height)
      ---------------------------------------------------- */}
      <div className="flex-1 overflow-hidden">
        <MessageContainer />
      </div>

      {/* ---------------------------------------------------
         MESSAGE INPUT BAR (bottom message composer)
      ---------------------------------------------------- */}
      <MessageBar />
    </div>
  );
};

export default ChatContainer;
