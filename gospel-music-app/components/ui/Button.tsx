import { TouchableOpacity, Text } from "react-native";

export default function Button({ title }: { title: string }) {
  return (
    <TouchableOpacity className="bg-black p-4 rounded-xl">
      <Text className="text-white text-center">{title}</Text>
    </TouchableOpacity>
  );
}