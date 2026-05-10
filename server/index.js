import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import authRoutes from "./routes/authRoutes.js";
import channelRoutes from "./routes/channelRoutes.js";
import contactsRoutes from "./routes/contactRoutes.js";
import messagesRoutes from "./routes/messageRoutes.js";
import setupSocket from "./socket.js";
import { apiLimiter } from "./middlewares/rateLimit.js";
import { connectRedis } from "./utils/redis.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 3001;
const databaseURL = process.env.DATABASE;
const __dirname = path.resolve();
const FRONTEND_URL = process.env.FRONTEND_URL;

app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);
// this is for only uptime robot which every five minutes hit on our backend why because my render free tier sleep after 15mins of inactivity 
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});
// loose limiter for everything
app.use("/api", apiLimiter);


app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/channel", channelRoutes);

if (process.env.NODE_ENV === "production") {
  const clientPath = path.join(__dirname, "../client/dist");

  app.use(express.static(clientPath));

  // SPA fallback (THIS is the key)
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

const startServer = async () => {
  try {
    await connectRedis();                    // 1. Redis first
    await mongoose.connect(databaseURL);     // 2. MongoDB second
    console.log("DB connected");

    const server = app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });

    setupSocket(server);                     // 3. Sockets last
  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
};

startServer();
