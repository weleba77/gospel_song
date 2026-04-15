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
        <TouchableOpacity 
          onPress={() => router.push("/(tabs)/search")}
          className="bg-gray-800 mt-4 p-3 rounded-xl flex-row items-center"
        >
          <Ionicons name="search" size={18} color="#aaa" />
          <Text className="text-gray-400 ml-2">Search songs...</Text>
        </TouchableOpacity>

        {/* Trending */}
        <Text className="text-white text-lg mt-6 mb-2 font-semibold">
          Trending
        </Text>

        {loading ? (
          <ActivityIndicator color="white" className="mt-4" />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {songs.map((song) => (
              <View key={song._id} className="mr-4">
                <TouchableOpacity onPress={() => playSong(song)}>
                  <SongCover uri={song.coverImage} size={140} />
                </TouchableOpacity>
                <View className="flex-row items-center justify-between mt-2 pr-1">
                  <View className="flex-1 mr-2">
                    <Text className="text-white font-medium" numberOfLines={1}>{song.title}</Text>
                    <Text className="text-gray-400 text-xs" numberOfLines={1}>{song.artist}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <DownloadButton song={song} />
                    <TouchableOpacity onPress={() => openPlaylistModal(song)} className="mr-2">
                       <Ionicons name="add-circle-outline" size={20} color="#818cf8" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => toggleSave(song)}>
                      <Ionicons
                        name={isSaved(song._id) ? "heart" : "heart-outline"}
                        size={18}
                        color={isSaved(song._id) ? "#f43f5e" : "#666"}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
            {songs.length === 0 && (
              <Text className="text-gray-500 italic">No songs found. Add some!</Text>
            )}
          </ScrollView>
        )}

        {/* Recently Played */}
        <Text className="text-white text-lg mt-6 mb-2 font-semibold">
          Recently Played
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[1, 2, 3].map((item) => (
            <View key={item} className="mr-4">
              <Image
                source={{ uri: "https://picsum.photos/200" }}
                style={{ width: 120, height: 120, borderRadius: 12 }}
              />
              <Text className="text-white mt-2">Track {item}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Ethiopian Picks */}
        <Text className="text-white text-lg mt-6 mb-2 font-semibold">
          Ethiopian Gospel 🇪🇹
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[1, 2, 3].map((item) => (
            <View key={item} className="mr-4">
              <Image
                source={{ uri: "https://picsum.photos/200" }}
                style={{ width: 140, height: 140, borderRadius: 12 }}
              />
              <Text className="text-white mt-2">Artist {item}</Text>
            </View>
          ))}
        </ScrollView>

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