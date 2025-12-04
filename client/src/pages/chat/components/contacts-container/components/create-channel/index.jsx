import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/api-client";
import {
  CREATE_CHANNEL_ROUTES,
  GET_ALL_CONTACTS_ROUTES,
} from "@/utils/constants";
import { useAppStore } from "@/store";
import { Button } from "@/components/ui/button";
import MultipleSelector from "@/components/ui/multipleselect";

const CreateChannel = () => {
  const { addChannel } = useAppStore();

  const [allContacts, setAllContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [channelName, setChannelName] = useState("");
  const [newChannelModel, setNewChannelModel] = useState(false);

  /* ---------------------------------------------------------
     FETCH ALL CONTACTS FOR MULTI-SELECT DROPDOWN
  ---------------------------------------------------------- */
  useEffect(() => {
    const getData = async () => {
      const response = await apiClient.get(GET_ALL_CONTACTS_ROUTES, {
        withCredentials: true,
      });
      setAllContacts(response.data.contacts);
    };
    getData();
  }, []);

  /* ---------------------------------------------------------
     CREATE CHANNEL HANDLER
     - Requires: channel name + selected contacts
  ---------------------------------------------------------- */
  const createChannel = async () => {
    try {
      if (channelName.length > 0 && selectedContacts.length > 0) {
        const response = await apiClient.post(
          CREATE_CHANNEL_ROUTES,
          {
            name: channelName,
            members: selectedContacts.map((c) => c.value),
          },
          { withCredentials: true }
        );

        if (response.status === 201) {
          setChannelName("");
          setSelectedContacts([]);
          setNewChannelModel(false);
          addChannel(response.data.channel);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {/* -----------------------------------------------------
         BUTTON (Plus Icon) — Opens Channel Creation Modal
      ------------------------------------------------------ */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <FaPlus
              className="text-neutral-400 hover:text-neutral-100 text-xl cursor-pointer transition"
              onClick={() => setNewChannelModel(true)}
            />
          </TooltipTrigger>

          <TooltipContent className="bg-[#1c1b1e] border-none p-3 text-white">
            Create New Channel
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* -----------------------------------------------------
         NEW CHANNEL POPUP MODAL
      ------------------------------------------------------ */}
      <Dialog open={newChannelModel} onOpenChange={setNewChannelModel}>
        <DialogContent
          className="
            bg-[#181920] 
            border-none text-white 
            w-[90%] sm:w-[450px] 
            max-h-[90vh] 
            flex flex-col gap-5 
            p-6 
            overflow-y-auto
          "
        >
          {/* ---------- HEADER TEXT ---------- */}
          <DialogHeader>
            <DialogTitle>Create a New Channel</DialogTitle>
            <DialogDescription className="text-gray-400">
              Add a name and select members to create your channel.
            </DialogDescription>
          </DialogHeader>

          {/* ---------- INPUT: CHANNEL NAME ---------- */}
          <div className="space-y-1">
            <Input
              placeholder="Channel Name"
              className="rounded-lg p-4 bg-[#2c2e3b] border-none text-white"
              onChange={(e) => setChannelName(e.target.value)}
              value={channelName}
            />
          </div>

          {/* ---------- MULTI-SELECT: CONTACTS ---------- */}
          <div>
            <MultipleSelector
              className="rounded-lg bg-[#2c2e3b] border-none py-2 text-white"
              defaultOptions={allContacts}
              placeholder="Search Contacts"
              onChange={setSelectedContacts}
              emptyIndicator={<p className="text-center text-gray-600">No contacts found</p>}
            />
          </div>

          {/* ---------- BUTTON: CREATE CHANNEL ---------- */}
          <div>
            <Button
              className="w-full bg-purple-700 hover:bg-purple-900 transition"
              onClick={createChannel}
            >
              Create Channel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateChannel;
