import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store";
import { HOST, LOGOUT_ROUTE } from "@/utils/constants";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { FiEdit2 } from "react-icons/fi";
import { IoPowerSharp } from "react-icons/io5";

import { useNavigate } from "react-router-dom";
import apiClient from "@/lib/api-client";

const ProfileInfo = () => {
  const navigate = useNavigate();
  const { userInfo, setUserInfo } = useAppStore();

  /* -------------------------------------------------------
     LOGOUT FUNCTION
     Opens confirm dialog → API call → Redirect to /auth
  -------------------------------------------------------- */
  const logOut = async () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (!confirmLogout) return;

    try {
      const response = await apiClient.post(LOGOUT_ROUTE, {}, { withCredentials: true });

      if (response.status === 200) {
        setUserInfo(null);
        navigate("/auth");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className="
        absolute bottom-0 left-0 
        w-full h-16 
        bg-[#2a2b33]
        flex items-center justify-between 
        px-4 sm:px-6 md:px-10 
      "
    >
      {/* -------------------------------------------------------
         LEFT SIDE: Avatar + Username
      -------------------------------------------------------- */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Avatar */}
        <Avatar className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
          {userInfo.image ? (
            <AvatarImage
              src={`${HOST}/${userInfo.image}`}
              alt="profile"
              className="object-cover w-full h-full"
            />
          ) : (
            <div
              className={`
                uppercase h-full w-full 
                text-lg border flex items-center justify-center rounded-full
                ${getColor(userInfo.color)}
              `}
            >
              {userInfo.firstName
                ? userInfo.firstName[0]
                : userInfo.email[0]}
            </div>
          )}
        </Avatar>

        {/* Username (truncate to prevent overflow) */}
        <div className="truncate max-w-[150px] sm:max-w-[250px] text-white/90">
          {userInfo.firstName && userInfo.lastName
            ? `${userInfo.firstName} ${userInfo.lastName}`
            : ""}
        </div>
      </div>

      {/* -------------------------------------------------------
         RIGHT SIDE: Edit + Logout
      -------------------------------------------------------- */}
      <div className="flex items-center gap-4 sm:gap-5">
        {/* EDIT PROFILE */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <FiEdit2
                onClick={() => navigate("/profile")}
                className="text-purple-500 text-xl hover:text-purple-300 cursor-pointer transition"
              />
            </TooltipTrigger>

            <TooltipContent className="bg-[#1c1b1e] text-white border-none">
              Edit Profile
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* LOGOUT */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <IoPowerSharp
                onClick={logOut}
                className="text-red-500 text-xl hover:text-red-300 cursor-pointer transition"
              />
            </TooltipTrigger>

            <TooltipContent className="bg-[#1c1b1e] text-white border-none">
              Log Out
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default ProfileInfo;
