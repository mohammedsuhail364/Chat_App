import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";

const ContactList = ({ contacts, isChannel = false }) => {
  const {
    selectedChatData,
    setSelectedChatType,
    setSelectedChatData,
    setSelectedChatMessages,
  } = useAppStore();

  /* -------------------------------------------------------
     HANDLE CONTACT / CHANNEL SELECTION
     - Sets chat type
     - Stores selected chat data in global store
     - Clears messages when switching chats
  -------------------------------------------------------- */
  const handleClick = (contact) => {
    setSelectedChatType(isChannel ? "channel" : "contact");
    setSelectedChatData(contact);

    // Clear previous chat messages if switching to a different conversation
    if (selectedChatData && selectedChatData._id !== contact._id) {
      setSelectedChatMessages([]);
    }
  };

  return (
    <div className="mt-3">
      {contacts.map((contact) => {
        const isActive = selectedChatData?._id === contact._id;

        return (
          <div
            key={contact._id}
            onClick={() => handleClick(contact)}
            className={`
              cursor-pointer 
              transition-all duration-300 
              px-4 sm:px-10 py-2 
              ${
                isActive
                  ? "bg-[#8417ff] text-white"
                  : "hover:bg-white/5 text-neutral-300"
              }
            `}
          >
            <div className="flex items-center gap-3 sm:gap-5">

              {/* -------------------------------------------------------
                 AVATAR (FOR DIRECT MESSAGES)
                 - If contact has image → show image
                 - Else → show colored initial
              -------------------------------------------------------- */}
              {!isChannel && (
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 rounded-full overflow-hidden">
                  {contact.image ? (
                    <AvatarImage
                      src={`${HOST}/${contact.image}`}
                      alt="profile"
                      className="object-cover w-full h-full bg-black"
                    />
                  ) : (
                    <div
                      className={`
                        h-full w-full flex items-center justify-center
                        text-sm sm:text-lg uppercase rounded-full border
                        ${
                          isActive
                            ? "bg-white/20 border-white/70"
                            : getColor(contact.color)
                        }
                      `}
                    >
                      {contact.firstName
                        ? contact.firstName[0]
                        : contact.email[0]}
                    </div>
                  )}
                </Avatar>
              )}

              {/* -------------------------------------------------------
                 ICON FOR CHANNELS
              -------------------------------------------------------- */}
              {isChannel && (
                <div
                  className="
                  bg-white/10 
                  h-8 w-8 sm:h-10 sm:w-10 
                  flex items-center justify-center 
                  rounded-full text-lg
                "
                >
                  #
                </div>
              )}

              {/* -------------------------------------------------------
                 CONTACT / CHANNEL NAME
              -------------------------------------------------------- */}
              <span className="truncate text-sm sm:text-base">
                {isChannel
                  ? contact.name
                  : contact.firstName
                  ? `${contact.firstName} ${contact.lastName}`
                  : contact.email}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ContactList;
