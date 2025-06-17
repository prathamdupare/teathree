import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export function useAppFonts() {
  const [fontsLoaded, fontError] = useFonts({
    'PlusJakartaSans': 'https://fonts.cdnfonts.com/s/89275/PlusJakartaSans-Regular.woff',
    'PlusJakartaSans-Medium': 'https://fonts.cdnfonts.com/s/89275/PlusJakartaSans-Medium.woff',
    'PlusJakartaSans-SemiBold': 'https://fonts.cdnfonts.com/s/89275/PlusJakartaSans-SemiBold.woff',
    'PlusJakartaSans-Bold': 'https://fonts.cdnfonts.com/s/89275/PlusJakartaSans-Bold.woff',
    'PlusJakartaSans-Italic': 'https://fonts.cdnfonts.com/s/89275/PlusJakartaSans-Italic.woff',
    'FiraMono': 'https://fonts.cdnfonts.com/s/14635/FiraMono-Regular.woff',
    'FiraMono-Medium': 'https://fonts.cdnfonts.com/s/14635/FiraMono-Medium.woff',
    'FiraMono-Bold': 'https://fonts.cdnfonts.com/s/14635/FiraMono-Bold.woff'
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the splash screen once fonts are loaded or if there's an error
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  return { fontsLoaded, fontError };
} 