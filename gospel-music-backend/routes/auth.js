// routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { auth } from "../middleware/auth.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Multer storage for avatars
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "avatar-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed!"), false);
    }
  },
});

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, adminSecret } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // SIMPLE ADMIN CHECK: 
    // In production this should be more secure, but for dev we use an env secret.
    console.log("Signup Request - Received Secret:", adminSecret);
    console.log("Expected Admin Secret from Env:", process.env.ADMIN_SECRET);
    
    const role = (adminSecret === process.env.ADMIN_SECRET) ? "admin" : "user";
    console.log("Assigned Role:", role);

    user = new User({ username, email, password: hashedPassword, role });
    await user.save();

    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "fallback_secret", { expiresIn: "10h" });

    res.json({ message: "Signup successful", token, user: { id: user.id, username, email, role: user.role, profileImage: null } });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "fallback_secret", { expiresIn: "10h" });

    res.json({ 
      message: "Login successful", 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role,
        profileImage: user.profileImage 
      } 
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/auth/profile-image
// @desc    Update user profile image
router.put("/profile-image", auth, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const profileImage = `${baseUrl}/uploads/${req.file.filename}`;

    const user = await User.findById(req.user.id);
    user.profileImage = profileImage;
    await user.save();

    res.json({ profileImage });
  } catch (err) {
    console.error("Profile Image Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
router.put("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Please provide current and new passwords" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Change Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;