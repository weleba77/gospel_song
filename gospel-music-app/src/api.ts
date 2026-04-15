// app/api.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Use your actual local IP address so physical devices (Expo Go users) can reach the backend
const BASE_URL = 'http://192.168.100.186:8000/api';

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Attach token automatically if stored
API.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("API ERROR:", error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default API;