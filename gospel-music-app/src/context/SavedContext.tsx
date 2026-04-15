import { createContext, useState, useContext, ReactNode, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";

export interface Song {
  _id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverImage?: string | null;
}

interface SavedContextType {
  savedSongs: Song[];
  isSaved: (songId: string) => boolean;
  toggleSave: (song: Song) => void;
}

export const SavedContext = createContext<SavedContextType>({} as SavedContextType);

const STORAGE_KEY = "saved_songs";

export const SavedProvider = ({ children }: { children: ReactNode }) => {
  const [savedSongs, setSavedSongs] = useState<Song[]>([]);

  // Load saved songs from AsyncStorage on startup
  useEffect(() => {
    const loadSaved = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setSavedSongs(JSON.parse(stored));
      } catch (err) {
        console.error("Failed to load saved songs:", err);
      }
    };
    loadSaved();
  }, []);

  // Persist to AsyncStorage whenever savedSongs changes
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(savedSongs));
  }, [savedSongs]);

  const isSaved = useCallback(
    (songId: string) => savedSongs.some((s) => s._id === songId),
    [savedSongs]
  );

  const toggleSave = useCallback((song: Song) => {
    setSavedSongs((prev) => {
      const exists = prev.some((s) => s._id === song._id);
      if (exists) {
        return prev.filter((s) => s._id !== song._id);
      } else {
        return [...prev, song];
      }
    });
  }, []);

  return (
    <SavedContext.Provider value={{ savedSongs, isSaved, toggleSave }}>
      {children}
    </SavedContext.Provider>
  );
};
