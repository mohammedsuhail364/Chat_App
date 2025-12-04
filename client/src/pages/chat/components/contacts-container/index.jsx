import { useEffect } from "react";
import NewDM from "./components/new-dm";
import ProfileInfo from "./components/profile-info";
import apiClient from "@/lib/api-client";
import {
  GET_DM_CONTACTS_ROUTES,
  GET_USER_CHANNEL_ROUTES,
} from "@/utils/constants";
import { useAppStore } from "@/store";
import ContactList from "@/components/contact-list";
import CreateChannel from "./components/create-channel";

export const ContactsContainer = () => {
  const {
    setDirectMessagesContacts,
    directMessagesContacts,
    channels,
    setChannels,
  } = useAppStore();

  /* ---------------------------------------------------------
     FETCH DM CONTACTS + CHANNELS ON MOUNT
  ---------------------------------------------------------- */
  useEffect(() => {
    const getContacts = async () => {
      const response = await apiClient.get(GET_DM_CONTACTS_ROUTES, {
        withCredentials: true,
      });

      if (response.data.contacts) {
        setDirectMessagesContacts(response.data.contacts);
      }
    };

    const getChannels = async () => {
      const response = await apiClient.get(GET_USER_CHANNEL_ROUTES, {
        withCredentials: true,
      });

      if (response.data.channels) {
        setChannels(response.data.channels);
      }
    };

    getContacts();
    getChannels();
  }, [setDirectMessagesContacts, setChannels]);

  return (
    <div
      className="
        relative 
        w-full 
        md:w-[35vw] lg:w-[30vw] xl:w-[20vw]
        bg-[#1b1c24]
        border-r-2 border-[#2f303b]
        flex flex-col
        h-screen
      "
    >
      {/* LOGO */}
      <div className="pt-3">
        <Logo />
      </div>

      {/* ---------------------------------------------------------
         DIRECT MESSAGES SECTION
      ---------------------------------------------------------- */}
      <div className="my-5">
        <div className="flex items-center justify-between pr-6 sm:pr-10">
          <Title text="Direct Messages" />
          <NewDM />
        </div>

        <div className="max-h-[35vh] sm:max-h-[40vh] overflow-y-auto scrollbar-hidden pr-2">
          <ContactList contacts={directMessagesContacts} />
        </div>
      </div>

      {/* ---------------------------------------------------------
         CHANNELS SECTION
      ---------------------------------------------------------- */}
      <div className="my-5">
        <div className="flex items-center justify-between pr-6 sm:pr-10">
          <Title text="Channels" />
          <CreateChannel />
        </div>

        <div className="max-h-[35vh] sm:max-h-[40vh] overflow-y-auto scrollbar-hidden pr-2">
          <ContactList contacts={channels} isChannel={true} />
        </div>
      </div>

      {/* ---------------------------------------------------------
         USER PROFILE BAR (BOTTOM)
      ---------------------------------------------------------- */}
      <ProfileInfo />
    </div>
  );
};

/* ---------------------------------------------------------
   LOGO COMPONENT (Sidebar Top Branding)
---------------------------------------------------------- */
const Logo = () => {
  return (
    <div className="flex p-5 justify-start items-center gap-2">
      <svg
        id="logo-38"
        width="78"
        height="32"
        viewBox="0 0 78 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M55.5 0H77.5L58.5 32H36.5L55.5 0Z" fill="#8338ec"></path>
        <path d="M35.5 0H51.5L32.5 32H16.5L35.5 0Z" fill="#975aed"></path>
        <path d="M19.5 0H31.5L12.5 32H0.5L19.5 0Z" fill="#a16ee8"></path>
      </svg>

      <span className="text-xl sm:text-2xl font-semibold text-white">
        Chat Us
      </span>
    </div>
  );
};

/* ---------------------------------------------------------
   TITLE LABEL FOR EACH SECTION
---------------------------------------------------------- */
const Title = ({ text }) => {
  return (
    <h6
      className="
        uppercase 
        tracking-widest 
        text-neutral-400 
        pl-6 sm:pl-10 
        font-light 
        text-opacity-90 
        text-sm
      "
    >
      {text}
    </h6>
  );
};

export default ContactsContainer;
