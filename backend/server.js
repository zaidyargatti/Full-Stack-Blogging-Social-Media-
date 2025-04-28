import mongoose from "mongoose";
import dotenv from "dotenv";
import connect_DB from "./config/db.js";
import express from "express";
import cors from "cors";
import route from "./routes/user.route.js";
import session from 'express-session';
import path from "./routes/post.route.js";
import notify from "./routes/notifications.route.js";
dotenv.config();
const app = express();

connect_DB();

const FRONTEND_ORIGIN = 'http://localhost:5173';

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true, // Allow sending cookies
}));
app.use(express.json());

app.use(session({
    secret: 'your_secret_key', // use a strong secret in prod
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // set to true in production with HTTPS
      sameSite: 'lax', // 'none' if using cross-site cookies with HTTPS
    }
  }));

// USER ROUTES 
app.use("/api/auth", route);

// POST ROUTES 
app.use("/api/post", path);

// NOTIFICATION ROUTES 
app.use("/api/notification", notify);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`The server is listening to http://localhost:${PORT}`);
});

