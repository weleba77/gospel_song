import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingItem = ({ icon, label, description, value, onValueChange }: any) => (
  <View className="flex-row items-center justify-between py-4 border-b border-gray-900">
    <View className="flex-1 mr-4">
      <View className="flex-row items-center mb-1">
        <View className="bg-gray-900 p-2 rounded-lg mr-3">
          <Ionicons name={icon} size={18} color="#818cf8" />
        </View>
        <Text className="text-white text-base font-semibold">{label}</Text>
      </View>
      <Text className="text-gray-500 text-xs ml-10">{description}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: "#374151", true: "#4f46e5" }}
      thumbColor={value ? "#ffffff" : "#9ca3af"}
    />
  </View>
);

export default function Notifications() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    pushNotifications: true,
    newMusic: true,
    playlistUpdates: false,
    marketing: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('notification_settings');
      if (saved) setSettings(JSON.parse(saved));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleSetting = async (key: string) => {
    const newSettings = { ...settings, [key]: !settings[key as keyof typeof settings] };
    setSettings(newSettings);
    try {
      await AsyncStorage.setItem('notification_settings', JSON.stringify(newSettings));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <ScrollView className="flex-1 px-6">
        <View className="flex-row items-center pt-16 pb-8">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">Notifications</Text>
        </View>

        <View className="bg-gray-900/30 rounded-3xl p-4 border border-gray-900">
          <SettingItem
            icon="notifications-outline"
            label="Push Notifications"
            description="Master switch for all push notifications"
            value={settings.pushNotifications}
            onValueChange={() => toggleSetting('pushNotifications')}
          />
          <SettingItem
            icon="musical-notes-outline"
            label="New Music Alerts"
            description="Get notified when new gospel songs are added"
            value={settings.newMusic}
            onValueChange={() => toggleSetting('newMusic')}
          />
          <SettingItem
            icon="list-outline"
            label="Playlist Updates"
            description="Notifications for changes in your followed playlists"
            value={settings.playlistUpdates}
            onValueChange={() => toggleSetting('playlistUpdates')}
          />
          <SettingItem
            icon="megaphone-outline"
            label="Marketing & Offers"
            description="Receive news about features and special events"
            value={settings.marketing}
            onValueChange={() => toggleSetting('marketing')}
          />
        </View>

        <Text className="text-gray-500 text-xs text-center mt-8 px-8">
          Note: You can also manage notification permissions in your device system settings.
        </Text>
      </ScrollView>
    </View>
  );
}
