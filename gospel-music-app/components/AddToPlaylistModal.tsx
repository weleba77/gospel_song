import React, { useContext, useState } from "react";
import { View, Text, Modal, TouchableOpacity, FlatList, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PlaylistContext } from "../src/context/PlaylistContext";

interface Song {
  _id: string;
  title: string;
  artist: string;
}

interface AddToPlaylistModalProps {
  visible: boolean;
  onClose: () => void;
  song: Song | null;
}

export default function AddToPlaylistModal({ visible, onClose, song }: AddToPlaylistModalProps) {
  const { playlists, addSongToPlaylist } = useContext(PlaylistContext);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!song) return;
    setLoadingId(playlistId);
    try {
      await addSongToPlaylist(playlistId, song._id);
      Alert.alert("Success", `Added "${song.title}" to playlist`);
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to add song";
      Alert.alert("Error", msg);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/80 justify-end">
        <View className="bg-gray-900 rounded-t-3xl min-h-[40%] p-6 border-t border-gray-800">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-white text-xl font-bold">Add to Playlist</Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {song && (
             <View className="flex-row items-center mb-6 bg-black/40 p-3 rounded-2xl">
               <View className="bg-indigo-900/40 w-12 h-12 rounded-lg items-center justify-center">
                 <Ionicons name="musical-note" size={20} color="#818cf8" />
               </View>
               <View className="ml-4 flex-1">
                 <Text className="text-white font-bold" numberOfLines={1}>{song.title}</Text>
                 <Text className="text-gray-400 text-xs">{song.artist}</Text>
               </View>
             </View>
          )}

          <FlatList
            data={playlists}
            keyExtractor={(item) => item._id}
            ListEmptyComponent={
              <View className="items-center mt-10">
                <Text className="text-gray-500 italic">No playlists found. Create one in the Library tab.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity 
                onPress={() => handleAddToPlaylist(item._id)}
                disabled={loadingId === item._id}
                className="flex-row items-center justify-between py-4 border-b border-gray-800"
              >
                <View className="flex-row items-center">
                  <Ionicons name="list" size={20} color="#4b5563" className="mr-4" />
                  <Text className="text-white text-lg ml-2">{item.name}</Text>
                </View>
                {loadingId === item._id ? (
                  <ActivityIndicator size="small" color="#818cf8" />
                ) : (
                  <Ionicons name="add-circle-outline" size={24} color="#4b5563" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}
