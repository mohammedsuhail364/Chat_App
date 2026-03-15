import { Router } from "express";
import multer from "multer";
import {
  addProfileImage,
  getUserInfo,
  login,
  logOut,
  removeProfileImage,
  signUp,
  updateProfile,
} from "../controllers/authController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema, signUpSchema } from "../schemas/auth.schema.js";
import { loginLimiter, signupLimiter } from "../middlewares/rateLimit.js";
import { storage } from "../config/cloudinary.js";

const authRoutes = Router();
const upload = multer({ storage});

authRoutes.post("/signup", validate(signUpSchema), signupLimiter, signUp);
authRoutes.post("/login",  validate(loginSchema),loginLimiter,login);
authRoutes.get("/user-info", verifyToken, getUserInfo);
authRoutes.post("/update-profile", verifyToken, updateProfile);
authRoutes.post(
  "/add-profile-image",
  verifyToken,
  upload.single("profile-image"),
  addProfileImage,
);
authRoutes.delete("/remove-profile-image", verifyToken, removeProfileImage);
authRoutes.post("/logout", logOut);

export default authRoutes;
