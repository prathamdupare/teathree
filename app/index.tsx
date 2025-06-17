import { View, Text, SafeAreaView, Pressable } from 'react-native';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { Button } from '~/components/ui/button';
import { useState } from 'react';
import { ChatHeader } from '~/components/chat';
import { ChatContainer } from '~/components/chat/ChatContainer';
import { Id } from '~/convex/_generated/dataModel';
import { Ionicons } from '@expo/vector-icons';

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

export default function App() {
  const { user } = useUser();
  const router = useRouter();
  const [chatId, setChatId] = useState<Id<"chats"> | null>(null);
  const [activeTab, setActiveTab] = useState('create');
  const [inputValue, setInputValue] = useState('');

  // Show empty state UI
  const EmptyState = () => (
    <View className="flex-1 items-center justify-center p-8 bg-[#f8f2f8] dark:bg-[#221d27]">
      <View className="max-w-2xl w-full mx-auto">
        <Text className="text-3xl font-medium text-[#3a1326] dark:text-white mb-12 text-center">
          How can I help you, {user?.firstName || 'there'}?
        </Text>
        
        {/* Action Buttons */}
        <View className="flex-row items-center justify-center gap-4 mb-12 w-full">
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
        <View className="space-y-4">
          {TABS.find(t => t.id === activeTab)?.prompts.map((prompt, index) => (
            <Pressable
              key={index}
              onPress={() => {
                setInputValue(prompt);
              }}
              className="w-full"
            >
              <Text className="text-[#b02372] dark:text-[#9ca3af] text-left text-base hover:text-[#560f2b] dark:hover:text-[#d1d5db] transition-colors">
                {prompt}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#221d27] dark:bg-[#221d27]">
      <SignedIn>
        <ChatContainer 
          chatId={chatId} 
          onChatCreated={(newChatId) => {
            setChatId(newChatId);
            router.push(`/chat/${newChatId}`);
          }}
          defaultInputValue={inputValue}
        >
          {!chatId && <EmptyState />}
        </ChatContainer>
      </SignedIn>

      <SignedOut>
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-3xl font-semibold text-center mb-4 text-foreground">
            Welcome to T3.chat
          </Text>
          <Text className="text-lg text-muted-foreground text-center mb-8">
            Your AI-powered chat companion
          </Text>
          <Text className="text-base text-center mb-8 text-muted-foreground">
            Please sign in to start chatting with AI
          </Text>
          
          <View className="gap-4">
            <Link href="/sign-in" asChild>
              <Button className="px-8 py-3">
                <Text className="text-primary-foreground font-semibold">
                  Sign In with Google
                </Text>
              </Button>
            </Link>
          </View>
        </View>
      </SignedOut>
    </SafeAreaView>
  );
}