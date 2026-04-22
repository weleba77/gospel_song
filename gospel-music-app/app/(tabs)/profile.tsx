import { View, Text, TouchableOpacity, ScrollView, Alert, Platform, ActivityIndicator, Modal, TextInput } from "react-native";
import React, { useContext, useState } from "react";
import { AuthContext } from "../../src/context/AuthContext";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import API from "../../src/api";

// Helper Component for Menu Lines
const ProfileOption = ({ icon, label, onPress }: { icon: any, label: string, onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} className="flex-row items-center justify-between py-4 border-b border-gray-900">
    <View className="flex-row items-center">
      <View className="bg-gray-900 p-2 rounded-lg mr-4">
        <Ionicons name={icon} size={20} color="#aaa" />
      </View>
      <Text className="text-white text-base">{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#444" />
  </TouchableOpacity>
);

const Profile = () => {
  const { user, logout, updateProfileImage } = useContext(AuthContext);
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleLogout = () => {
    const logoutAction = async () => {
      await logout();
      router.replace("/Login");
    };

    if (Platform.OS === 'web') {
      if (confirm("Are you sure you want to sign out?")) {
        logoutAction();
      }
    } else {
      Alert.alert(
        "Logout",
        "Are you sure you want to sign out?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Logout", style: "destructive", onPress: logoutAction }
        ]
      );
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      if (Platform.OS === "web") alert("Please fill in all fields");
      else Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      if (Platform.OS === "web") alert("New passwords do not match");
      else Alert.alert("Error", "New passwords do not match");
      return;
    }

    setIsChangingPassword(true);
    try {
      await API.put("/auth/change-password", {
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });
      if (Platform.OS === "web") alert("Password updated successfully");
      else Alert.alert("Success", "Password updated successfully");
      setIsPasswordModalVisible(false);
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to update password";
      if (Platform.OS === "web") alert(error?.response?.data?.message || "Failed to update password");
      else Alert.alert("Error", msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setUploading(true);
        const image = result.assets[0];
        
        const formData = new FormData();
        if (Platform.OS === "web") {
          const response = await fetch(image.uri);
          const blob = await response.blob();
          formData.append("avatar", blob, "avatar.jpg");
        } else {
          // @ts-ignore
          formData.append("avatar", {
            uri: image.uri,
            name: "avatar.jpg",
            type: "image/jpeg",
          });
        }

        const res = await API.put("/auth/profile-image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        await updateProfileImage(res.data.profileImage);
        if (Platform.OS === "web") alert("Profile image updated!");
        else Alert.alert("Success", "Profile image updated!");
      }
    } catch (error) {
      console.error("Image pick error:", error);
      if (Platform.OS === "web") alert("Failed to update profile image");
      else Alert.alert("Error", "Failed to update profile image");
    } finally {
      setUploading(false);
    }
  };


  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  return (
    <>
      <ScrollView className="flex-1 bg-black">
      <View className="px-6 pt-16 pb-8 items-center border-b border-gray-900">
        {/* Avatar */}
        <View className="relative">
          {user?.profileImage ? (
            <Image
              source={{ uri: user.profileImage }}
              style={{ width: 100, height: 100, borderRadius: 50 }}
            />
          ) : (
            <View 
              style={{ width: 100, height: 100, borderRadius: 50 }}
              className="bg-indigo-600 items-center justify-center border-2 border-gray-800"
            >
              <Text className="text-white text-4xl font-bold">{getInitials(user?.username)}</Text>
            </View>
          )}
          
          <TouchableOpacity 
            onPress={handlePickImage}
            disabled={uploading}
            className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full border-4 border-black"
          >
            {uploading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="camera" size={16} color="white" />
            )}
          </TouchableOpacity>
        </View>

        <Text className="text-white text-2xl font-bold mt-4">{user?.username || "Gospel User"}</Text>
        <Text style={{ color: "#818cf8", fontSize: 12, fontWeight: "bold", marginTop: 2 }}>v1.0.2 - Profile Settings Update</Text>
        <Text className="text-gray-400 text-sm">{user?.email}</Text>

        {/* Role Badge */}
        <View className={`mt-3 px-4 py-1 rounded-full ${user?.role === 'admin' ? 'bg-purple-900/50 border border-purple-500' : 'bg-gray-800 border border-gray-700'}`}>
          <Text className={`${user?.role === 'admin' ? 'text-purple-400' : 'text-gray-400'} text-xs font-bold uppercase tracking-widest`}>
            {user?.role || 'User'}
          </Text>
        </View>
      </View>

      {/* Menu Options */}
      <View className="px-6 mt-8">
        {user?.role === "admin" && (
          <View className="mb-8">
            <Text className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-widest">Admin Actions</Text>
            <ProfileOption icon="add-circle-outline" label="Add New Song" onPress={() => router.push("/AdminAddSong")} />
            <ProfileOption icon="list-outline" label="Manage My Songs" onPress={() => router.push("/AdminManageSongs")} />
          </View>
        )}

        <Text className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-widest">Account Settings</Text>
        <ProfileOption icon="person-outline" label="Edit Profile" onPress={() => router.push("/settings/EditProfile")} />
        <ProfileOption icon="notifications-outline" label="Notifications" onPress={() => router.push("/settings/Notifications")} />
        <ProfileOption icon="shield-checkmark-outline" label="Privacy & Security" onPress={() => router.push("/settings/PrivacySecurity")} />

        <ProfileOption icon="lock-closed-outline" label="Change Password" onPress={() => setIsPasswordModalVisible(true)} />

        <Text className="text-gray-500 text-xs font-bold uppercase mt-8 mb-4 tracking-widest">App Settings</Text>
        <ProfileOption icon="cloud-download-outline" label="Offline Downloads" onPress={() => router.push("/Downloads")} />
        <ProfileOption icon="headset-outline" label="Audio Quality" onPress={() => router.push("/settings/AudioQuality")} />
        <ProfileOption icon="help-circle-outline" label="Help & Support" onPress={() => router.push("/settings/HelpSupport")} />


        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="mt-12 mb-12 bg-red-900/20 border border-red-500/50 p-4 rounded-2xl flex-row items-center justify-center"
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text className="text-red-500 font-bold ml-2">Sign Out</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={isPasswordModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsPasswordModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", padding: 24 }}>
          <View style={{ backgroundColor: "#111827", borderRadius: 24, padding: 24, borderWidth: 1, borderColor: "#1f2937" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>Change Password</Text>
              <TouchableOpacity onPress={() => setIsPasswordModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <Text style={{ color: "#9ca3af", marginBottom: 8 }}>Current Password</Text>
            <TextInput
              secureTextEntry
              placeholder="Enter current password"
              placeholderTextColor="#4b5563"
              value={passwords.current}
              onChangeText={(text) => setPasswords({ ...passwords, current: text })}
              style={{ backgroundColor: "#000", color: "white", padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: "#1f2937" }}
            />

            <Text style={{ color: "#9ca3af", marginBottom: 8 }}>New Password</Text>
            <TextInput
              secureTextEntry
              placeholder="Enter new password"
              placeholderTextColor="#4b5563"
              value={passwords.new}
              onChangeText={(text) => setPasswords({ ...passwords, new: text })}
              style={{ backgroundColor: "#000", color: "white", padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: "#1f2937" }}
            />

            <Text style={{ color: "#9ca3af", marginBottom: 8 }}>Confirm New Password</Text>
            <TextInput
              secureTextEntry
              placeholder="Confirm new password"
              placeholderTextColor="#4b5563"
              value={passwords.confirm}
              onChangeText={(text) => setPasswords({ ...passwords, confirm: text })}
              style={{ backgroundColor: "#000", color: "white", padding: 16, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: "#1f2937" }}
            />

            <TouchableOpacity
              onPress={handleChangePassword}
              disabled={isChangingPassword}
              style={{
                backgroundColor: "#4f46e5",
                padding: 16,
                borderRadius: 16,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center"
              }}
            >
              {isChangingPassword && <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />}
              <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Update Password</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default Profile;