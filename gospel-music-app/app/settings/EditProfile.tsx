import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform, ActivityIndicator, ScrollView, KeyboardAvoidingView } from 'react-native';
import { AuthContext } from '../../src/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function EditProfile() {
  const { user, updateProfile } = useContext(AuthContext);
  const router = useRouter();
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!username || !email) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await updateProfile(username, email);
      if (Platform.OS === 'web') alert("Profile updated successfully!");
      else Alert.alert("Success", "Profile updated successfully!");
      router.back();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to update profile";
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-black"
    >
      <ScrollView className="flex-1 px-6">
        <View className="flex-row items-center pt-16 pb-8">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">Edit Profile</Text>
        </View>

        <View className="space-y-6">
          <View>
            <Text className="text-gray-400 text-sm font-bold uppercase mb-2 ml-1">Username</Text>
            <View className="bg-gray-900 rounded-2xl border border-gray-800 flex-row items-center px-4 py-1">
              <Ionicons name="person-outline" size={20} color="#6366f1" />
              <TextInput
                className="flex-1 text-white p-4 text-base"
                placeholder="Username"
                placeholderTextColor="#4b5563"
                value={username}
                onChangeText={setUsername}
              />
            </View>
          </View>

          <View className="mt-6">
            <Text className="text-gray-400 text-sm font-bold uppercase mb-2 ml-1">Email Address</Text>
            <View className="bg-gray-900 rounded-2xl border border-gray-800 flex-row items-center px-4 py-1">
              <Ionicons name="mail-outline" size={20} color="#6366f1" />
              <TextInput
                className="flex-1 text-white p-4 text-base"
                placeholder="Email"
                placeholderTextColor="#4b5563"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleUpdate}
            disabled={loading}
            className="mt-10 bg-indigo-600 p-4 rounded-2xl items-center flex-row justify-center"
          >
            {loading ? (
              <ActivityIndicator color="white" className="mr-2" />
            ) : (
              <Ionicons name="checkmark-circle-outline" size={20} color="white" className="mr-2" />
            )}
            <Text className="text-white font-bold text-lg">Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
