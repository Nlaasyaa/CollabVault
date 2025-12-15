import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import skillsRoutes from "./routes/skills.js";
import interestsRoutes from "./routes/interests.js";
import postsRoutes from "./routes/posts.js";
import teamsRoutes from "./routes/teams.js";
import swipesRoutes from "./routes/swipes.js";
import chatRoutes from "./routes/chat.js";
import messagesRoutes from "./routes/messages.js";
import teamMembersRoutes from "./routes/team_members.js";
import connectionsRoutes from "./routes/connections.js";
import teamGroupsRoutes from "./routes/team_groups.js";
import blockedRoutes from "./routes/blocked.js";
import recommendationsRoutes from "./routes/recommendations.js";
import debugRoutes from "./routes/debug.js";
import adminRoutes from "./routes/admin.js";
import feedbackRoutes from "./routes/feedback.js";
import announcementsRoutes from "./routes/announcements.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// =====================
//       ROUTES
// =====================
app.get("/config", (req, res) => {
  res.json({
    allowedDomains: [
      "gmail.com",
      "yahoo.com",
      "outlook.com",
      "university.edu"
    ]
  });
});

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/profile", profileRoutes);
app.use("/skills", skillsRoutes);
app.use("/interests", interestsRoutes);
app.use("/posts", postsRoutes);
app.use("/teams", teamsRoutes);
app.use("/swipes", swipesRoutes);
app.use("/chat", chatRoutes);
app.use("/messages", messagesRoutes);
app.use("/team-members", teamMembersRoutes);
app.use("/connections", connectionsRoutes);
app.use("/team-groups", teamGroupsRoutes);
app.use("/blocked", blockedRoutes);
app.use("/recommendations", recommendationsRoutes);
app.use("/debug", debugRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/announcements", announcementsRoutes);

// =====================
//     SOCKET.IO
// =====================
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
});

// SOCKET EVENTS
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

// =====================
//     SERVER START
// =====================
server.listen(process.env.PORT, () => {
  console.log(`Backend running on port ${process.env.PORT}`);
});
