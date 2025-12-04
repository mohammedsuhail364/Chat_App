import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import Lottie from "react-lottie";
import { Input } from "@/components/ui/input";
import { animationDefaultOptions, getColor } from "@/lib/utils";
import apiClient from "@/lib/api-client";
import { HOST, SEARCH_CONTACTS_ROUTES } from "@/utils/constants";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";

import { useAppStore } from "@/store";

const NewDM = () => {
  const { setSelectedChatType, setSelectedChatData } = useAppStore();

  const [openNewContactModel, setOpenNewContactModel] = useState(false);
  const [searchedContacts, setSearchedContacts] = useState([]);

  /* --------------------------------------------------------
     SEARCH CONTACTS API CALL
     Runs on every input change
  --------------------------------------------------------- */
  const searchContacts = async (searchTerm) => {
    try {
      if (searchTerm.length === 0) {
        setSearchedContacts([]);
        return;
      }

      const response = await apiClient.post(
        SEARCH_CONTACTS_ROUTES,
        { searchTerm },
        { withCredentials: true }
      );

      if (response.status === 200 && response.data.contacts) {
        setSearchedContacts(response.data.contacts);
      }
    } catch (error) {
      console.log(error);
    }
  };

  /* --------------------------------------------------------
     SELECT CONTACT → OPEN DM
  --------------------------------------------------------- */
  const selectNewContact = (contact) => {
    setOpenNewContactModel(false);

    setSelectedChatType("contact");
    setSelectedChatData(contact);

    setSearchedContacts([]);
  };

  return (
    <>
      {/* --------------------------------------------------------
         TRIGGER BUTTON → OPEN NEW DM MODAL
      --------------------------------------------------------- */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <FaPlus
              className="text-neutral-400 font-light hover:text-neutral-100 cursor-pointer text-xl transition-all"
              onClick={() => setOpenNewContactModel(true)}
            />
          </TooltipTrigger>

          <TooltipContent className="bg-[#1c1b1e] border-none p-3 text-white">
            Select New Contact
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* --------------------------------------------------------
         NEW DM POPUP MODAL
         Fully responsive version
      --------------------------------------------------------- */}
      <Dialog open={openNewContactModel} onOpenChange={setOpenNewContactModel}>
        <DialogContent
          className="
            bg-[#181920] border-none text-white 
            w-[90%] sm:w-[420px] 
            max-h-[85vh] 
            p-5 flex flex-col gap-4 
            overflow-y-auto rounded-xl
          "
        >
          {/* ---------- HEADER ---------- */}
          <DialogHeader>
            <DialogTitle>Select a Contact</DialogTitle>
            <DialogDescription className="text-gray-400">
              Search by email or name
            </DialogDescription>
          </DialogHeader>

          {/* ---------- SEARCH INPUT ---------- */}
          <Input
            placeholder="Search Contacts"
            className="rounded-lg p-4 bg-[#2c2e3b] border-none text-white"
            onChange={(e) => searchContacts(e.target.value)}
          />

          {/* ---------- SEARCH RESULTS LIST ---------- */}
          {searchedContacts.length > 0 && (
            <ScrollArea className="h-[250px] sm:h-[280px] overflow-y-auto pr-2">
              <div className="flex flex-col gap-4">
                {searchedContacts.map((contact) => (
                  <div
                    key={contact._id}
                    className="
                      flex items-center gap-3 cursor-pointer 
                      hover:bg-[#2c2e3b]/40 p-2 rounded-lg transition
                    "
                    onClick={() => selectNewContact(contact)}
                  >
                    {/* Avatar */}
                    <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                      {contact.image ? (
                        <AvatarImage
                          src={`${HOST}/${contact.image}`}
                          className="object-cover w-full h-full rounded-full"
                        />
                      ) : (
                        <div
                          className={`
                            uppercase h-12 w-12 flex items-center justify-center 
                            text-lg rounded-full border ${getColor(contact.color)}
                          `}
                        >
                          {contact.firstName
                            ? contact.firstName[0]
                            : contact.email[0]}
                        </div>
                      )}
                    </Avatar>

                    {/* Name + Email */}
                    <div className="flex flex-col">
                      <span className="font-medium truncate max-w-[200px]">
                        {contact.firstName && contact.lastName
                          ? `${contact.firstName} ${contact.lastName}`
                          : contact.email}
                      </span>

                      <span className="text-xs text-gray-400 truncate max-w-[200px]">
                        {contact.email}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* ---------- EMPTY STATE (LOTTIE ANIMATION) ---------- */}
          {searchedContacts.length === 0 && (
            <div className="flex flex-col flex-1 justify-center items-center mt-2">
              <Lottie
                isClickToPauseDisabled={true}
                height={100}
                width={100}
                options={animationDefaultOptions}
              />

              <p className="text-white/80 text-center mt-4 text-lg">
                Hi<span className="text-purple-500">!</span> Search new{" "}
                <span className="text-purple-500">contacts.</span>
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewDM;
