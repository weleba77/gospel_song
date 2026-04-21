import { View, Text, FlatList, TouchableOpacity, Image, TextInput, Modal, ActivityIndicator } from "react-native";
import React, { useContext, useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SavedContext } from "../../src/context/SavedContext";
import { PlaylistContext } from "../../src/context/PlaylistContext";
import { AudioContext } from "../../src/context/AudioContext";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function SavedScreen() {
  const { tab } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<"songs" | "playlists">("songs");
  const { savedSongs, toggleSave } = useContext(SavedContext);
  const { playlists, createPlaylist, loading: playlistsLoading } = useContext(PlaylistContext);
  const { playSong, currentSong, isPlaying } = useContext(AudioContext);
  const router = useRouter();

  // Listen to navigation params to switch tab
  useEffect(() => {
    if (tab === "playlists") {
      setActiveTab("playlists");
    } else if (tab === "songs") {
      setActiveTab("songs");
    }
  }, [tab]);

  // Create Playlist Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    setIsCreating(true);
    try {
      await createPlaylist(newPlaylistName);
      setNewPlaylistName("");
      setIsModalVisible(false);
    } catch (err) {
      console.error("Failed to create playlist:", err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <View className="flex-1 bg-black">
      {/* Header with gradient */}
      <LinearGradient
        colors={["#1e1b4b", "#000000"]}
        style={{ paddingTop: 56, paddingBottom: 16, paddingHorizontal: 24 }}
      >
        <Text className="text-white text-3xl font-bold">Your Library</Text>
        
        {/* Tab Switcher */}
        <View className="flex-row mt-6">
          <TouchableOpacity 
            onPress={() => setActiveTab("songs")}
            className={`mr-6 pb-2 ${activeTab === "songs" ? "border-b-2 border-indigo-500" : ""}`}
          >
            <Text className={`font-bold ${activeTab === "songs" ? "text-white" : "text-gray-500"}`}>
              Saved Songs
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab("playlists")}
            className={`pb-2 ${activeTab === "playlists" ? "border-b-2 border-indigo-500" : ""}`}
          >
            <Text className={`font-bold ${activeTab === "playlists" ? "text-white" : "text-gray-500"}`}>
              Playlists
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {activeTab === "songs" ? (
        /* Saved Songs View */
        savedSongs.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8">
            <View className="bg-gray-900 p-8 rounded-3xl items-center">
              <Ionicons name="heart-dislike-outline" size={64} color="#4c1d95" />
              <Text className="text-white text-xl font-bold mt-4 text-center">No Saved Songs Yet</Text>
              <Text className="text-gray-400 text-center mt-2">Tap the heart icon on any song to save it here.</Text>
            </View>
          </View>
        ) : (
          <FlatList
            data={savedSongs}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}
            ListFooterComponent={<View style={{ height: 120 }} />}
            renderItem={({ item }) => {
              const isCurrentSong = currentSong?._id === item._id;
              return (
                <TouchableOpacity
                  onPress={() => playSong(item)}
                  className={`flex-row items-center mb-3 p-3 rounded-2xl ${
                    isCurrentSong ? "bg-indigo-900/40 border border-indigo-700" : "bg-gray-900/60"
                  }`}
                >
                  <View style={{ position: "relative" }}>
                    <Image source={{ uri: item.coverImage || "https://picsum.photos/200" }} style={{ width: 56, height: 56, borderRadius: 12 }} />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className={`font-bold text-base ${isCurrentSong ? "text-indigo-300" : "text-white"}`} numberOfLines={1}>{item.title}</Text>
                    <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={1}>{item.artist}</Text>
                  </View>
                  <TouchableOpacity onPress={() => toggleSave(item)} className="p-2 ml-2">
                    <Ionicons name="heart" size={22} color="#f43f5e" />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            }}
          />
        )
      ) : (
        /* Playlists View */
        <View className="flex-1">
          <TouchableOpacity 
            onPress={() => setIsModalVisible(true)}
            className="flex-row items-center px-6 py-4 border-b border-gray-900"
          >
            <View className="bg-indigo-600/20 w-12 h-12 rounded-xl items-center justify-center mr-4">
              <Ionicons name="add" size={24} color="#818cf8" />
            </View>
            <Text className="text-white font-bold text-lg">Create New Playlist</Text>
          </TouchableOpacity>

          {playlists.length === 0 ? (
            <View className="flex-1 items-center justify-center p-8">
              <Ionicons name="layers-outline" size={64} color="#1f2937" />
              <Text className="text-gray-500 mt-4 text-center">You haven't created any playlists yet.</Text>
            </View>
          ) : (
            <FlatList
              data={playlists}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12 }}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  onPress={() => router.push(`/playlist/${item._id}`)}
                  className="flex-row items-center mb-4 bg-gray-900/40 p-3 rounded-2xl"
                >
                  <View className="bg-indigo-900/40 w-14 h-14 rounded-xl items-center justify-center">
                    <Ionicons name="musical-notes" size={24} color="#818cf8" />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="text-white font-bold text-lg">{item.name}</Text>
                    <Text className="text-gray-400 text-xs mt-1">{item.songs.length} songs</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#333" />
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      )}

      {/* Create Playlist Modal */}
      <Modal visible={isModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/80 items-center justify-center px-6">
          <View className="bg-gray-900 w-full p-8 rounded-3xl border border-gray-800">
            <Text className="text-white text-2xl font-bold mb-6">New Playlist</Text>
            <TextInput
              placeholder="Playlist name"
              placeholderTextColor="#555"
              className="bg-black text-white p-4 rounded-xl mb-6 border border-gray-800"
              autoFocus
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
            />
            <View className="flex-row justify-end">
              <TouchableOpacity onPress={() => setIsModalVisible(false)} className="mr-6 py-2">
                <Text className="text-gray-500 font-bold text-lg">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleCreatePlaylist}
                disabled={!newPlaylistName.trim() || isCreating}
                className="bg-indigo-600 px-8 py-2 rounded-full"
              >
                {isCreating ? <ActivityIndicator size="small" color="white" /> : <Text className="text-white font-bold text-lg">Create</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={{ height: 100 }} />
    </View>
  );
}