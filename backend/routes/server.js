import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import skillsRoutes from "./routes/skills.js";
import interestRoutes from "./routes/interests.js";
import postRoutes from "./routes/posts.js";
import teamRoutes from "./routes/teams.js";
import swipeRoutes from "./routes/swipes.js";
import chatRoutes from "./routes/chat.js";
import messageRoutes from "./routes/messages.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Attach routes
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/skills", skillsRoutes);
app.use("/interests", interestRoutes);
app.use("/posts", postRoutes);
app.use("/teams", teamRoutes);
app.use("/swipes", swipeRoutes);
app.use("/chat", chatRoutes);
app.use("/messages", messageRoutes);

// Create HTTP server for socket.io
const server = http.createServer(app);

// SOCKET.IO LOGIC
const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
  });

  socket.on("send_message", (data) => {
    io.to(data.chat_id).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(process.env.PORT, () =>
  console.log(`Backend running on port ${process.env.PORT}`)
);
