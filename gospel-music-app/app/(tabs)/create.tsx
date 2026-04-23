import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Platform } from "react-native";
import React, { useState, useContext } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { PlaylistContext } from "../../src/context/PlaylistContext";
import { LinearGradient } from "expo-linear-gradient";

export default function CreatePlaylistScreen() {
    const [name, setName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const { createPlaylist } = useContext(PlaylistContext);
    const router = useRouter();

    const handleCreate = async () => {
        if (!name.trim()) return;
        setIsCreating(true);
        try {
            const newPlaylist = await createPlaylist(name);
            setName("");
            router.push(`/playlist/${newPlaylist._id}`);
        } catch (err) {
            console.error("Failed to create playlist:", err);
            if (Platform.OS === 'web') alert("Failed to create playlist");
            else Alert.alert("Error", "Failed to create playlist");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <LinearGradient colors={["#1e1b4b", "#000000"]} className="flex-1 px-8 pt-24">
            <View className="items-center mb-10">
                <View className="bg-indigo-600/20 p-6 rounded-full mb-6">
                    <Ionicons name="add" size={64} color="#818cf8" />
                </View>
                <Text className="text-white text-3xl font-bold">New Playlist</Text>
                <Text className="text-gray-400 mt-2 text-center">Give your playlist a name to start building your collection.</Text>
            </View>

            <View className="space-y-6">
                <TextInput
                    placeholder="Playlist name"
                    placeholderTextColor="#4b5563"
                    value={name}
                    onChangeText={setName}
                    autoFocus
                    className="bg-gray-900/50 text-white p-5 rounded-2xl text-lg border border-gray-800"
                />

                <TouchableOpacity
                    onPress={handleCreate}
                    disabled={!name.trim() || isCreating}
                    className={`mt-6 p-5 rounded-2xl items-center justify-center flex-row ${!name.trim() ? "bg-indigo-900/20 opacity-50" : "bg-indigo-600"
                        }`}
                >
                    {isCreating ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Create Playlist</Text>
                    )}
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}