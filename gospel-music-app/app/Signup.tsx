import { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { AuthContext } from "../src/context/AuthContext";
import { useRouter } from "expo-router";

export default function Signup() {
  const { signup } = useContext(AuthContext);
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminSecret, setAdminSecret] = useState("");

  const handleSignup = async () => {
    try {
      await signup(username, email, password, adminSecret);
      router.replace("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View className="flex-1 bg-black justify-center px-6">
      <Text className="text-white text-3xl font-bold mb-6">Create Account</Text>

      <TextInput
        placeholder="Username"
        placeholderTextColor="#aaa"
        value={username}
        onChangeText={setUsername}
        className="bg-gray-800 text-white p-4 rounded mb-4"
      />

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

      <TextInput
        placeholder="Admin Secret (Optional)"
        placeholderTextColor="#666"
        secureTextEntry
        value={adminSecret}
        onChangeText={setAdminSecret}
        className="bg-gray-900 text-gray-400 p-4 rounded mb-4 border border-gray-700"
      />

      <TouchableOpacity
        onPress={handleSignup}
        className="bg-green-600 p-4 rounded"
      >
        <Text className="text-white text-center font-bold">Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/Login")}>
        <Text className="text-gray-400 text-center mt-4">
          Already have an account? Login
        </Text>
      </TouchableOpacity>
    </View>
  );
}