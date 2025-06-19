import '~/app/globals.css';
import '~/app/utils/polyfills';
import { Theme, ThemeProvider, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NAV_THEME } from '~/lib/constants';
import { useColorScheme } from '~/lib/useColorScheme';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Text } from '~/components/ui/text';
import { ClerkProvider, ClerkLoaded, SignedIn, SignedOut } from '@clerk/clerk-expo'
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { CustomDrawerContent } from '~/components/CustomDrawerContent';
import { PortalHost } from '@rn-primitives/portal';
import { useAppFonts } from '~/lib/fonts';
import { QuickSelector } from '~/components/ui/quick-selector';
import { Slot } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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
  
  return (
    <Pressable
      onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
      className="p-2 ml-2 rounded-md hover:bg-[#f5dbef] dark:hover:bg-[#2b2431] transition-colors"
    >
      <Ionicons 
        name="menu" 
        size={24} 
        color={isDarkColorScheme ? NAV_THEME.dark.text : NAV_THEME.light.text} 
      />
    </Pressable>
  );
}

// Web-specific persistent sidebar layout
function WebLayout() {
  const { isDarkColorScheme } = useColorScheme();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  return (
    <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar }}>
      <View className="flex-1 flex-row relative">
        {/* Collapsible sidebar for web */}
        <View 
          className="border-r border-[#f0d7f0]/50 dark:border-[#2a1f24] transition-all duration-300 ease-in-out"
          style={{ 
            width: isSidebarOpen ? 280 : 0,
            overflow: 'hidden'
          }}
        >
          {isSidebarOpen && <CustomDrawerContent toggleSidebar={toggleSidebar} />}
        </View>
        
        {/* Toggle button when sidebar is closed */}
        {!isSidebarOpen && (
          <Pressable
            onPress={toggleSidebar}
            className="absolute top-4 left-4 z-50 w-10 h-10 rounded-full items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
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
              size={18} 
              color={isDarkColorScheme ? '#d7c2ce' : '#b02372'} 
            />
          </Pressable>
        )}
        
        {/* Main content area */}
        <View className="flex-1">
          <Slot />
        </View>
      </View>
    </SidebarContext.Provider>
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

// Sidebar context for web
const SidebarContext = React.createContext<{
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
} | null>(null);

export const useSidebar = () => {
  const context = React.useContext(SidebarContext);
  if (!context && Platform.OS === 'web') {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export default function RootLayout() {
  const hasMounted = React.useRef(false);
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);
  const { fontsLoaded, fontError } = useAppFonts();
  const [navigation, setNavigation] = React.useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  // Auto-open drawer on web (only for mobile drawer)
  React.useEffect(() => {
    if (Platform.OS !== 'web' && navigation && hasMounted.current) {
      // Small delay to ensure drawer is ready
      const timer = setTimeout(() => {
        navigation.dispatch(DrawerActions.openDrawer());
        setIsDrawerOpen(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [navigation]);

  useIsomorphicLayoutEffect(() => {
    if (hasMounted.current) {
      return;
    }

    if (Platform.OS === 'web') {
      document.documentElement.classList.add('bg-background');
    }
    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);

  if (!isColorSchemeLoaded || !fontsLoaded) {
    return null;
  }

  return (
    <ClerkProvider publishableKey={publishableKey!} tokenCache={tokenCache}>
      <ClerkLoaded>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ConvexProvider client={convex}>
            <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
              <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
              <SignedIn>
                <QuickSelector />
                {Platform.OS === 'web' ? (
                  <WebLayout />
                ) : (
                  <Drawer
                    ref={(nav) => setNavigation(nav)}
                    drawerContent={(props) => <CustomDrawerContent {...props} />}
                    screenOptions={{
                      headerShown: false,
                      drawerType: 'slide',
                      drawerStyle: {
                        width: 280,
                        backgroundColor: 'transparent',
                      },
                      overlayColor: 'rgba(0, 0, 0, 0.3)',
                      swipeEnabled: true,
                      drawerActiveTintColor: isDarkColorScheme ? NAV_THEME.dark.primary : NAV_THEME.light.primary,
                      drawerInactiveTintColor: isDarkColorScheme ? NAV_THEME.dark.text : NAV_THEME.light.text,
                      drawerLabelStyle: {
                          fontFamily: 'Ubuntu',
                      },
                      drawerHideStatusBarOnOpen: false,
                      drawerStatusBarAnimation: 'fade',
                    }}
                    initialRouteName="index"
                  >
                    <Drawer.Screen
                      name="index"
                      options={{
                        title: 'Tea3 Chat',
                        drawerItemStyle: { display: 'none' },
                      }}
                    />
                    <Drawer.Screen
                      name="ask/index"
                      options={{
                        drawerLabel: 'Ask',
                        title: 'Ask Question',
                        drawerItemStyle: { 
                          marginVertical: 4,
                        },
                      }}
                    />
                    <Drawer.Screen
                      name="chat/[id]"
                      options={{
                        title: 'Chat',
                        drawerItemStyle: { display: 'none' },
                      }}
                    />
                  </Drawer>
                )}
              </SignedIn>
              <SignedOut>
                <View style={{ flex: 1 }}>
                  <Slot />
                </View>
              </SignedOut>
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