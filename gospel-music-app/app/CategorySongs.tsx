import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import API from "../src/api";
import { Image } from "expo-image";

interface Song {
  _id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverImage?: string | null;
}

export default function CategorySongs() {
  const { category } = useLocalSearchParams();
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await API.get("/songs", { params: { category } });
        setSongs(res.data);
      } catch (err) {
        console.error("Failed to fetch songs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
  }, [category]);

  return (
    <View style={{ flex: 1, backgroundColor: "#000", padding: 20, paddingTop: 60 }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={{ color: "white", fontSize: 24, fontWeight: "bold" }}>{category}</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="white" style={{ marginTop: 20 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {songs.length > 0 ? (
            songs.map((song) => (
              <TouchableOpacity
                key={song._id}
                onPress={() => router.push({ pathname: "/(tabs)", params: { playSongId: song._id } })}
                style={{ flexDirection: "row", alignItems: "center", marginBottom: 16, backgroundColor: "#111", padding: 12, borderRadius: 12 }}
              >
                <Image
                  source={{ uri: song.coverImage || "https://picsum.photos/200" }}
                  style={{ width: 50, height: 50, borderRadius: 8 }}
                />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ color: "white", fontWeight: "bold" }} numberOfLines={1}>{song.title}</Text>
                  <Text style={{ color: "#aaa", fontSize: 12 }} numberOfLines={1}>{song.artist}</Text>
                </View>
                <Ionicons name="play-circle" size={24} color="#818cf8" />
              </TouchableOpacity>
            ))
          ) : (
            <View style={{ alignItems: "center", marginTop: 40 }}>
              <Ionicons name="musical-notes-outline" size={60} color="#333" />
              <Text style={{ color: "#666", marginTop: 16 }}>No songs found in this category.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
