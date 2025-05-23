import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import connect_DB from "./config/db.js";
import authRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notifications.route.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "https://full-stack-blogging-social-media.vercel.app",
  "https://full-stack-blogging-soci-git-dac732-9928zaid-gmailcoms-projects.vercel.app",
  "https://full-stack-blogging-social-media-msnwq7jqo.vercel.app",
];


const io = new Server(server, {
  cors: {
    origin:allowedOrigins,
    credentials: true,
  },
});

connect_DB();

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("register", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`Registered user ${userId} with socket ${socket.id}`);
  });

  socket.on("disconnect", () => {
    for (let [uid, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        onlineUsers.delete(uid);
        break;
      }
    }
    console.log("Client disconnected:", socket.id);
  });
});

// Expose IO in app for controllers
app.set("io", io);
app.set("onlineUsers", onlineUsers);

app.use(cors({ 
  origin:allowedOrigins,
   credentials: true
   }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);
app.use("/api/notification", notificationRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
