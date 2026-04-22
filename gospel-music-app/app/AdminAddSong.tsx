import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import API from "../src/api";

export default function AdminAddSong() {
  const router = useRouter();
  
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [coverImage, setCoverImage] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [category, setCategory] = useState("Worship");
  const [loading, setLoading] = useState(false);
  
  const categories = ["Worship", "Praise", "Choir", "Instrumental", "Other"];

  const pickAudioFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true,
      });
      if (!result.canceled) {
        setSelectedFile(result.assets[0]);
        setAudioUrl("");
      }
    } catch (err) {
      Alert.alert("Error", "Failed to pick audio file");
    }
  };

  const pickCoverImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled) {
        const asset = result.assets[0];
        const filename = asset.uri.split("/").pop() || "cover.jpg";
        const type = asset.mimeType || "image/jpeg";
        setCoverImage({ uri: asset.uri, name: filename, type });
      }
    } catch (err) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleAddSong = async () => {
    if (!title || !artist || !category || (!audioUrl && !selectedFile)) {
      Alert.alert("Error", "Please fill in all fields and provide an audio file or URL");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("artist", artist);
      formData.append("category", category);

      if (selectedFile) {
        if (Platform.OS === "web") {
          // @ts-ignore
          const fileToUpload = selectedFile.file || (await (await fetch(selectedFile.uri)).blob());
          formData.append("audioFile", fileToUpload, selectedFile.name);
        } else {
          // Normalize URI for mobile
          const uri = Platform.OS === "android" ? selectedFile.uri : selectedFile.uri.replace("file://", "");
          
          // @ts-ignore
          formData.append("audioFile", {
            uri: selectedFile.uri, // React Native handles file:// usually
            name: selectedFile.name || `audio-${Date.now()}.mp3`,
            type: selectedFile.mimeType || "audio/mpeg",
          });
        }
      } else if (audioUrl) {
        formData.append("audioUrl", audioUrl);
      }

      if (coverImage) {
        if (Platform.OS === "web") {
          const response = await fetch(coverImage.uri);
          const blob = await response.blob();
          formData.append("coverImage", blob, coverImage.name);
        } else {
          // @ts-ignore
          formData.append("coverImage", {
            uri: coverImage.uri,
            name: coverImage.name || `cover-${Date.now()}.jpg`,
            type: coverImage.type || "image/jpeg",
          });
        }
      }

      await API.post("/songs", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.alert("Success", "Song added successfully!");
      router.back();
    } catch (err: any) {
      console.error(err);
      const errorMsg = err?.response?.data?.message || err?.response?.data?.detail || err.message || "Failed to add song. Please try again.";
      Alert.alert("Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000", padding: 24, paddingTop: 48 }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 32 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={{ color: "white", fontSize: 22, fontWeight: "bold" }}>Add New Song</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Cover Image Picker */}
        <TouchableOpacity onPress={pickCoverImage} style={{ alignSelf: "center", marginBottom: 24 }}>
          <View style={{
            width: 120, height: 120, borderRadius: 16,
            backgroundColor: "#1f2937", alignItems: "center", justifyContent: "center",
            borderWidth: 2, borderColor: coverImage ? "#818cf8" : "#374151", borderStyle: "dashed"
          }}>
            {coverImage ? (
              <Image source={{ uri: coverImage.uri }} style={{ width: 120, height: 120, borderRadius: 16 }} />
            ) : (
              <View style={{ alignItems: "center" }}>
                <Ionicons name="image-outline" size={36} color="#4b5563" />
                <Text style={{ color: "#6b7280", fontSize: 11, marginTop: 6, textAlign: "center" }}>
                  Tap to add{"\n"}cover art
                </Text>
              </View>
            )}
          </View>
          {coverImage && (
            <Text style={{ color: "#818cf8", fontSize: 11, textAlign: "center", marginTop: 4 }}>
              ✓ Cover selected
            </Text>
          )}
        </TouchableOpacity>

        {/* Title */}
        <Text style={{ color: "#9ca3af", marginBottom: 8 }}>Song Title *</Text>
        <TextInput
          placeholder="e.g. Amazing Grace"
          placeholderTextColor="#4b5563"
          value={title}
          onChangeText={setTitle}
          style={{ backgroundColor: "#111827", color: "white", padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: "#1f2937" }}
        />

        {/* Artist */}
        <Text style={{ color: "#9ca3af", marginBottom: 8 }}>Artist Name *</Text>
        <TextInput
          placeholder="e.g. Tasha Cobbs"
          placeholderTextColor="#4b5563"
          value={artist}
          onChangeText={setArtist}
          style={{ backgroundColor: "#111827", color: "white", padding: 16, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: "#1f2937" }}
        />

        {/* Category Selector */}
        <Text style={{ color: "#9ca3af", marginBottom: 12 }}>Song Category *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
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

        {/* Audio Source */}
        <Text style={{ color: "white", fontSize: 16, fontWeight: "bold", marginBottom: 16 }}>Audio Source *</Text>

        {/* Audio File Picker */}
        <TouchableOpacity
          onPress={pickAudioFile}
          style={{
            padding: 20, borderRadius: 16, marginBottom: 20,
            borderWidth: 2, borderStyle: "dashed",
            borderColor: selectedFile ? "#22c55e" : "#374151",
            backgroundColor: selectedFile ? "rgba(34,197,94,0.08)" : "#111827",
            flexDirection: "row", alignItems: "center", justifyContent: "center"
          }}
        >
          <Ionicons
            name={selectedFile ? "checkmark-circle" : "cloud-upload-outline"}
            size={28}
            color={selectedFile ? "#22c55e" : "#6b7280"}
          />
          <View style={{ marginLeft: 12 }}>
            <Text style={{ color: selectedFile ? "#22c55e" : "white", fontWeight: "bold" }}>
              {selectedFile ? "Audio Ready" : "Select Audio File"}
            </Text>
            {selectedFile && (
              <Text style={{ color: "#9ca3af", fontSize: 11, marginTop: 2 }} numberOfLines={1}>
                {selectedFile.name}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        <Text style={{ color: "#6b7280", textAlign: "center", marginBottom: 20 }}>—— OR ——</Text>

        <Text style={{ color: "#9ca3af", marginBottom: 8 }}>Audio URL</Text>
        <TextInput
          placeholder="https://example.com/song.mp3"
          placeholderTextColor="#4b5563"
          value={audioUrl}
          onChangeText={(text) => { setAudioUrl(text); if (text) setSelectedFile(null); }}
          autoCapitalize="none"
          style={{ backgroundColor: "#111827", color: "white", padding: 16, borderRadius: 12, marginBottom: 32, borderWidth: 1, borderColor: "#1f2937" }}
        />

        {/* Submit */}
        <TouchableOpacity
          onPress={handleAddSong}
          disabled={loading}
          style={{
            padding: 18, borderRadius: 16,
            backgroundColor: loading ? "#3730a3" : "#4f46e5",
            flexDirection: "row", justifyContent: "center", alignItems: "center",
            marginBottom: 40
          }}
        >
          {loading && <ActivityIndicator color="white" style={{ marginRight: 8 }} />}
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
            {loading ? "Uploading..." : "Save Song"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
