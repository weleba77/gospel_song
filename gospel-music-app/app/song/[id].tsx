import { useEffect, useState, useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Audio, AVPlaybackStatus } from "expo-av";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function SongPlayer() {
  const { id } = useLocalSearchParams(); // get song ID
  const [songData, setSongData] = useState<{ title: string; url: string } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const router = useRouter();

  useEffect(() => {
    async function fetchSong() {
      try {
        const res = await fetch(`https://your-backend.com/api/songs/${id}`);
        const data = await res.json();
        setSongData({ title: data.title, url: data.audioUrl });
      } catch (err) {
        console.error(err);
      }
    }
    fetchSong();
  }, [id]);

  useEffect(() => {
    if (!songData?.url) return;

    const loadAndPlay = async () => {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: songData.url },
        { shouldPlay: true }
      );

      soundRef.current = sound;

      // Safe TypeScript callback
      sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if ("isLoaded" in status && status.isLoaded) {
          setIsPlaying(status.isPlaying);
        }
      });
    };

    loadAndPlay();

    return () => {
      soundRef.current?.unloadAsync();
    };
  }, [songData]);

  const togglePlay = async () => {
    if (!soundRef.current) return;
    const status = await soundRef.current.getStatusAsync();

    if ("isLoaded" in status && status.isLoaded) {
      if (status.isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    }
  };

  if (!songData) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-white">Loading song...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black justify-center items-center px-4">
      <Text className="text-white text-2xl font-bold mb-6">{songData.title}</Text>

      <TouchableOpacity
        onPress={togglePlay}
        className="bg-gray-800 p-6 rounded-full mb-4"
      >
        <Ionicons
          name={isPlaying ? "pause" : "play"}
          size={48}
          color="white"
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.back()}
        className="mt-8 p-3 bg-gray-700 rounded-xl"
      >
        <Text className="text-white">Back</Text>
      </TouchableOpacity>
    </View>
  );
}