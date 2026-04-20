import mongoose from "mongoose";
import dotenv from "dotenv";
import Song from "./models/song.js";

dotenv.config();

const migrate = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected.");

    const songs = await Song.find({});
    console.log(`Found ${songs.length} songs. Starting migration...`);

    let updatedCount = 0;

    for (const song of songs) {
      let changed = false;

      // Clean audioUrl
      if (song.audioUrl && song.audioUrl.startsWith("http")) {
        const url = new URL(song.audioUrl);
        if (url.pathname.startsWith("/uploads/")) {
          song.audioUrl = url.pathname;
          changed = true;
        }
      }

      // Clean coverImage
      if (song.coverImage && song.coverImage.startsWith("http")) {
        const url = new URL(song.coverImage);
        if (url.pathname.startsWith("/uploads/")) {
          song.coverImage = url.pathname;
          changed = true;
        }
      }

      // Handle missing category (required field)
      if (!song.category) {
        song.category = "Other";
        changed = true;
      }

      if (changed) {
        await song.save();
        updatedCount++;
        console.log(`Updated song: ${song.title}`);
      }
    }

    console.log(`Migration complete! Updated ${updatedCount} songs.`);
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
};

migrate();
