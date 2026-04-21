import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../src/context/AuthContext";
import { AudioContext } from "../../src/context/AudioContext";
import { SavedContext } from "../../src/context/SavedContext";
import { useRouter } from "expo-router";
import API from "../../src/api";

interface Song {
  _id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverImage?: string | null;
  category: string;
}

// Reusable song cover component: real image or music note fallback
function SongCover({ uri, size = 140 }: { uri?: string | null; size?: number }) {
  return uri ? (
    <Image source={{ uri }} style={{ width: size, height: size, borderRadius: 12 }} />
  ) : (
    <View
      style={{
        width: size, height: size, borderRadius: 12,
        backgroundColor: "#1a1a2e",
        alignItems: "center", justifyContent: "center",
      }}
    >
      <Ionicons name="musical-note" size={size * 0.4} color="#4c1d95" />
    </View>
  );
}

import AddToPlaylistModal from "../../components/AddToPlaylistModal";
import { DownloadContext } from "../../src/context/DownloadContext";
import { PlaylistContext } from "../../src/context/PlaylistContext";

const DownloadButton = ({ song }: { song: Song }) => {
  const { downloadSong, isDownloaded, isDownloading, progress } = useContext(DownloadContext);
  
  if (isDownloading(song._id)) {
    return (
      <View className="items-center justify-center mr-2" style={{ width: 24 }}>
        <ActivityIndicator size="small" color="#818cf8" />
      </View>
    );
  }

  return (
    <TouchableOpacity onPress={() => downloadSong(song)} className="mr-2">
      <Ionicons 
        name={isDownloaded(song._id) ? "cloud-done" : "cloud-download-outline"} 
        size={20} 
        color={isDownloaded(song._id) ? "#818cf8" : "#666"} 
      />
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const { user } = useContext(AuthContext);
  const { currentSong, isPlaying, isLoading: isAudioLoading, playSong, togglePlay } = useContext(AudioContext);
  const { isSaved, toggleSave } = useContext(SavedContext);
  const { playlists } = useContext(PlaylistContext);
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  // Playlist Modal State
  const [playlistModalVisible, setPlaylistModalVisible] = useState(false);
  const [songToAddToPlaylist, setSongToAddToPlaylist] = useState<Song | null>(null);

  const openPlaylistModal = (song: Song) => {
    setSongToAddToPlaylist(song);
    setPlaylistModalVisible(true);
  };

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await API.get("/songs");
        setSongs(res.data);
      } catch (err) {
        console.error("Failed to fetch songs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
  }, []);

  return (
    <View className="flex-1 bg-black">
      <ScrollView showsVerticalScrollIndicator={false} className="px-4 pt-12">

        {/* Header */}
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-2xl font-bold">
              Good afternoon 🎧
            </Text>

          </View>

          {/* User avatar or initials */}
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile")}
            style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: "#4c1d95",
              alignItems: "center", justifyContent: "center",
              overflow: "hidden"
            }}
          >
            {user?.profileImage ? (
              <Image 
                source={{ uri: user.profileImage }} 
                style={{ width: "100%", height: "100%" }} 
              />
            ) : (
              <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
                {user?.username?.charAt(0)?.toUpperCase() || "U"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
               {/* 1. Continue Listening (if active) */}
        {currentSong && (
          <>
            <Text className="text-white text-lg mt-6 mb-2 font-semibold">Continue Listening</Text>
            <TouchableOpacity 
              onPress={() => playSong(currentSong)}
              className="bg-gray-900 p-4 rounded-2xl flex-row items-center border border-gray-800"
            >
              <SongCover uri={currentSong.coverImage} size={60} />
              <View className="ml-4 flex-1">
                <Text className="text-white font-bold text-base" numberOfLines={1}>{currentSong.title}</Text>
                <Text className="text-gray-400 text-sm" numberOfLines={1}>{currentSong.artist}</Text>
              </View>
              <Ionicons name="play-circle" size={32} color="#818cf8" />
            </TouchableOpacity>
          </>
        )}

        {/* 2. Your Playlists */}
        <View className="flex-row justify-between items-center mt-8 mb-2">
          <Text className="text-white text-lg font-semibold">Your Playlists</Text>
          <TouchableOpacity onPress={() => router.push("/saved?tab=playlists")}>
            <Text className="text-[#818cf8] text-sm">See all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {playlists.length > 0 ? (
            playlists.map((playlist) => (
              <TouchableOpacity 
                key={playlist._id} 
                className="mr-4"
                onPress={() => router.push({ pathname: "/playlist/[id]", params: { id: playlist._id } })}
              >
                <View className="w-32 h-32 bg-indigo-900 rounded-xl items-center justify-center">
                  <Ionicons name="musical-notes" size={40} color="white" opacity={0.5} />
                </View>
                <Text className="text-white mt-2 font-medium text-sm w-32" numberOfLines={1}>{playlist.name}</Text>
                <Text className="text-gray-400 text-xs">{playlist.songs.length} songs</Text>
              </TouchableOpacity>
            ))
          ) : (
            <TouchableOpacity 
              onPress={() => router.push("/(tabs)/saved?tab=playlists")}
              className="bg-gray-900 h-32 w-48 rounded-xl items-center justify-center border border-gray-800 border-dashed"
            >
              <Ionicons name="add-circle-outline" size={24} color="#666" />
              <Text className="text-gray-500 mt-2 text-sm">Create Playlist</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* 3. Category Sections */}
        {["Trending", "Worship", "Praise", "Choir", "Instrumental", "Other"].map((cat) => {
          // If 'Trending', show all songs. Otherwise, filter strictly by category.
          // Note: songs without a category field will be caught by 'Other' or 'Trending'
          const categorySongs = cat === "Trending" 
            ? songs.slice(0, 10) 
            : songs.filter(s => s.category === cat || (!s.category && cat === "Other"));
          
          return (
            <View key={cat} className="mt-8">
              <Text className="text-white text-xl font-bold mb-4">{cat}</Text>
              
              {categorySongs.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {categorySongs.map((song) => (
                    <View key={song._id} className="mr-4">
                      <TouchableOpacity onPress={() => playSong(song)}>
                        <SongCover uri={song.coverImage} size={140} />
                      </TouchableOpacity>
                      <View className="flex-row items-center justify-between mt-2 pr-1 w-32">
                        <View className="flex-1">
                          <Text className="text-white font-medium text-sm" numberOfLines={1}>{song.title}</Text>
                          <Text className="text-gray-400 text-xs" numberOfLines={1}>{song.artist}</Text>
                        </View>
                        <DownloadButton song={song} />
                      </View>
                      <View className="flex-row mt-1">
                        <TouchableOpacity onPress={() => openPlaylistModal(song)} className="mr-3">
                          <Ionicons name="add-circle-outline" size={18} color="#666" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => toggleSave(song)}>
                          <Ionicons name={isSaved(song._id) ? "heart" : "heart-outline"} size={18} color={isSaved(song._id) ? "#f43f5e" : "#666"} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <View className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 border-dashed items-center">
                  <Ionicons name="musical-notes-outline" size={32} color="#333" />
                  <Text className="text-gray-500 mt-2 italic">No songs available in {cat} yet.</Text>
                </View>
              )}
            </View>
          );
        })}

        <View className="h-24" />
      </ScrollView>

      {/* Add to Playlist Modal */}
      <AddToPlaylistModal
        visible={playlistModalVisible}
        onClose={() => setPlaylistModalVisible(false)}
        song={songToAddToPlaylist}
      />

      {/* Mini Player */}
      {currentSong && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push("/FullPlayer")}
          className="absolute bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-4 py-3 pb-8 flex-row items-center justify-between"
        >
          <View className="flex-row items-center flex-1">
            <Image
              source={{ uri: currentSong.coverImage || "https://picsum.photos/200" }}
              style={{ width: 40, height: 40, borderRadius: 6 }}
            />
            <View className="ml-3 flex-1">
              <Text className="text-white font-bold" numberOfLines={1}>{currentSong.title}</Text>
              <Text className="text-gray-400 text-xs" numberOfLines={1}>{currentSong.artist}</Text>
            </View>
          </View>

          <View className="flex-row items-center">
            {isAudioLoading ? (
              <ActivityIndicator color="white" className="mr-4" />
            ) : (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation(); // Prevent opening full player
                  togglePlay();
                }}
                className="mr-4"
              >
                <Ionicons
                  name={isPlaying ? "pause-circle" : "play-circle"}
                  size={40}
                  color="white"
                />
              </TouchableOpacity>
            )}
            <Ionicons name="play-skip-forward" size={24} color="#666" />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}