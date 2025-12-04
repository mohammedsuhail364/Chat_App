import { animationDefaultOptions } from "@/lib/utils";
import Lottie from "react-lottie";

export const EmptyChatContainer = () => {
  return (
    <>
      {/* 
        -------------------------------------------------------
        EMPTY CHAT PLACEHOLDER
        -------------------------------------------------------
        • Shows when no chat is selected
        • Hidden only on small screens (mobile)
        • Visible on md+ screens as a filler UI
      */}
      <div
        className="
          hidden md:flex 
          flex-1 
          flex-col items-center justify-center 
          bg-[#1c1d25]
          transition-all duration-700
          text-center
          px-4
        "
      >
        {/* Lottie Animation */}
        <Lottie
          isClickToPauseDisabled={true}
          height={200}
          width={200}
          options={animationDefaultOptions}
        />

        {/* Welcome Text */}
        <div className="
          text-white text-opacity-80 
          flex flex-col items-center 
          gap-5 mt-10
          text-2xl sm:text-3xl lg:text-4xl
          transition-all duration-300
        ">
          <h3>
            Hi<span className="text-purple-500"> ! </span>
            Welcome To
            <span className="text-purple-500"> Synchronus</span> Chat App
            <span className="text-purple-500">.</span>
          </h3>
        </div>
      </div>
    </>
  );
};
