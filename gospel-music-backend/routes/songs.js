// routes/songs.js
import express from "express";
import { auth, admin } from "../middleware/auth.js";
import Song from "../models/song.js";
import multer from "multer";
import path from "path";
import axios from "axios";
import fs from "fs";
import { pipeline } from "stream/promises";

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
    const { q, category } = req.query;
    if (!q && !category) return res.json([]);

    let query = {};
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { artist: { $regex: q, $options: "i" } },
      ];
    }
    if (category) {
      query.category = category;
    }

    const songs = await Song.find(query).limit(20);
    
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const baseUrl = `${protocol}://${req.get("host")}`;
    const mapSong = (song) => ({
      ...song._doc,
      audioUrl: song.audioUrl.startsWith("http") ? song.audioUrl : `${baseUrl}${song.audioUrl}`,
      coverImage: song.coverImage && !song.coverImage.startsWith("http") ? `${baseUrl}${song.coverImage}` : song.coverImage
    });

    res.json(songs.map(mapSong));
  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/songs/:id
// @desc    Get a single song by ID
router.get("/:id", async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: "Song not found" });

    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const baseUrl = `${protocol}://${req.get("host")}`;
    const formattedSong = {
      ...song._doc,
      audioUrl: song.audioUrl.startsWith("http") ? song.audioUrl : `${baseUrl}${song.audioUrl}`,
      coverImage: song.coverImage && !song.coverImage.startsWith("http") ? `${baseUrl}${song.coverImage}` : song.coverImage
    };

    res.json(formattedSong);
  } catch (err) {
    console.error("Get Song Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/songs
// @desc    Get all songs (optionally filtered by category)
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category) query.category = category;
    
    const songs = await Song.find(query);
    
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const baseUrl = `${protocol}://${req.get("host")}`;
    const mappedSongs = songs.map(song => ({
      ...song._doc,
      audioUrl: song.audioUrl.startsWith("http") ? song.audioUrl : `${baseUrl}${song.audioUrl}`,
      coverImage: song.coverImage && !song.coverImage.startsWith("http") ? `${baseUrl}${song.coverImage}` : song.coverImage
    }));

    res.json(mappedSongs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/songs
// @desc    Add a new song (supports both File upload and URL)
// @access  Admin
router.post("/", auth, admin, upload.fields([{ name: "audioFile", maxCount: 1 }, { name: "coverImage", maxCount: 1 }]), async (req, res) => {
  try {
    const { title, artist, category } = req.body;
    let { audioUrl, coverImageUrl } = req.body;

    // If an audio file was uploaded, generate its URL
    if (req.files?.audioFile?.[0]) {
      audioUrl = `/uploads/${req.files.audioFile[0].filename}`;
    } else if (audioUrl) {
      // If a URL was provided instead of a file, download it to the server
      try {
        console.log("Downloading audio from URL:", audioUrl);
        const response = await axios({
          method: "get",
          url: audioUrl,
          responseType: "stream",
          timeout: 30000, // 30 second timeout
        });

        const contentType = response.headers["content-type"];
        let extension = ".mp3";
        if (contentType) {
          if (contentType.includes("audio/wav")) extension = ".wav";
          else if (contentType.includes("audio/aac")) extension = ".aac";
          else if (contentType.includes("audio/ogg")) extension = ".ogg";
          else if (contentType.includes("audio/flac")) extension = ".flac";
        }

        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const filename = `url-download-${uniqueSuffix}${extension}`;
        const targetPath = path.join("uploads", filename);

        await pipeline(response.data, fs.createWriteStream(targetPath));
        
        // Update audioUrl to point to local hosted file
        audioUrl = `/uploads/${filename}`;
        console.log("Download complete. Local Path:", audioUrl);
      } catch (downloadErr) {
        console.error("Failed to download audio from URL:", downloadErr.message);
        return res.status(400).json({ message: "Failed to download the audio from the provided URL. Please ensure it is a direct link." });
      }
    }
    
    // If a cover image was uploaded, generate its URL
    if (req.files?.coverImage?.[0]) {
      coverImageUrl = `/uploads/${req.files.coverImage[0].filename}`;
    }

    if (!title || !artist || !audioUrl) {
      return res.status(400).json({ message: "Please provide all fields (Title, Artist, and either a File or URL)" });
    }

    const newSong = new Song({ 
      title, 
      artist, 
      category,
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
    
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const baseUrl = `${protocol}://${req.get("host")}`;
    const mappedSongs = songs.map(song => ({
      ...song._doc,
      audioUrl: song.audioUrl.startsWith("http") ? song.audioUrl : `${baseUrl}${song.audioUrl}`,
      coverImage: song.coverImage && !song.coverImage.startsWith("http") ? `${baseUrl}${song.coverImage}` : song.coverImage
    }));

    res.json(mappedSongs);
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