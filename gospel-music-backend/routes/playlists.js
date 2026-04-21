import express from "express";
import { auth } from "../middleware/auth.js";
import Playlist from "../models/playlist.js";
import Song from "../models/song.js";

const router = express.Router();

// @route   POST /api/playlists
// @desc    Create a new playlist
router.post("/", auth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Playlist name is required" });

    const newPlaylist = new Playlist({
      name,
      owner: req.user.id,
      songs: []
    });

    const savedPlaylist = await newPlaylist.save();
    res.json(savedPlaylist);
  } catch (err) {
    console.error("Create Playlist Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/playlists
// @desc    Get all playlists for the logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const playlists = await Playlist.find({ owner: req.user.id }).populate("songs");
    
    // Dynamically prepend baseUrl to relative paths in populated songs
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const mappedPlaylists = playlists.map(playlist => {
      const p = playlist.toObject();
      p.songs = p.songs.map(song => ({
        ...song,
        audioUrl: song.audioUrl.startsWith("http") ? song.audioUrl : `${baseUrl}${song.audioUrl}`,
        coverImage: song.coverImage && !song.coverImage.startsWith("http") ? `${baseUrl}${song.coverImage}` : song.coverImage
      }));
      return p;
    });

    res.json(mappedPlaylists);
  } catch (err) {
    console.error("Get Playlists Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/playlists/:id
// @desc    Get a specific playlist
router.get("/:id", auth, async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ _id: req.params.id, owner: req.user.id }).populate("songs");
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });

    // Dynamically prepend baseUrl to relative paths in populated songs
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const p = playlist.toObject();
    p.songs = p.songs.map(song => ({
      ...song,
      audioUrl: song.audioUrl.startsWith("http") ? song.audioUrl : `${baseUrl}${song.audioUrl}`,
      coverImage: song.coverImage && !song.coverImage.startsWith("http") ? `${baseUrl}${song.coverImage}` : song.coverImage
    }));

    res.json(p);
  } catch (err) {
    console.error("Get Playlist Detail Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/playlists/:id/add-song
// @desc    Add a song to a playlist
router.put("/:id/add-song", auth, async (req, res) => {
  try {
    const { songId } = req.body;
    const playlist = await Playlist.findOne({ _id: req.params.id, owner: req.user.id });
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });

    if (playlist.songs.includes(songId)) {
      return res.status(400).json({ message: "Song already in playlist" });
    }

    playlist.songs.push(songId);
    await playlist.save();
    
    const updatedPlaylist = await Playlist.findById(req.params.id).populate("songs");
    res.json(updatedPlaylist);
  } catch (err) {
    console.error("Add Song to Playlist Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/playlists/:id/remove-song
// @desc    Remove a song from a playlist
router.put("/:id/remove-song", auth, async (req, res) => {
  try {
    const { songId } = req.body;
    const playlist = await Playlist.findOne({ _id: req.params.id, owner: req.user.id });
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });

    playlist.songs = playlist.songs.filter(s => s.toString() !== songId);
    await playlist.save();

    const updatedPlaylist = await Playlist.findById(req.params.id).populate("songs");
    res.json(updatedPlaylist);
  } catch (err) {
    console.error("Remove Song Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   DELETE /api/playlists/:id
// @desc    Delete a playlist
router.delete("/:id", auth, async (req, res) => {
  try {
    const playlist = await Playlist.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });
    res.json({ message: "Playlist deleted successfully" });
  } catch (err) {
    console.error("Delete Playlist Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
