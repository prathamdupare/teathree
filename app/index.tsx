import { View, Text, SafeAreaView } from 'react-native';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { Button } from '~/components/ui/button';
import { useState } from 'react';
import { ChatHeader } from '~/components/chat';
import { ChatContainer } from '~/components/chat/ChatContainer';
import { Id } from '~/convex/_generated/dataModel';
import { Ionicons } from '@expo/vector-icons';

const EXAMPLE_PROMPTS = [
  "How does AI work?",
  "Are black holes real?",
  'How many Rs are in the word "strawberry"?',
  "What is the meaning of life?",
];

const ACTION_BUTTONS = [
  { label: "Create", icon: "sparkles-outline" },
  { label: "Explore", icon: "compass-outline" },
  { label: "Code", icon: "code-slash-outline" },
  { label: "Learn", icon: "school-outline" },
];

export default function App() {
  const { user } = useUser();
  const router = useRouter();
  const [chatId, setChatId] = useState<Id<"chats"> | null>(null);

  // Show empty state UI
  const EmptyState = () => (
    <View className="flex-1 items-center justify-center p-8 bg-[#1a1a1a]">
      <View className="max-w-2xl w-full">
        <Text className="text-3xl font-medium mb-8 text-white text-center">
          How can I help you, {user?.firstName || 'there'}?
        </Text>
        
        {/* Action Buttons */}
        <View className="flex-row justify-center gap-3 mb-12">
          {ACTION_BUTTONS.map((button) => (
            <Button
              key={button.label}
              variant="outline"
              className="bg-transparent border-[#2a2a2a] hover:bg-[#2a2a2a] hover:border-[#2a2a2a] transition-colors"
            >
              <View className="flex-row items-center px-4 py-2">
                <Ionicons 
                  name={button.icon as any} 
                  size={16} 
                  color="#a0a0a0" 
                  style={{ marginRight: 8 }} 
                />
                <Text className="text-[#a0a0a0] text-sm group-hover:text-white">
                  {button.label}
                </Text>
              </View>
            </Button>
          ))}
        </View>

        {/* Example Prompts */}
        <View className="space-y-3">
          {EXAMPLE_PROMPTS.map((prompt, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start p-4 bg-transparent hover:bg-[#2a2a2a] hover:text-white active:bg-[#2a2a2a] rounded-lg transition-colors"
              onPress={() => {
                // TODO: Handle prompt selection
              }}
            >
              <Text className="text-[#8a8a8a] text-left text-base group-hover:text-white">
                {prompt}
              </Text>
            </Button>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <SignedIn>
        <ChatContainer 
          chatId={chatId} 
          onChatCreated={(newChatId) => {
            setChatId(newChatId);
            router.push(`/chat/${newChatId}`);
          }}
        >
          {!chatId && <EmptyState />}
        </ChatContainer>
      </SignedIn>

      <SignedOut>
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-3xl font-bold text-center mb-4 text-foreground">
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