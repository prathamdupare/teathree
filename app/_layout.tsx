import '~/app/globals.css';

import { Theme, ThemeProvider, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { Platform, Pressable } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NAV_THEME } from '~/lib/constants';
import { useColorScheme } from '~/lib/useColorScheme';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Text } from '~/components/ui/text';
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo'
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { CustomDrawerContent } from '~/components/CustomDrawerContent';
import { PortalHost } from '@rn-primitives/portal';

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

// Custom header left component for toggling drawer
function DrawerToggleButton() {
  const navigation = useNavigation();
  const { isDarkColorScheme } = useColorScheme();
  
  if (Platform.OS !== 'web') return null;
  
  return (
    <Pressable
      onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
      style={{ 
        padding: 8, 
        marginLeft: 8,
        borderRadius: 4,
      }}
    >
      <Text style={{ 
        fontSize: 18, 
        color: isDarkColorScheme ? NAV_THEME.dark.text : NAV_THEME.light.text 
      }}>
        ☰
      </Text>
    </Pressable>
  );
}


const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env'
  );
}

export {
// Catch any errors thrown by the Layout component.
ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const hasMounted = React.useRef(false);
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

  useIsomorphicLayoutEffect(() => {
    if (hasMounted.current) {
      return;
    }

    if (Platform.OS === 'web') {
      // Adds the background color to the html element to prevent white background on overscroll.
      document.documentElement.classList.add('bg-background');
    }
    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);

  if (!isColorSchemeLoaded) {
    return null;
  }

  return (
    <ClerkProvider publishableKey={publishableKey!} tokenCache={tokenCache}>
      <ClerkLoaded>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ConvexProvider client={convex}>
            <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
              <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
              <Drawer
                drawerContent={(props) => <CustomDrawerContent {...props} />}
                screenOptions={{
                  drawerType: Platform.OS === 'web' ? 'permanent' : 'slide',
                  drawerStyle: {
                    width: 250,
                    backgroundColor: isDarkColorScheme ? NAV_THEME.dark.card : NAV_THEME.light.card,
                  },
                  overlayColor: Platform.OS === 'web' ? 'transparent' : undefined,
                  swipeEnabled: Platform.OS !== 'web',
                  drawerActiveTintColor: isDarkColorScheme ? NAV_THEME.dark.primary : NAV_THEME.light.primary,
                  drawerInactiveTintColor: isDarkColorScheme ? NAV_THEME.dark.text : NAV_THEME.light.text,
                  headerLeft: Platform.OS === 'web' ? () => <DrawerToggleButton /> : undefined,
                }}
                initialRouteName="index"
              >
                <Drawer.Screen
                  name="index"
                  options={{
                    drawerLabel: 'Home',
                    title: 'Home',
                    drawerItemStyle: Platform.OS === 'web' ? { 
                      marginVertical: 4,
                    } : undefined,
                  }}
                />
                <Drawer.Screen
                  name="ask/index"
                  options={{
                    drawerLabel: 'Ask',
                    title: 'Ask Question',
                    drawerItemStyle: Platform.OS === 'web' ? { 
                      marginVertical: 4,
                    } : undefined,
                  }}
                />
              </Drawer>
              <PortalHost />
            </ThemeProvider>
          </ConvexProvider>
        </GestureHandlerRootView>
      </ClerkLoaded>
    </ClerkProvider>
  );
}

const useIsomorphicLayoutEffect =
  Platform.OS === 'web' && typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;