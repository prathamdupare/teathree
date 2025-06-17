import { View, Text, Pressable } from "react-native";
import { ThemeToggle } from "../ThemeToggle";
import { SignOutButton } from "../SignOutButton";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface ChatHeaderProps {
  title?: string;
}

export function ChatHeader({ title = "T3.chat" }: ChatHeaderProps) {
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-between p-4 border-b border-[#f5dbef] dark:border-[#2b2431] bg-[#f8f2f8] dark:bg-[#221d27]">
      <View className="flex-row items-center gap-3">
        <Pressable 
          onPress={() => router.push('/')}
          className="p-2 rounded-lg bg-transparent hover:bg-[#f5dbef] dark:hover:bg-[#2b2431] transition-colors"
        >
          <Ionicons name="menu" size={20} style={{ color: 'hsl(var(--text-muted))' }} />
        </Pressable>
        <Text className="text-xl font-medium text-[hsl(var(--text-primary))]">
          {title}
        </Text>
      </View>
      <View className="flex-row items-center gap-3">
        <ThemeToggle />
        <SignOutButton />
      </View>
    </View>
  );
} 