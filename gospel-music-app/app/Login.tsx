import { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { AuthContext } from "../src/context/AuthContext";
import { useRouter } from "expo-router";

export default function Login() {
  const { login } = useContext(AuthContext);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      await login(email, password);
      router.replace("/"); // go to home
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <View className="flex-1 bg-black justify-center px-6">
      <Text className="text-white text-3xl font-bold mb-6">Welcome Back</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        className="bg-gray-800 text-white p-4 rounded mb-4"
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        className="bg-gray-800 text-white p-4 rounded mb-4"
      />

      {error ? <Text className="text-red-500 mb-2">{error}</Text> : null}

      <TouchableOpacity
        onPress={handleLogin}
        className="bg-blue-600 p-4 rounded"
      >
        <Text className="text-white text-center font-bold">Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/Signup")}>
        <Text className="text-gray-400 text-center mt-4">
          Don’t have an account? Sign up
        </Text>
      </TouchableOpacity>
    </View>
  );
}