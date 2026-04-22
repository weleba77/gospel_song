import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const SecurityItem = ({ icon, label, description, onPress }: any) => (
  <TouchableOpacity 
    onPress={onPress}
    className="flex-row items-center justify-between py-5 border-b border-gray-900"
  >
    <View className="flex-1 mr-4">
      <View className="flex-row items-center mb-1">
        <View className="bg-gray-900 p-2 rounded-lg mr-3">
          <Ionicons name={icon} size={18} color="#10b981" />
        </View>
        <Text className="text-white text-base font-semibold">{label}</Text>
      </View>
      <Text className="text-gray-500 text-xs ml-10">{description}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#444" />
  </TouchableOpacity>
);

export default function PrivacySecurity() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-black">
      <ScrollView className="flex-1 px-6">
        <View className="flex-row items-center pt-16 pb-8">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">Privacy & Security</Text>
        </View>

        <View className="mb-8">
          <Text className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-widest ml-1">Security</Text>
          <View className="bg-gray-900/30 rounded-3xl p-4 border border-gray-900">
            <SecurityItem 
              icon="lock-closed-outline" 
              label="Change Password" 
              description="Update your account password regularly"
              onPress={() => router.back()} // They can change it in the main profile modal
            />
            <SecurityItem 
              icon="shield-checkmark-outline" 
              label="Two-Factor Authentication" 
              description="Add an extra layer of security (Coming Soon)"
              onPress={() => {}}
            />
            <SecurityItem 
              icon="phone-portrait-outline" 
              label="Manage Devices" 
              description="See where you're currently logged in"
              onPress={() => {}}
            />
          </View>
        </View>

        <View className="mb-8">
          <Text className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-widest ml-1">Privacy</Text>
          <View className="bg-gray-900/30 rounded-3xl p-4 border border-gray-900">
            <SecurityItem 
              icon="eye-off-outline" 
              label="Private Session" 
              description="Hide your listening activity from others"
              onPress={() => {}}
            />
            <SecurityItem 
              icon="document-text-outline" 
              label="Privacy Policy" 
              description="Read our data collection and usage policy"
              onPress={() => Linking.openURL('https://example.com/privacy')}
            />
            <SecurityItem 
              icon="trash-outline" 
              label="Delete Account" 
              description="Permanently remove your account and data"
              onPress={() => {}}
            />
          </View>
        </View>

        <Text className="text-gray-500 text-xs text-center mt-4 px-8 leading-5">
          Your security is our priority. We use industry-standard encryption to protect your gospel music library and personal data.
        </Text>
      </ScrollView>
    </View>
  );
}
