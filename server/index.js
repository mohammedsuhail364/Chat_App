import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import contactsRoutes from './routes/contactRoutes.js';
import setupSocket from './socket.js';
import messagesRoutes from './routes/messageRoutes.js';
import channelRoutes from './routes/channelRoutes.js';
import path from 'path';
dotenv.config();
const app=express();
const port=process.env.PORT || 3001;
const databaseURL=process.env.DATABASE;
const __dirname = path.resolve();
const FRONTEND_URL=process.env.FRONTEND_URL;

app.use(cors({
  origin: FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
}));

app.use('/uploads/profiles',express.static('uploads/profiles'))
app.use('/uploads/files',express.static('uploads/files'))
app.use(cookieParser());
app.use(express.json());
app.use('/api/auth',authRoutes)
app.use('/api/contacts',contactsRoutes)
app.use('/api/messages',messagesRoutes)
app.use('/api/channel',channelRoutes)


if (process.env.NODE_ENV === "production") {
  const clientPath = path.join(__dirname, "../client/dist");

  app.use(express.static(clientPath));

  // SPA fallback (THIS is the key)
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

const server=app.listen(port,()=>{
    console.log(`Server is running at http://localhost:${port}`);

})
setupSocket(server);
mongoose
    .connect(databaseURL)
    .then(()=>console.log('Db connection successful'))
    .catch((err)=>console.log(err));
