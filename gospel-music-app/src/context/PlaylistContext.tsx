import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../api";

export interface Song {
  _id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverImage?: string | null;
  category: string;
}

export interface Playlist {
  _id: string;
  name: string;
  songs: Song[];
  owner: string;
  createdAt: string;
}

interface PlaylistContextType {
  playlists: Playlist[];
  loading: boolean;
  fetchPlaylists: () => Promise<void>;
  createPlaylist: (name: string) => Promise<Playlist>;
  addSongToPlaylist: (playlistId: string, songId: string) => Promise<void>;
  removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<void>;
  deletePlaylist: (playlistId: string) => Promise<void>;
}

export const PlaylistContext = createContext<PlaylistContextType>({} as PlaylistContextType);

export const PlaylistProvider = ({ children }: { children: ReactNode }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPlaylists = async () => {
    // Guard: only fetch if a token actually exists in storage
    const token = await AsyncStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      const res = await API.get("/playlists");
      setPlaylists(res.data);
    } catch (err) {
      console.error("Failed to fetch playlists:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Small delay so AuthContext has time to load token from AsyncStorage first
    const timer = setTimeout(() => {
      fetchPlaylists();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const createPlaylist = async (name: string) => {
    const res = await API.post("/playlists", { name });
    const newPlaylist = res.data;
    setPlaylists((prev) => [...prev, { ...newPlaylist, songs: [] }]);
    return newPlaylist;
  };

  const addSongToPlaylist = async (playlistId: string, songId: string) => {
    const res = await API.put(`/playlists/${playlistId}/add-song`, { songId });
    setPlaylists((prev) => prev.map((p) => (p._id === playlistId ? res.data : p)));
  };

  const removeSongFromPlaylist = async (playlistId: string, songId: string) => {
    const res = await API.put(`/playlists/${playlistId}/remove-song`, { songId });
    setPlaylists((prev) => prev.map((p) => (p._id === playlistId ? res.data : p)));
  };

  const deletePlaylist = async (playlistId: string) => {
    await API.delete(`/playlists/${playlistId}`);
    setPlaylists((prev) => prev.filter((p) => p._id !== playlistId));
  };

  return (
    <PlaylistContext.Provider value={{ 
      playlists, loading, fetchPlaylists, createPlaylist, 
      addSongToPlaylist, removeSongFromPlaylist, deletePlaylist 
    }}>
      {children}
    </PlaylistContext.Provider>
  );
};
