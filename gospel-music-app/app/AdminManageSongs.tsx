import { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, Image } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import API from "../src/api";

interface Song {
  _id: string;
  title: string;
  artist: string;
  coverImage?: string | null;
}

export default function AdminManageSongs() {
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMySongs = async () => {
    try {
      const res = await API.get("/songs/my-songs");
      setSongs(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch your songs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMySongs();
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Song",
      "Are you sure you want to delete this song? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              await API.delete(`/songs/${id}`);
              setSongs(songs.filter(s => s._id !== id));
              Alert.alert("Success", "Song deleted successfully");
            } catch (err) {
              Alert.alert("Error", "Failed to delete song");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000", padding: 20, paddingTop: 60 }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 30 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 15 }}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={{ color: "white", fontSize: 22, fontWeight: "bold" }}>Manage My Songs</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#4f46e5" size="large" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 100 }}>
              <Ionicons name="musical-notes-outline" size={64} color="#374151" />
              <Text style={{ color: "#9ca3af", marginTop: 15, fontSize: 16 }}>No songs uploaded yet</Text>
              <TouchableOpacity 
                onPress={() => router.push("/AdminAddSong")}
                style={{ marginTop: 20, backgroundColor: "#4f46e5", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>Add Your First Song</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <View style={{ 
              flexDirection: "row", alignItems: "center", 
              backgroundColor: "#111827", padding: 12, borderRadius: 16, 
              marginBottom: 12, borderWidth: 1, borderColor: "#1f2937" 
            }}>
              {item.coverImage ? (
                <Image source={{ uri: item.coverImage }} style={{ width: 50, height: 50, borderRadius: 8 }} />
              ) : (
                <View style={{ width: 50, height: 50, borderRadius: 8, backgroundColor: "#374151", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="musical-note" size={24} color="#9ca3af" />
                </View>
              )}
              
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: "white", fontWeight: "bold" }} numberOfLines={1}>{item.title}</Text>
                <Text style={{ color: "#9ca3af", fontSize: 12 }} numberOfLines={1}>{item.artist}</Text>
              </View>

              <TouchableOpacity 
                onPress={() => handleDelete(item._id)}
                style={{ padding: 8 }}
              >
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}
