import bcrypt from "bcrypt"; // or { compare } from "bcrypt" if you prefer
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
const maxAge = 3 * 24 * 60 * 60 * 1000;
const createToken = (email, userId) => {
  return jwt.sign({ email, userId }, process.env.JWT_KEY, {
    expiresIn: maxAge,
  });
};
export const signUp = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send("Email and password is required");
    }
    const user = await User.create({ email, password });
    res.cookie("jwt", createToken(email, user.id), {
      maxAge,
      secure: true,
      sameSite: "None",
    });
    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ error: "Email already exists" });
    }
    console.log(error);
    return res.status(500).send("Internal server Error");
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body; // already validated by Zod

    const user = await User.findOne({ email }).select(
      "+password email profileSetup firstName lastName image color",
    );

    // Prevent user enumeration: same error for "not found" and "wrong password"
    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password",
        details: [
          { field: "body.email", message: "Invalid email or password" },
        ],
      });
    }

    const ok = await bcrypt.compare(password, user.password); // IMPORTANT: await
    if (!ok) {
      return res.status(401).json({
        error: "Invalid email or password",
        details: [
          { field: "body.password", message: "Invalid email or password" },
        ],
      });
    }

    res.cookie("jwt", createToken(user.email, user.id), {
      maxAge,
      httpOnly: true, // IMPORTANT: prevents JS access
      secure: true, // HTTPS only
      sameSite: "None", // required for cross-site cookies
      path: "/",
    });

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        color: user.color,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserInfo = async (req, res) => {
  try {
    const userId = req.userId; // set by verifyToken middleware

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userData = await User.findById(userId)
      .select("email profileSetup firstName lastName image color")
      .lean();

    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      id: userData._id.toString(),
      email: userData.email,
      profileSetup: userData.profileSetup,
      firstName: userData.firstName,
      lastName: userData.lastName,
      image: userData.image,
      color: userData.color,
    });
  } catch (error) {
    console.error("getUserInfo error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export const updateProfile = async (req, res, next) => {
  try {
    const { userId } = req;
    const { firstName, lastName, color } = req.body;
    if (!firstName || !lastName) {
      return req.status(400).send("Firstname and lastname is required");
    }

    const userData = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        color,
        profileSetup: true,
      },
      { new: true, runValidaters: true },
    );
    return res.status(200).json({
      id: userData.id,
      email: userData.email,
      profileSetup: userData.profileSetup,
      firstName: userData.firstName,
      lastName: userData.lastName,
      image: userData.image,
      color: userData.color,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server Error");
  }
};
export const addProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).send("File is required");
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { image: req.file.path, imagePublicId: req.file.filename },
      { new: true, runValidaters: true },
    );
    return res.status(200).json({
      image: updatedUser.image,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server Error");
  }
};
export const removeProfileImage = async (req, res, next) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User Not Found.");
    }
    if (user.imagePublicId) {
      await cloudinary.uploader.destroy(user.imagePublicId); // deletes from Cloudinary
    }

    user.image = null;
    user.imagePublicId = null;
    await user.save();
    return res.status(200).send("Profile image deleted Successfully ");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server Error");
  }
};
export const logOut = async (req, res, next) => {
  try {
    res.cookie("jwt", "", { maxAge: 1, secure: true, sameSite: "None" });
    return res.status(200).send("LogOut successfull");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server Error");
  }
};
