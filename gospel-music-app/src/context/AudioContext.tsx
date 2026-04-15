import { createContext, useState, useEffect, ReactNode, useCallback, useContext } from "react";
import { useAudioPlayer, AudioSource, createAudioPlayer } from "expo-audio";
import { DownloadContext } from "./DownloadContext";

interface Song {
  _id: string;
  title: string;
  artist: string;
  audioUrl: string;
}

interface AudioType {
  currentSong: Song | null;
  isPlaying: boolean;
  isLoading: boolean;
  position: number;
  duration: number;
  queue: Song[];
  currentIndex: number;
  playSong: (song: Song) => Promise<void>;
  playQueue: (songs: Song[], startIndex?: number) => Promise<void>;
  togglePlay: () => void;
  seek: (value: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
}

export const AudioContext = createContext<AudioType>({} as AudioType);

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const { downloadedSongs } = useContext(DownloadContext);

  const getEffectiveUrl = useCallback((song: Song) => {
    return downloadedSongs[song._id]?.localAudioUrl || song.audioUrl;
  }, [downloadedSongs]);
  
  const player = useAudioPlayer(currentSong ? getEffectiveUrl(currentSong) : "");

  const playSong = async (song: Song) => {
    try {
      setIsLoading(true);
      setCurrentSong(song);
      setQueue([song]);
      setCurrentIndex(0);
      
      player.replace(getEffectiveUrl(song));
      player.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing song:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const playQueue = async (songs: Song[], startIndex = 0) => {
    try {
      if (songs.length === 0) return;
      setIsLoading(true);
      
      const targetSong = songs[startIndex];
      setCurrentSong(targetSong);
      setQueue(songs);
      setCurrentIndex(startIndex);
      
      player.replace(getEffectiveUrl(targetSong));
      player.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing queue:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextTrack = useCallback(() => {
    if (currentIndex < queue.length - 1) {
      const nextIdx = currentIndex + 1;
      const nextSong = queue[nextIdx];
      setCurrentSong(nextSong);
      setCurrentIndex(nextIdx);
      player.replace(getEffectiveUrl(nextSong));
      player.play();
    }
  }, [currentIndex, queue, player, getEffectiveUrl]);

  const prevTrack = useCallback(() => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      const prevSong = queue[prevIdx];
      setCurrentSong(prevSong);
      setCurrentIndex(prevIdx);
      player.replace(getEffectiveUrl(prevSong));
      player.play();
    }
  }, [currentIndex, queue, player, getEffectiveUrl]);

  useEffect(() => {
    const subscription = player.addListener("playbackStatusUpdate", (status) => {
      setIsPlaying(status.playing);
      setDuration(status.duration || 0);
      setPosition(status.currentTime || 0);
      
      if (status.didJustFinish) {
        if (currentIndex < queue.length - 1) {
          nextTrack();
        } else {
          setIsPlaying(false);
          setPosition(0);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [player, currentIndex, queue, nextTrack]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setPosition(player.currentTime);
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, player]);

  const togglePlay = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  const seek = (value: number) => {
    player.seekTo(value);
    setPosition(value);
  };

  return (
    <AudioContext.Provider value={{ 
      currentSong, isPlaying, isLoading, position, duration, 
      queue, currentIndex,
      playSong, playQueue, togglePlay, seek, nextTrack, prevTrack 
    }}>
      {children}
    </AudioContext.Provider>
  );
};
