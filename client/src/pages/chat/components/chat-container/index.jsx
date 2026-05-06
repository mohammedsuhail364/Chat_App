import ChatHeader from "./components/chat-header";
import MessageBar from "./components/message-bar";
import MessageContainer from "./components/message-container";

// ChatContainer — remove overflow-auto from the wrapper div
// and add min-h-0 so flex-1 actually constrains the child

const ChatContainer = () => {
  return (
    <div className="flex flex-col bg-[#1c1d25] h-screen w-full md:static md:flex-1">
      <ChatHeader />

      {/* ↓ was: flex-1 overflow-auto — that was the bug */}
      <div className="flex-1 min-h-0">
        <MessageContainer />
      </div>

      <MessageBar />
    </div>
  );
};

export default ChatContainer;
