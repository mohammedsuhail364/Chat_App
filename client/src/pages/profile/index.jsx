import { useAppStore } from "@/store";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";

import { Avatar } from "@radix-ui/react-avatar";
import { AvatarImage } from "@/components/ui/avatar";

import { colors, getColor } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";

import {
  ADD_PROFILE_IMAGE_ROUTE,
  HOST,
  REMOVE_PROFILE_IMAGE_ROUTE,
  UPDATE_PROFILE_ROUTE,
} from "@/utils/constants";

const Profile = () => {
  const { userInfo, setUserInfo } = useAppStore();
  const navigate = useNavigate();

  /* -------------------------------------------------------
     LOCAL STATE
  -------------------------------------------------------- */
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [image, setImage] = useState(null);
  const [hovered, setHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);

  const fileInputRef = useRef(null);

  /* -------------------------------------------------------
     LOAD EXISTING PROFILE DATA
  -------------------------------------------------------- */
  useEffect(() => {
    if (userInfo.profileSetup) {
      setFirstName(userInfo.firstName);
      setLastName(userInfo.lastName);
      setSelectedColor(userInfo.color);
    }
    if (userInfo.image) {
      setImage(`${HOST}/${userInfo.image}`);
    }
  }, [userInfo]);

  /* -------------------------------------------------------
     VALIDATE FORM
  -------------------------------------------------------- */
  const validateProfile = () => {
    if (!firstName) return toast.error("First name is required"), false;
    if (!lastName) return toast.error("Last name is required"), false;
    return true;
  };

  /* -------------------------------------------------------
     SAVE PROFILE CHANGES
  -------------------------------------------------------- */
  const saveChanges = async () => {
    if (!validateProfile()) return;

    try {
      const response = await apiClient.post(
        UPDATE_PROFILE_ROUTE,
        { firstName, lastName, color: selectedColor },
        { withCredentials: true }
      );

      if (response.status === 200) {
        setUserInfo({ ...response.data });
        toast.success("Profile updated successfully");
        navigate("/chat");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /* -------------------------------------------------------
     NAVIGATE BACK
  -------------------------------------------------------- */
  const handleNavigateBack = () => {
    if (userInfo.profileSetup) navigate("/chat");
    else toast.error("Please complete your profile");
  };

  /* -------------------------------------------------------
     IMAGE UPLOAD / DELETE
  -------------------------------------------------------- */
  const handleFileInputClick = () => fileInputRef.current.click();

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("profile-image", file);

    const response = await apiClient.post(ADD_PROFILE_IMAGE_ROUTE, formData, {
      withCredentials: true,
    });

    if (response.status === 200) {
      setUserInfo({ ...userInfo, image: response.data.image });
      toast.success("Image updated successfully");
    }
  };

  const handleDeleteImage = async () => {
    try {
      const response = await apiClient.delete(REMOVE_PROFILE_IMAGE_ROUTE, {
        withCredentials: true,
      });

      if (response.status === 200) {
        setUserInfo({ ...userInfo, image: null });
        setImage(null);
        toast.success("Image removed successfully");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-[#14151a] min-h-screen flex items-center justify-center px-4 py-10">
      <div
        className="
          bg-[#1f2129] w-full max-w-3xl
          shadow-xl rounded-2xl 
          p-6 sm:p-10 
          flex flex-col gap-8
        "
      >
        {/* -------------------------------------------------------
           HEADER SECTION
        -------------------------------------------------------- */}
        <div className="flex items-center gap-4">
          <FaArrowLeft
            onClick={handleNavigateBack}
            className="text-3xl text-white/80 cursor-pointer hover:text-white transition"
          />
          <h2 className="text-2xl font-semibold text-white">Edit Profile</h2>
        </div>

        {/* -------------------------------------------------------
           MAIN GRID 
           - Avatar side
           - Form side
        -------------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* -------------------------------------------------------
             AVATAR + COLOR SELECTOR
          -------------------------------------------------------- */}
          <div className="flex flex-col items-center gap-6">

            {/* Avatar */}
            <div
              className="relative flex items-center justify-center"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              <Avatar className="h-32 w-32 sm:h-40 sm:w-40 md:h-44 md:w-44 rounded-full overflow-hidden">
                {image ? (
                  <AvatarImage
                    src={image}
                    alt="profile"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div
                    className={`
                      uppercase h-full w-full 
                      flex items-center justify-center 
                      text-4xl sm:text-5xl 
                      ${getColor(selectedColor)}
                    `}
                  >
                    {firstName ? firstName[0] : userInfo.email[0]}
                  </div>
                )}
              </Avatar>

              {/* Hover overlay */}
              {hovered && (
                <div
                  onClick={image ? handleDeleteImage : handleFileInputClick}
                  className="
                    absolute inset-0 bg-black/50 
                    flex items-center justify-center 
                    rounded-full cursor-pointer
                  "
                >
                  {image ? (
                    <FaTrash className="text-white text-3xl" />
                  ) : (
                    <FaPlus className="text-white text-3xl" />
                  )}
                </div>
              )}

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageChange}
                accept=".jpg,.jpeg,.png,.webp,.svg"
              />
            </div>

            {/* Color selector */}
            <div className="flex gap-4 flex-wrap justify-center">
              {colors.map((color, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedColor(index)}
                  className={`
                    ${color} h-8 w-8 rounded-full cursor-pointer transition 
                    ${
                      selectedColor === index
                        ? "outline outline-2 outline-white"
                        : ""
                    }
                  `}
                ></div>
              ))}
            </div>
          </div>

          {/* -------------------------------------------------------
             FORM SECTION
          -------------------------------------------------------- */}
          <div className="flex flex-col gap-5 text-white">

            {/* Email (disabled) */}
            <Input
              value={userInfo.email}
              disabled
              className="bg-[#2a2c35] border-none p-4 rounded-lg"
            />

            {/* First Name */}
            <Input
              value={firstName}
              placeholder="First Name"
              onChange={(e) => setFirstName(e.target.value)}
              className="bg-[#2a2c35] border-none p-4 rounded-lg"
            />

            {/* Last Name */}
            <Input
              value={lastName}
              placeholder="Last Name"
              onChange={(e) => setLastName(e.target.value)}
              className="bg-[#2a2c35] border-none p-4 rounded-lg"
            />
          </div>
        </div>

        {/* -------------------------------------------------------
           SAVE BUTTON
        -------------------------------------------------------- */}
        <Button
          onClick={saveChanges}
          className="
            w-full h-14 
            bg-purple-600 hover:bg-purple-800 
            transition rounded-xl 
            font-semibold
          "
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default Profile;
