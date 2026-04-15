import { View, Text, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { PlaylistContext } from "../../src/context/PlaylistContext";
import { AudioContext } from "../../src/context/AudioContext";
import { DownloadContext } from "../../src/context/DownloadContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const DownloadButton = ({ song }: { song: any }) => {
  const { downloadSong, isDownloaded, isDownloading } = useContext(DownloadContext);
  
  if (isDownloading(song._id)) {
    return (
      <View className="items-center justify-center p-2" style={{ width: 40 }}>
        <ActivityIndicator size="small" color="#818cf8" />
      </View>
    );
  }

  return (
    <TouchableOpacity onPress={() => downloadSong(song)} className="p-2">
      <Ionicons 
        name={isDownloaded(song._id) ? "cloud-done" : "cloud-download-outline"} 
        size={20} 
        color={isDownloaded(song._id) ? "#818cf8" : "#444"} 
      />
    </TouchableOpacity>
  );
};

export default function PlaylistDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { playlists, removeSongFromPlaylist, deletePlaylist } = useContext(PlaylistContext);
  const { playQueue, currentSong, isPlaying } = useContext(AudioContext);
  
  const playlist = playlists.find(p => p._id === id);

  if (!playlist) {
    return (
      <View className="flex-1 bg-black items-center justify-center p-6">
        <Text className="text-white text-lg">Playlist not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-indigo-600 px-6 py-2 rounded-full">
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handlePlayAll = () => {
    if (playlist.songs.length > 0) {
      playQueue(playlist.songs, 0);
    }
  };

  const handleDeletePlaylist = () => {
    Alert.alert(
      "Delete Playlist",
      "Are you sure you want to delete this playlist?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            await deletePlaylist(playlist._id);
            router.back();
          } 
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-black">
      <ScrollView stickyHeaderIndices={[0]} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <LinearGradient
          colors={["#312e81", "#000000"]}
          className="pt-16 pb-8 px-6"
        >
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeletePlaylist}>
              <Ionicons name="trash-outline" size={22} color="#f43f5e" />
            </TouchableOpacity>
          </View>

          <View className="items-center">
            <View className="bg-gray-900 w-48 h-48 rounded-3xl items-center justify-center mb-6 shadow-2xl">
              <Ionicons name="musical-notes" size={80} color="#4c1d95" />
            </View>
            <Text className="text-white text-3xl font-bold text-center">{playlist.name}</Text>
            <Text className="text-gray-400 mt-1">{playlist.songs.length} songs</Text>
            
            <TouchableOpacity 
              onPress={handlePlayAll}
              className="bg-indigo-600 flex-row items-center px-10 py-4 rounded-full mt-8 shadow-lg"
            >
              <Ionicons name="play" size={24} color="white" />
              <Text className="text-white font-bold ml-2 text-lg">Play All</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Songs List */}
        <View className="px-4 pt-4">
          {playlist.songs.map((song, index) => {
             const isCurrent = currentSong?._id === song._id;
             return (
               <View key={song._id} className="flex-row items-center mb-4 p-2">
                 <TouchableOpacity 
                   onPress={() => playQueue(playlist.songs, index)}
                   className="flex-row items-center flex-1"
                 >
                   <Text className={`text-gray-500 mr-4 w-4 ${isCurrent ? "text-indigo-400" : ""}`}>
                     {index + 1}
                   </Text>
                   <View className="flex-1">
                     <Text className={`font-bold ${isCurrent ? "text-indigo-400" : "text-white"}`} numberOfLines={1}>
                       {song.title}
                     </Text>
                     <Text className="text-gray-400 text-xs mt-1">{song.artist}</Text>
                   </View>
                 </TouchableOpacity>

                 <View className="flex-row items-center">
                   <DownloadButton song={song} />
                   <TouchableOpacity 
                    onPress={() => removeSongFromPlaylist(playlist._id, song._id)}
                    className="p-2"
                   >
                    <Ionicons name="close-circle-outline" size={20} color="#444" />
                   </TouchableOpacity>
                 </View>
               </View>
             );
          })}
          
          {playlist.songs.length === 0 && (
            <View className="items-center mt-12">
              <Text className="text-gray-500 italic">No songs in this playlist yet.</Text>
            </View>
          )}
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

