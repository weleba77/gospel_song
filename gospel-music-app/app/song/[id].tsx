import { useEffect, useState, useContext } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AudioContext, Song } from "../../src/context/AudioContext";
import API from "../../src/api";

export default function SongPlayer() {
  const { id } = useLocalSearchParams();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { playSong, isPlaying, currentSong, togglePlayback } = useContext(AudioContext);
  const router = useRouter();

  useEffect(() => {
    async function fetchSong() {
      try {
        const res = await API.get(`/songs/${id}`);
        // Ensure the API response structure matches our Song interface
        setSong(res.data);
      } catch (err) {
        console.error("Failed to fetch song:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSong();
  }, [id]);

  const handlePlay = () => {
    if (song) {
      if (currentSong?._id === song._id) {
        togglePlayback();
      } else {
        playSong(song);
      }
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (!song) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-white text-lg">Song not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 p-3 bg-gray-800 rounded-lg">
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isCurrentSong = currentSong?._id === song._id;

  return (
    <View className="flex-1 bg-black justify-center items-center px-4">
      {/* Header */}
      <View className="absolute top-12 left-6">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-down" size={32} color="white" />
        </TouchableOpacity>
      </View>

      {/* Album Art Placeholder/Image */}
      <View className="w-64 h-64 bg-gray-900 rounded-2xl mb-12 items-center justify-center shadow-2xl">
        {song.coverImage ? (
          <Image source={{ uri: song.coverImage }} className="w-full h-full rounded-2xl" />
        ) : (
          <Ionicons name="musical-notes" size={100} color="#374151" />
        )}
      </View>

      <Text className="text-white text-3xl font-bold mb-2 text-center">{song.title}</Text>
      <Text className="text-gray-400 text-xl mb-12 text-center">{song.artist}</Text>

      <TouchableOpacity
        onPress={handlePlay}
        className="bg-indigo-600 p-8 rounded-full shadow-lg"
      >
        <Ionicons
          name={isCurrentSong && isPlaying ? "pause" : "play"}
          size={48}
          color="white"
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/FullPlayer")}
        className="mt-12"
      >
        <Text className="text-indigo-400 font-semibold text-lg">Open Player Controls</Text>
      </TouchableOpacity>
    </View>
  );
}