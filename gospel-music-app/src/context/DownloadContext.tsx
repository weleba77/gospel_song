import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from "react";
import * as FileSystem from "expo-file-system/legacy";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export interface Song {
  _id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverImage?: string | null;
  category: string;
}

export interface DownloadedSong extends Song {
  localAudioUrl: string;
  localCoverUrl: string | null;
}

interface DownloadProgress {
  [songId: string]: number; // 0 to 1
}

interface DownloadContextType {
  downloadedSongs: { [songId: string]: DownloadedSong };
  progress: DownloadProgress;
  isDownloading: (songId: string) => boolean;
  isDownloaded: (songId: string) => boolean;
  downloadSong: (song: Song) => Promise<void>;
  deleteDownload: (songId: string) => Promise<void>;
}

export const DownloadContext = createContext<DownloadContextType>({} as DownloadContextType);

const STORAGE_KEY = "offline_downloads_metadata";
const DOWNLOAD_DIR = `${FileSystem.documentDirectory}downloads/`;

export const DownloadProvider = ({ children }: { children: ReactNode }) => {
  const [downloadedSongs, setDownloadedSongs] = useState<{ [songId: string]: DownloadedSong }>({});
  const [progress, setProgress] = useState<DownloadProgress>({});

  // Ensure download directory exists
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const ensureDir = async () => {
      const dirInfo = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(DOWNLOAD_DIR, { intermediates: true });
      }
    };
    ensureDir();
  }, []);

  // Load metadata from AsyncStorage
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Verify files still exist on disk
          if (Platform.OS !== 'web') {
             const verified: { [songId: string]: DownloadedSong } = {};
             for (const id in parsed) {
               const song = parsed[id];
               const fileInfo = await FileSystem.getInfoAsync(song.localAudioUrl);
               if (fileInfo.exists) {
                 verified[id] = song;
               }
             }
             setDownloadedSongs(verified);
          } else {
             setDownloadedSongs(parsed);
          }
        }
      } catch (err) {
        console.error("Failed to load download metadata:", err);
      }
    };
    loadMetadata();
  }, []);

  // Persist metadata whenever it changes
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(downloadedSongs));
  }, [downloadedSongs]);

  const isDownloading = useCallback((songId: string) => progress[songId] !== undefined, [progress]);
  const isDownloaded = useCallback((songId: string) => !!downloadedSongs[songId], [downloadedSongs]);

  const downloadSong = async (song: Song) => {
    if (Platform.OS === 'web') {
      alert("Downloads are only available on mobile devices.");
      return;
    }
    if (isDownloaded(song._id) || isDownloading(song._id)) return;

    try {
      setProgress(prev => ({ ...prev, [song._id]: 0 }));

      // 1. Download Audio
      const audioExt = song.audioUrl.split('.').pop() || 'mp3';
      const audioLocalPath = `${DOWNLOAD_DIR}${song._id}.${audioExt}`;
      
      const audioDownload = FileSystem.createDownloadResumable(
        song.audioUrl,
        audioLocalPath,
        {},
        (p) => {
          const ratio = p.totalBytesWritten / p.totalBytesExpectedToWrite;
          setProgress(prev => ({ ...prev, [song._id]: ratio }));
        }
      );

      const audioResult = await audioDownload.downloadAsync();
      if (!audioResult) throw new Error("Audio download failed");

      // 2. Download Cover if exists
      let localCoverUrl = null;
      if (song.coverImage) {
        const coverExt = song.coverImage.split('.').pop() || 'jpg';
        const coverLocalPath = `${DOWNLOAD_DIR}${song._id}_cover.${coverExt}`;
        const coverResult = await FileSystem.downloadAsync(song.coverImage, coverLocalPath);
        localCoverUrl = coverResult.uri;
      }

      // 3. Update State
      const downloadedSong: DownloadedSong = {
        ...song,
        localAudioUrl: audioResult.uri,
        localCoverUrl
      };

      setDownloadedSongs(prev => ({ ...prev, [song._id]: downloadedSong }));
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download song. Please check your connection.");
    } finally {
      setProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[song._id];
        return newProgress;
      });
    }
  };

  const deleteDownload = async (songId: string) => {
    try {
      const song = downloadedSongs[songId];
      if (!song) return;

      if (Platform.OS !== 'web') {
        await FileSystem.deleteAsync(song.localAudioUrl, { idempotent: true });
        if (song.localCoverUrl) {
          await FileSystem.deleteAsync(song.localCoverUrl, { idempotent: true });
        }
      }

      setDownloadedSongs(prev => {
        const next = { ...prev };
        delete next[songId];
        return next;
      });
    } catch (err) {
      console.error("Delete download failed:", err);
    }
  };

  return (
    <DownloadContext.Provider value={{ 
      downloadedSongs, progress, isDownloading, isDownloaded, 
      downloadSong, deleteDownload 
    }}>
      {children}
    </DownloadContext.Provider>
  );
};
