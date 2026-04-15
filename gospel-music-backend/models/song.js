import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  audioUrl: { type: String, required: true },
  coverImage: { type: String, default: null },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
});

export default mongoose.model("Song", songSchema);