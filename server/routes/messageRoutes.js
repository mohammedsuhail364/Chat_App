import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { getMessages, uploadFile } from "../controllers/messageController.js";
import multer from "multer";
import { fileStorage } from "../config/cloudinary.js";
const messagesRoutes = Router();
const upload = multer({ storage:fileStorage});
messagesRoutes.post("/get-messages", verifyToken, getMessages);
messagesRoutes.post(
  "/upload-file",
  verifyToken,
  upload.single("file"),
  uploadFile
);

export default messagesRoutes;
