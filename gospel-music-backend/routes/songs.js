// routes/songs.js
import express from "express";
import { auth, admin } from "../middleware/auth.js";
import Song from "../models/song.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("audio/") || file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only audio or image files are allowed!"), false);
    }
  }
});

// @route   GET /api/songs/search
// @desc    Search for songs by title or artist
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const songs = await Song.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { artist: { $regex: q, $options: "i" } },
      ],
    }).limit(20);

    res.json(songs);
  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/songs
// @desc    Get all songs
router.get("/", async (req, res) => {
  try {
    const songs = await Song.find();
    res.json(songs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/songs
// @desc    Add a new song (supports both File upload and URL)
// @access  Admin
router.post("/", auth, admin, upload.fields([{ name: "audioFile", maxCount: 1 }, { name: "coverImage", maxCount: 1 }]), async (req, res) => {
  try {
    const { title, artist } = req.body;
    let { audioUrl, coverImageUrl } = req.body;
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // If an audio file was uploaded, generate its URL
    if (req.files?.audioFile?.[0]) {
      audioUrl = `${baseUrl}/uploads/${req.files.audioFile[0].filename}`;
    }
    
    // If a cover image was uploaded, generate its URL
    if (req.files?.coverImage?.[0]) {
      coverImageUrl = `${baseUrl}/uploads/${req.files.coverImage[0].filename}`;
    }

    if (!title || !artist || !audioUrl) {
      return res.status(400).json({ message: "Please provide all fields (Title, Artist, and either a File or URL)" });
    }

    const newSong = new Song({ 
      title, 
      artist, 
      audioUrl, 
      coverImage: coverImageUrl || null,
      uploadedBy: req.user.id
    });
    const savedSong = await newSong.save();
    
    res.json(savedSong);
  } catch (err) {
    console.error("Add Song Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/songs/my-songs
// @desc    Get songs uploaded by the current admin
router.get("/my-songs", auth, admin, async (req, res) => {
  try {
    const songs = await Song.find({ uploadedBy: req.user.id });
    res.json(songs);
  } catch (err) {
    console.error("My Songs Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   DELETE /api/songs/:id
// @desc    Delete a song
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: "Song not found" });

    // Check if the admin is the uploader
    if (song.uploadedBy && song.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this song" });
    }

    await song.deleteOne();
    res.json({ message: "Song removed successfully" });
  } catch (err) {
    console.error("Delete Song Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;