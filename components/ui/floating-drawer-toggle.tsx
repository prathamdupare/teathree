import React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '~/lib/useColorScheme';

export function FloatingDrawerToggle() {
  const navigation = useNavigation();
  const { isDarkColorScheme } = useColorScheme();

  // Only show on web
  if (Platform.OS !== 'web') return null;

  const handleToggle = () => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  return (
    <View className="fixed top-4 left-4 z-50">
      <Pressable
        onPress={handleToggle}
        className="w-12 h-12 rounded-full items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
        style={{
          backgroundColor: isDarkColorScheme ? '#2b2431' : '#f5dbef',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Ionicons 
          name="menu" 
          size={20} 
          color={isDarkColorScheme ? '#d7c2ce' : '#b02372'} 
        />
      </Pressable>
    </View>
  );
} 