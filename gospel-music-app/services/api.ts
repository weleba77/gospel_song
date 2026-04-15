import axios from 'axios';
import { Platform } from 'react-native';

const API = axios.create({
  // Use 10.0.2.2 for Android emulator, localhost for iOS/Web emulator
  // Note: For a physical device on the same network, replace with your PC's local IP (e.g. 192.168.x.x)
  baseURL: Platform.OS === 'android' ? 'http://10.0.2.2:8000/api' : 'http://localhost:8000/api',
});

export default API;

//