import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const FAQItem = ({ question, answer }: any) => (
  <View className="mb-6">
    <Text className="text-white text-base font-bold mb-2">{question}</Text>
    <Text className="text-gray-400 text-sm leading-5">{answer}</Text>
  </View>
);

const ContactButton = ({ icon, label, color, onPress }: any) => (
  <TouchableOpacity 
    onPress={onPress}
    style={{ backgroundColor: color + '20', borderColor: color + '50' }}
    className="flex-row items-center p-4 rounded-2xl border mb-4"
  >
    <Ionicons name={icon} size={20} color={color} />
    <Text style={{ color: color }} className="font-bold ml-3">{label}</Text>
  </TouchableOpacity>
);

export default function HelpSupport() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-black">
      <ScrollView className="flex-1 px-6">
        <View className="flex-row items-center pt-16 pb-8">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">Help & Support</Text>
        </View>

        <View className="mb-8">
          <Text className="text-gray-500 text-xs font-bold uppercase mb-6 tracking-widest ml-1">Frequently Asked Questions</Text>
          
          <FAQItem 
            question="How do I download songs for offline?"
            answer="Click the download icon next to any song. You can manage your downloads in the 'Offline Downloads' section of your profile."
          />
          <FAQItem 
            question="Can I use the app on multiple devices?"
            answer="Yes, simply sign in with your email and password on any device. Your playlists and library will sync automatically."
          />
          <FAQItem 
            question="How do I report a problem with a song?"
            answer="Press and hold on the song and select 'Report Issue' or contact us directly via email."
          />
        </View>

        <View className="mb-12">
          <Text className="text-gray-500 text-xs font-bold uppercase mb-6 tracking-widest ml-1">Contact Us</Text>
          
          <ContactButton 
            icon="mail-outline" 
            label="Email Support" 
            color="#6366f1" 
            onPress={() => Linking.openURL('mailto:support@gospelmusic.com')} 
          />
          <ContactButton 
            icon="chatbubble-ellipses-outline" 
            label="Live Chat" 
            color="#10b981" 
            onPress={() => {}} 
          />
          <ContactButton 
            icon="logo-twitter" 
            label="Twitter Support" 
            color="#38bdf8" 
            onPress={() => Linking.openURL('https://twitter.com/gospelsupport')} 
          />
        </View>

        <View className="items-center pb-12">
          <Text className="text-gray-600 text-xs">Gospel Music App v1.0.1</Text>
          <Text className="text-gray-700 text-xs mt-1">Made with ❤️ for the Gospel community</Text>
        </View>
      </ScrollView>
    </View>
  );
}
