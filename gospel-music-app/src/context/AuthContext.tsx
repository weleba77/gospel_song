import { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../api";

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  profileImage?: string | null;
}

interface AuthType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfileImage: (imageUrl: string) => Promise<void>;
}

export const AuthContext = createContext<AuthType>({} as AuthType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from storage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await API.post("/auth/login", { email, password });

    await AsyncStorage.setItem("token", res.data.token);
    await AsyncStorage.setItem("user", JSON.stringify(res.data.user));

    setUser(res.data.user);
  };

  const signup = async (username: string, email: string, password: string, adminSecret?: string) => {
    const res = await API.post("/auth/signup", {
      username,
      email,
      password,
      adminSecret,
    });

    await AsyncStorage.setItem("token", res.data.token);
    await AsyncStorage.setItem("user", JSON.stringify(res.data.user));

    setUser(res.data.user);
  };

  const logout = async () => {
    await AsyncStorage.clear();
    setUser(null);
  };

  const updateProfileImage = async (imageUrl: string) => {
    if (user) {
      const updatedUser = { ...user, profileImage: imageUrl };
      setUser(updatedUser);
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateProfileImage }}>
      {children}
    </AuthContext.Provider>
  );
};