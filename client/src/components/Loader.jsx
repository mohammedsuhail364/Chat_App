import React from "react";
// helper component
const Dots = ({ white }) => (
  <div className="flex gap-1.5 items-center">
    {[0, 200, 400].map((delay) => (
      <span
        key={delay}
        className="w-1.5 h-1.5 rounded-full animate-bounce"
        style={{
          background: white ? "rgba(255,255,255,0.7)" : "#a78bfa",
          animationDelay: `${delay}ms`,
        }}
      />
    ))}
  </div>
);
function Loader() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#14151a]">
      <div className="flex flex-col items-center gap-8">
        {/* pulsing chat icon */}
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-700 to-purple-400 flex items-center justify-center animate-pulse">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>

        {/* chat bubbles */}
        <div className="flex flex-col gap-2.5 w-52">
          <div className="self-start bg-[#2a2c35] rounded-2xl rounded-bl-sm px-4 py-2.5 ">
            <Dots />
          </div>
          <div className="self-end bg-purple-700 rounded-2xl rounded-br-sm px-4 py-2.5 ">
            <Dots white />
          </div>
          <div className="self-start bg-[#2a2c35] rounded-2xl rounded-bl-sm px-4 py-2.5">
            <Dots />
          </div>
        </div>

        <p className="text-gray-500 text-xs tracking-widest uppercase">
          connecting...
        </p>
      </div>
    </div>
  );
}

export default Loader;
