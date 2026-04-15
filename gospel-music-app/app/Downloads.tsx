import { View, Text, FlatList, TouchableOpacity, Image, Alert } from "react-native";
import React, { useContext } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { DownloadContext } from "../src/context/DownloadContext";
import { AudioContext } from "../src/context/AudioContext";
import { useRouter } from "expo-router";

export default function DownloadsScreen() {
  const { downloadedSongs, deleteDownload } = useContext(DownloadContext);
  const { playSong, currentSong, isPlaying } = useContext(AudioContext);
  const router = useRouter();

  const songsList = Object.values(downloadedSongs);

  const handleDelete = (songId: string, title: string) => {
    Alert.alert(
      "Remove Download",
      `Are you sure you want to remove "${title}" from your offline downloads?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive", 
          onPress: () => deleteDownload(songId) 
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-black">
      {/* Header with gradient */}
      <LinearGradient
        colors={["#1e1b4b", "#000000"]}
        style={{ paddingTop: 56, paddingBottom: 24, paddingHorizontal: 24 }}
      >
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-3xl font-bold">Offline Downloads</Text>
        </View>
        <Text className="text-indigo-300 text-sm">
          {songsList.length} {songsList.length === 1 ? "song" : "songs"} downloaded for offline playback
        </Text>
      </LinearGradient>

      {songsList.length === 0 ? (
        /* Empty State */
        <View className="flex-1 items-center justify-center px-8">
          <View className="bg-gray-900 p-8 rounded-3xl items-center">
            <Ionicons name="cloud-download-outline" size={64} color="#4c1d95" />
            <Text className="text-white text-xl font-bold mt-4 text-center">
              No Downloads Yet
            </Text>
            <Text className="text-gray-400 text-center mt-2">
              Tap the download icon on any song to save it for offline listening.
            </Text>
          </View>
        </View>
      ) : (
        /* Songs List */
        <FlatList
          data={songsList}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}
          ListFooterComponent={<View style={{ height: 120 }} />}
          renderItem={({ item }) => {
            const isCurrentSong = currentSong?._id === item._id;
            return (
              <View
                className={`flex-row items-center mb-3 p-3 rounded-2xl ${
                  isCurrentSong
                    ? "bg-indigo-900/40 border border-indigo-700"
                    : "bg-gray-900/60"
                }`}
              >
                <TouchableOpacity
                  onPress={() => playSong(item)}
                  className="flex-row items-center flex-1"
                >
                  {/* Album Art */}
                  <View style={{ position: "relative" }}>
                    <Image
                      source={{ uri: item.localCoverUrl || "https://picsum.photos/200" }}
                      style={{ width: 56, height: 56, borderRadius: 12 }}
                    />
                    {isCurrentSong && (
                      <View
                        style={{
                          position: "absolute",
                          top: 0, left: 0, right: 0, bottom: 0,
                          backgroundColor: "rgba(0,0,0,0.5)",
                          borderRadius: 12,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Ionicons
                          name={isPlaying ? "pause" : "play"}
                          size={20}
                          color="#818cf8"
                        />
                      </View>
                    )}
                  </View>

                  {/* Song Info */}
                  <View className="ml-4 flex-1">
                    <View className="flex-row items-center">
                      <Ionicons name="checkmark-circle" size={12} color="#818cf8" style={{ marginRight: 4 }} />
                      <Text
                        className={`font-bold text-base ${
                          isCurrentSong ? "text-indigo-300" : "text-white"
                        }`}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                    </View>
                    <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={1}>
                      {item.artist}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Delete button */}
                <TouchableOpacity 
                   onPress={() => handleDelete(item._id, item.title)} 
                   className="p-2 ml-2"
                >
                  <Ionicons name="trash-outline" size={20} color="#4b5563" />
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}
