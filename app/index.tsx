import { View, Text, SafeAreaView, Pressable } from 'react-native';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { Button } from '~/components/ui/button';
import { useState, useCallback, useEffect } from 'react';
import { ChatHeader } from '~/components/chat';
import { ChatContainer } from '~/components/chat/ChatContainer';
import { Id } from '~/convex/_generated/dataModel';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useSSO } from '@clerk/clerk-expo';
import { Platform } from 'react-native';

const TABS = [
  { id: 'create', label: "Create", icon: "sparkles-outline", prompts: [
    "Write a short story about a robot discovering emotions",
    "Help me outline a sci-fi novel set in a post-apocalyptic world",
    "Create a character profile for a complex villain with sympathetic motives",
    "Give me 5 creative writing prompts for flash fiction",
  ]},
  { id: 'explore', label: "Explore", icon: "compass-outline", prompts: [
    "Good books for fans of Rick Rubin",
    "Countries ranked by number of corgis",
    "Most successful companies in the world",
    "How much does Claude cost?",
  ]},
  { id: 'code', label: "Code", icon: "code-slash-outline", prompts: [
    "Write code to invert a binary search tree in Python",
    "What's the difference between Promise.all and Promise.allSettled?",
    "Explain React's useEffect cleanup function",
    "Best practices for error handling in async/await",
  ]},
  { id: 'learn', label: "Learn", icon: "school-outline", prompts: [
    "How does AI work?",
    "Are black holes real?",
    'How many Rs are in the word "strawberry"?',
    "What is the meaning of life?",
  ]},
];

// Warm up browser helper
const useWarmUpBrowser = () => {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      void WebBrowser.warmUpAsync();
      return () => {
        void WebBrowser.coolDownAsync();
      }
    }
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const { user } = useUser();
  const router = useRouter();
  const [chatId, setChatId] = useState<Id<"chats"> | null>(null);
  const [activeTab, setActiveTab] = useState('create');
  const [inputValue, setInputValue] = useState('');
  
  useWarmUpBrowser();
  const { startSSOFlow } = useSSO();

  const onSignInPress = useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: AuthSession.makeRedirectUri(),
      });

      if (createdSessionId) {
        setActive!({ session: createdSessionId });
      }
    } catch (err) {
      console.error('Sign-in error:', JSON.stringify(err, null, 2));
    }
  }, []);

  // Show empty state UI
  const EmptyState = () => (
    <View className="flex-1 items-center justify-center bg-[#f8f2f8] dark:bg-[#221d27]">
      <View className="w-full max-w-2xl mx-auto px-8 py-16">
        <Text className="text-3xl font-medium text-[#3a1326] dark:text-white mb-12 text-center">
          How can I help you, {user?.firstName || 'there'}?
        </Text>
        
        {/* Action Buttons */}
        <View className="flex-row items-center justify-center gap-4 mb-12 flex-wrap">
          {TABS.map((tab) => (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              className={`flex-row items-center px-4 py-2 rounded-full ${
                activeTab === tab.id 
                ? 'bg-[#3a1326]' 
                : 'bg-transparent border border-[#b02372] dark:border-[#6b6b6b]'
              }`}
            >
              <Ionicons 
                name={tab.icon as any} 
                size={16} 
                color={activeTab === tab.id ? '#fff' : '#b02372'} 
                style={{ marginRight: 8 }} 
                className="dark:text-[#9ca3af]"
              />
              <Text className={
                activeTab === tab.id 
                ? 'text-white font-medium' 
                : 'text-[#b02372] dark:text-[#9ca3af]'
              }>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Example Prompts */}
        <View className="space-y-4 w-full">
          {TABS.find(t => t.id === activeTab)?.prompts.map((prompt, index) => (
            <Pressable
              key={index}
              onPress={() => {
                setInputValue(prompt);
              }}
              className="w-full p-3 rounded-lg hover:bg-white/5 dark:hover:bg-black/5 transition-colors"
            >
              <Text className="text-[#b02372] dark:text-[#9ca3af] text-center text-base hover:text-[#560f2b] dark:hover:text-[#d1d5db] transition-colors">
                {prompt}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#f8f2f8] dark:bg-[#221d27]">
      <SignedIn>
        <ChatContainer 
          chatId={chatId} 
          onChatCreated={(newChatId) => {
            setChatId(newChatId);
            setInputValue(''); // Clear the input value after submission
            // Don't navigate immediately - let the response complete first
            // Navigation will happen when user sends another message or manually navigates
          }}
          defaultInputValue={inputValue}
        >
          {!chatId && <EmptyState />}
        </ChatContainer>
      </SignedIn>

      <SignedOut>
        <View className="flex-1 flex flex-col bg-[#f8f2f8] dark:bg-[#221d27] border-t-[10px] border-[#f5dbef] dark:border-[#181217] rounded-t-lg">
          <View className="max-w-md mx-auto w-full flex-1 items-center justify-center p-6">
            <View className="w-full space-y-6">
              <View className="space-y-2 text-center">
                <Text className="text-4xl font-bold tracking-tighter text-[#3a1326] dark:text-white">
                  Welcome to <Text className="text-[#b02372]">T3.chat</Text>
                </Text>
                <Text className="text-base text-muted-foreground text-center">
                  Sign in below (we'll increase your message limits if you do 😉)
                </Text>
              </View>

              <Button 
                onPress={onSignInPress}
                className="w-full bg-[#3a1326] dark:bg-[#2d1f33] hover:bg-[#2d1f33] dark:hover:bg-[#3a1326] rounded-lg py-3 px-4 flex-row items-center justify-center space-x-2"
              >
                <View className="w-5 h-5">
                  <svg viewBox="0 0 24 24" width="100%" height="100%">
                    <path
                      fill="#fff"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#fff"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#fff"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#fff"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </View>
                <Text className="text-white font-medium text-base">
                  Continue with Google
                </Text>
              </Button>

              <Text className="text-xs text-center text-muted-foreground">
                By continuing, you agree to our{' '}
                <Text className="text-[#b02372] hover:underline">Terms of Service</Text>
                {' '}and{' '}
                <Text className="text-[#b02372] hover:underline">Privacy Policy</Text>
              </Text>
            </View>
          </View>
        </View>
      </SignedOut>
    </SafeAreaView>
  );
}