import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const QualityOption = ({ label, value, current, onSelect }: any) => (
  <TouchableOpacity 
    onPress={() => onSelect(value)}
    className="flex-row items-center justify-between py-5 border-b border-gray-900"
  >
    <Text className={`text-base ${current === value ? 'text-indigo-400 font-bold' : 'text-white'}`}>
      {label}
    </Text>
    {current === value && <Ionicons name="checkmark" size={20} color="#818cf8" />}
  </TouchableOpacity>
);

export default function AudioQuality() {
  const router = useRouter();
  const [streaming, setStreaming] = useState('normal');
  const [download, setDownload] = useState('high');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const s = await AsyncStorage.getItem('audio_quality_streaming');
    const d = await AsyncStorage.getItem('audio_quality_download');
    if (s) setStreaming(s);
    if (d) setDownload(d);
  };

  const saveStreaming = async (val: string) => {
    setStreaming(val);
    await AsyncStorage.setItem('audio_quality_streaming', val);
  };

  const saveDownload = async (val: string) => {
    setDownload(val);
    await AsyncStorage.setItem('audio_quality_download', val);
  };

  return (
    <View className="flex-1 bg-black">
      <ScrollView className="flex-1 px-6">
        <View className="flex-row items-center pt-16 pb-8">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">Audio Quality</Text>
        </View>

        <View className="mb-8">
          <Text className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-widest ml-1">Streaming Quality</Text>
          <View className="bg-gray-900/30 rounded-3xl p-4 border border-gray-900">
            <QualityOption label="Data Saver (24kbps)" value="low" current={streaming} onSelect={saveStreaming} />
            <QualityOption label="Normal (96kbps)" value="normal" current={streaming} onSelect={saveStreaming} />
            <QualityOption label="High (160kbps)" value="high" current={streaming} onSelect={saveStreaming} />
            <QualityOption label="Very High (320kbps)" value="very-high" current={streaming} onSelect={saveStreaming} />
          </View>
          <Text className="text-gray-500 text-xs mt-3 px-2">
            Higher quality uses more mobile data.
          </Text>
        </View>

        <View className="mb-8">
          <Text className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-widest ml-1">Download Quality</Text>
          <View className="bg-gray-900/30 rounded-3xl p-4 border border-gray-900">
            <QualityOption label="Normal" value="normal" current={download} onSelect={saveDownload} />
            <QualityOption label="High" value="high" current={download} onSelect={saveDownload} />
            <QualityOption label="Very High" value="very-high" current={download} onSelect={saveDownload} />
          </View>
          <Text className="text-gray-500 text-xs mt-3 px-2">
            Higher quality downloads take up more storage space.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}
