import { View, Text } from "react-native";
import { ThemeToggle } from "../ThemeToggle";
import { SignOutButton } from "../SignOutButton";

interface ChatHeaderProps {
  title?: string;
}

export function ChatHeader({ title = "T3.chat" }: ChatHeaderProps) {
  return (
    <View className="flex-row items-center justify-between p-4 border-b border-border">
      <Text className="text-xl font-semibold text-foreground">
        {title}
      </Text>
      <View className="flex-row items-center gap-3">
        <ThemeToggle />
        <SignOutButton />
      </View>
    </View>
  );
} 