import React from "react";
import { View, Pressable } from "react-native";
import { ThemeToggle } from "./theme-toggle";
import { useColorScheme } from "~/lib/useColorScheme";
import { Settings } from "lucide-react-native"; // You'll need to install lucide-react-native

export function QuickSelector() {
  const { isDarkColorScheme } = useColorScheme();

  const handleSettingsPress = () => {
    // Add your settings navigation logic here
    console.log("Settings pressed");
  };

  return (
    <View className="fixed right-0 top-0 z-20 h-16 w-48 max-sm:hidden">
      <View 
        className="absolute right-4 top-4 flex-row items-center rounded-lg px-3 py-2"
        style={{
          backgroundColor: isDarkColorScheme ? '#1a1419' : '#f3e6f5'
        }}
      >
        <Pressable
          onPress={handleSettingsPress}
          className="mr-3"
        >
          <Settings 
            size={20} 
            color={isDarkColorScheme ? '#ffffff' : '#8b5a9b'} 
          />
        </Pressable>
        <ThemeToggle />
      </View>
    </View>
  );
}