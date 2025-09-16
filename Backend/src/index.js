import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";

import dotenv from "dotenv";
import { app, server } from "./lib/socket.js";
dotenv.config();

const PORT = process.env.PORT;
const FRONTEND_LINK = process.env.FRONTEND_LINK;

app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: FRONTEND_LINK,
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

server.listen(PORT, () => {
  console.log(`Server is runing on PORT:${PORT}`);
  connectDB();
});
