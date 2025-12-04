import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { RiCloseFill } from "react-icons/ri";

const ChatHeader = () => {
  const { closeChat, selectedChatData, selectedChatType } = useAppStore();

  return (
    <div className="h-[10vh] border-b-2 border-[#2f303b] flex items-center 
      px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 
      py-4 sm:py-6 md:py-8 
      justify-between w-full"
    >
      <div className="flex items-center justify-between w-full gap-4">

        {/* LEFT SIDE: Avatar + Name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 relative flex-shrink-0">
            {selectedChatType === "contact" ? (
              <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                {selectedChatData.image ? (
                  <AvatarImage
                    src={`${HOST}/${selectedChatData.image}`}
                    alt="profile"
                    className="object-cover w-full h-full bg-black"
                  />
                ) : (
                  <div
                    className={`uppercase h-12 w-12 text-lg border flex items-center justify-center rounded-full ${getColor(
                      selectedChatData.color
                    )}`}
                  >
                    {selectedChatData.firstName
                      ? selectedChatData.firstName[0]
                      : selectedChatData.email[0]}
                  </div>
                )}
              </Avatar>
            ) : (
              <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full">
                #
              </div>
            )}
          </div>

          {/* USER NAME / CHANNEL NAME */}
          <div className="truncate text-sm sm:text-base md:text-lg">
            {selectedChatType === "channel" && selectedChatData.name}
            {selectedChatType === "contact" &&
              (selectedChatData.firstName
                ? `${selectedChatData.firstName} ${selectedChatData.lastName}`
                : selectedChatData.email)}
          </div>
        </div>

        {/* CLOSE BUTTON */}
        <div className="flex items-center justify-center">
          <button
            className="text-neutral-500 hover:text-white transition-all cursor-pointer"
            onClick={closeChat}
          >
            <RiCloseFill className="text-2xl sm:text-3xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
