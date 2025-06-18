import React from "react";
import { View } from "react-native";
import { ThemeToggle } from "./theme-toggle";

export function QuickSelector() {
  return (
    <View className="fixed right-0 top-0 z-20 h-16 w-28 max-sm:hidden">
      <View className="absolute right-4 top-4">
        <ThemeToggle />
      </View>
    </View>
  );
} 