import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useContext } from "react";
import { View, ActivityIndicator } from "react-native";
import "./globals.css";
import { AuthProvider, AuthContext } from "../src/context/AuthContext";
import { AudioProvider } from "../src/context/AudioContext";
import { SavedProvider } from "../src/context/SavedContext";
import { PlaylistProvider } from "../src/context/PlaylistContext";
import { DownloadProvider } from "../src/context/DownloadContext";

function RootLayoutNav() {
  const { user, isLoading } = useContext(AuthContext);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'Login' || segments[0] === 'Signup';

    if (!user && !inAuthGroup) {
      // Redirect to the login page
      router.replace('/Login');
    } else if (user && inAuthGroup) {
      // Redirect away from login page to home
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "black" }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="FullPlayer" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="song/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="Login" options={{ headerShown: false }} />
      <Stack.Screen name="Signup" options={{ headerShown: false }} />
      <Stack.Screen name="AdminAddSong" options={{ headerShown: false }} />
      <Stack.Screen name="AdminManageSongs" options={{ headerShown: false }} />
      <Stack.Screen name="playlist/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="Downloads" options={{ headerShown: false }} />
      <Stack.Screen name="settings/EditProfile" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="settings/Notifications" options={{ headerShown: false }} />
      <Stack.Screen name="settings/PrivacySecurity" options={{ headerShown: false }} />
      <Stack.Screen name="settings/AudioQuality" options={{ headerShown: false }} />
      <Stack.Screen name="settings/HelpSupport" options={{ headerShown: false }} />
    </Stack>

  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <DownloadProvider>
        <SavedProvider>
          <PlaylistProvider>
            <AudioProvider>
              <RootLayoutNav />
            </AudioProvider>
          </PlaylistProvider>
        </SavedProvider>
      </DownloadProvider>
    </AuthProvider>
  );
}
