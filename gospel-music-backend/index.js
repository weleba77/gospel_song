import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from "./routes/auth.js";
import songRoutes from "./routes/songs.js";
import playlistRoutes from "./routes/playlists.js";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Bypass Ngrok Browser Warning (Crucial for Mobile/External access)
app.use((req, res, next) => {
  res.setHeader("ngrok-skip-browser-warning", "true");
  next();
});

// ✅ Serve static files from 'uploads'
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

console.log("MONGO_URI:", process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// ✅ Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected!"))
  .catch(err => console.log(err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/playlists", playlistRoutes);

// Home route
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

// ✅ Increase timeouts for large file uploads (5 minutes)
// This fixes the 'unexpected EOF' error on slow mobile connections/ngrok
server.timeout = 300000; 
server.keepAliveTimeout = 301000; 
server.headersTimeout = 302000;