import { useContext } from "react";
import { View, Text, TouchableOpacity, Image, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Slider from "@react-native-community/slider";
import { AudioContext } from "../src/context/AudioContext";
import { SavedContext } from "../src/context/SavedContext";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function FullPlayer() {
  const { currentSong, isPlaying, position, duration, togglePlay, seek } = useContext(AudioContext);
  const { isSaved, toggleSave } = useContext(SavedContext);
  const router = useRouter();

  if (!currentSong) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <LinearGradient
      colors={["#4c1d95", "#1e1b4b", "#000000"]}
      className="flex-1"
      style={{ paddingTop: 60 }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 mb-8">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-down" size={28} color="white" />
        </TouchableOpacity>
        
        <View className="items-center">
          <Text className="text-gray-400 text-xs tracking-widest uppercase">Now Playing</Text>
          <Text className="text-white font-bold text-lg" numberOfLines={1}>
            {currentSong.title}
          </Text>
        </View>

        <TouchableOpacity onPress={() => currentSong && toggleSave(currentSong)}>
          <Ionicons
            name={currentSong && isSaved(currentSong._id) ? "heart" : "heart-outline"}
            size={28}
            color={currentSong && isSaved(currentSong._id) ? "#f43f5e" : "white"}
          />
        </TouchableOpacity>
      </View>

      {/* Album Art */}
      <View className="items-center justify-center my-6">
        <View 
          className="bg-gray-800 rounded-3xl"
          style={{
            width: width * 0.85,
            height: width * 0.85,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 20 },
            shadowOpacity: 0.5,
            shadowRadius: 30,
            elevation: 20
          }}
        >
          <Image
            source={{ uri: "https://picsum.photos/800" }} // Placeholder art
            style={{ width: "100%", height: "100%", borderRadius: 24 }}
          />
        </View>
      </View>

      {/* Song Info & More Info icon (matches small red dot in UI) */}
      <View className="px-8 mt-8 flex-row justify-between items-center">
        <View>
          <Text className="text-white text-3xl font-bold mb-1">{currentSong.title}</Text>
          <Text className="text-gray-400 text-lg">{currentSong.artist}</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal-circle" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View className="px-6 mt-10">
        <Slider
          style={{ width: "100%", height: 40 }}
          minimumValue={0}
          maximumValue={duration || 1}
          value={position}
          minimumTrackTintColor="#818cf8"
          maximumTrackTintColor="rgba(255,255,255,0.2)"
          thumbTintColor="#818cf8"
          onSlidingComplete={seek}
        />
        <View className="flex-row justify-between px-2">
          <Text className="text-gray-400 text-xs">{formatTime(position)}</Text>
          <Text className="text-gray-400 text-xs">{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View className="flex-row items-center justify-between px-8 mt-12">
        <TouchableOpacity>
          <Ionicons name="shuffle" size={24} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity>
          <Ionicons name="play-skip-back" size={32} color="white" />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={togglePlay}
          className="bg-indigo-600 w-20 h-20 rounded-full items-center justify-center shadow-lg"
          style={{ shadowColor: "#6366f1", shadowOpacity: 0.4, shadowRadius: 10 }}
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={40} color="white" />
        </TouchableOpacity>

        <TouchableOpacity>
          <Ionicons name="play-skip-forward" size={32} color="white" />
        </TouchableOpacity>

        <TouchableOpacity>
          <Ionicons name="repeat" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Additional Bottom Controls (Optional but matching UI style) */}
      <View className="flex-row justify-between px-12 mt-auto mb-10">
        <TouchableOpacity>
          <Ionicons name="list" size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="share-outline" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}
