// app/api.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { triggerGlobalLogout } from "./context/AuthContext";

// Update this URL whenever your ngrok tunnel restarts
export const BASE_URL = 'https://margarita-overeater-hungrily.ngrok-free.dev/api';

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});

// Attach token automatically if stored
API.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("API ERROR:", error?.response?.data || error.message);
    // If server says token is invalid/expired, wipe stale data and force re-login
    if (error?.response?.status === 401) {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      triggerGlobalLogout(); // clears in-memory user → router redirects to Login
    }
    return Promise.reject(error);
  }
);

export default API;