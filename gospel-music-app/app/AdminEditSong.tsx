import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import API from "../src/api";

export default function AdminEditSong() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const categories = ["Worship", "Praise", "Choir", "Instrumental", "Other"];

  useEffect(() => {
    const fetchSongDetails = async () => {
      try {
        const res = await API.get(`/songs/${id}`);
        const song = res.data;
        setTitle(song.title);
        setArtist(song.artist);
        setCategory(song.category || "Worship");
      } catch (err) {
        Alert.alert("Error", "Failed to load song details");
        router.back();
      } finally {
        setFetching(false);
      }
    };
    fetchSongDetails();
  }, [id]);

  const handleUpdate = async () => {
    if (!title || !artist || !category) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await API.put(`/songs/${id}`, {
        title,
        artist,
        category,
      });

      Alert.alert("Success", "Song updated successfully!");
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to update song");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color="#4f46e5" size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000", padding: 24, paddingTop: 48 }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 32 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={{ color: "white", fontSize: 22, fontWeight: "bold" }}>Edit Song</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={{ color: "#9ca3af", marginBottom: 8 }}>Song Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          style={{ backgroundColor: "#111827", color: "white", padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: "#1f2937" }}
        />

        {/* Artist */}
        <Text style={{ color: "#9ca3af", marginBottom: 8 }}>Artist Name</Text>
        <TextInput
          value={artist}
          onChangeText={setArtist}
          style={{ backgroundColor: "#111827", color: "white", padding: 16, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: "#1f2937" }}
        />

        {/* Category Selector */}
        <Text style={{ color: "#9ca3af", marginBottom: 12 }}>Song Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 32 }}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 20,
                backgroundColor: category === cat ? "#4f46e5" : "#111827",
                marginRight: 10,
                borderWidth: 1,
                borderColor: category === cat ? "#818cf8" : "#374151"
              }}
            >
              <Text style={{ color: category === cat ? "white" : "#9ca3af", fontWeight: "bold" }}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Submit */}
        <TouchableOpacity
          onPress={handleUpdate}
          disabled={loading}
          style={{
            padding: 18, borderRadius: 16,
            backgroundColor: loading ? "#3730a3" : "#4f46e5",
            flexDirection: "row", justifyContent: "center", alignItems: "center"
          }}
        >
          {loading && <ActivityIndicator color="white" style={{ marginRight: 8 }} />}
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
            {loading ? "Updating..." : "Update Details"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
