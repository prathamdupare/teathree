import { useColorScheme as useNativewindColorScheme } from 'nativewind';
import { useEffect } from 'react';

export function useColorScheme() {
  const { colorScheme, setColorScheme, toggleColorScheme } = useNativewindColorScheme();
  useEffect(() => {
    setColorScheme('dark');
  }, []);

  return {
    colorScheme: colorScheme ?? 'dark',
    isDarkColorScheme: colorScheme === 'dark',
    setColorScheme,
    toggleColorScheme,
  };
}
