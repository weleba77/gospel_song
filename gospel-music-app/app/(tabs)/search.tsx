import { View, Text, TextInput, FlatList, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import React, { useState, useEffect, useContext } from "react";
import { Ionicons } from "@expo/vector-icons";
import { AudioContext } from "../../src/context/AudioContext";
import { SavedContext } from "../../src/context/SavedContext";
import API from "../../src/api";
import { DownloadContext } from "../../src/context/DownloadContext";

import AddToPlaylistModal from "../../components/AddToPlaylistModal";

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
        size={22} 
        color={isDownloaded(song._id) ? "#818cf8" : "#666"} 
      />
    </TouchableOpacity>
  );
};

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { playSong } = useContext(AudioContext);
  const { isSaved, toggleSave } = useContext(SavedContext);

  // Playlist Modal State
  const [playlistModalVisible, setPlaylistModalVisible] = useState(false);
  const [songToAddToPlaylist, setSongToAddToPlaylist] = useState<any>(null);

  const openPlaylistModal = (song: any) => {
    setSongToAddToPlaylist(song);
    setPlaylistModalVisible(true);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        searchSongs(query);
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const searchSongs = async (searchQuery: string) => {
    setLoading(true);
    try {
      const res = await API.get(`/songs/search?q=${searchQuery}`);
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-black p-6 pt-16">
      <Text className="text-white text-3xl font-bold mb-6">Search</Text>

      {/* Search Input */}
      <View className="flex-row items-center bg-gray-900 p-4 rounded-xl mb-6 border border-gray-800">
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          placeholder="Search songs or artists..."
          placeholderTextColor="#666"
          value={query}
          onChangeText={setQuery}
          className="flex-1 ml-3 text-white"
          autoFocus={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Results List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="white" />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item: any) => item._id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            query ? (
              <View className="items-center mt-20">
                <Text className="text-gray-500 text-lg">No results found for "{query}"</Text>
              </View>
            ) : (
              <View className="items-center mt-20">
                <Ionicons name="musical-notes" size={60} color="#1e1b4b" />
                <Text className="text-gray-600 mt-4 text-center">
                  Search for your favorite gospel songs and artists
                </Text>
              </View>
            )
          )}
          renderItem={({ item }: { item: any }) => (
            <View className="flex-row items-center mb-4 bg-gray-900/50 p-3 rounded-2xl">
              <TouchableOpacity 
                onPress={() => playSong(item)}
                className="flex-row items-center flex-1"
              >
                <Image
                  source={{ uri: item.coverImage || "https://picsum.photos/200" }}
                  style={{ width: 50, height: 50, borderRadius: 10 }}
                />
                <View className="ml-4 flex-1">
                  <Text className="text-white font-bold" numberOfLines={1}>{item.title}</Text>
                  <Text className="text-gray-400 text-xs" numberOfLines={1}>{item.artist}</Text>
                </View>
              </TouchableOpacity>
              
              <View className="flex-row items-center">
                <DownloadButton song={item} />
                <TouchableOpacity onPress={() => openPlaylistModal(item)} className="p-2">
                  <Ionicons name="add-circle-outline" size={22} color="#818cf8" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleSave(item)} className="p-2">
                  <Ionicons
                    name={isSaved(item._id) ? "heart" : "heart-outline"}
                    size={20}
                    color={isSaved(item._id) ? "#f43f5e" : "#666"}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => playSong(item)} className="ml-1">
                  <Ionicons name="play-circle" size={32} color="#818cf8" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
      
      {/* Add to Playlist Modal */}
      <AddToPlaylistModal
        visible={playlistModalVisible}
        onClose={() => setPlaylistModalVisible(false)}
        song={songToAddToPlaylist}
      />

      {/* Spacer for Mini Player */}
      <View className="h-24" />
    </View>
  );
};

export default Search;