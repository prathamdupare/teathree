import { View, Text, SafeAreaView } from 'react-native';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { useState } from 'react';
import { ChatHeader } from '~/components/chat';
import { ChatContainer } from '~/components/chat/ChatContainer';
import { Id } from '~/convex/_generated/dataModel';

const SUGGESTED_PROMPTS = [
  "How does AI work?",
  "Are black holes real?", 
  "How many Rs are in the word \"strawberry\"?",
  "What is the meaning of life?"
];

const ACTION_BADGES = [
  { label: "Create", icon: "✨" },
  { label: "Explore", icon: "🔍" },
];

export default function App() {
  const { user } = useUser();
  const router = useRouter();
  const [chatId, setChatId] = useState<Id<"chats"> | null>(null);

  // Show empty state UI
  const EmptyState = () => (
    <View className="flex-1 items-center justify-center p-8">
      <View className="max-w-2xl w-full">
        <Text className="text-3xl font-bold text-center mb-8 text-foreground">
          How can I help you, {user?.firstName || 'there'}?
        </Text>
        
        {/* Action Badges */}
        <View className="flex-row justify-center items-center mb-8 gap-3 flex-wrap">
          {ACTION_BADGES.map((action, index) => (
            <Badge key={index} variant="secondary" className="px-4 py-2">
              <Text className="text-secondary-foreground">
                {action.icon} {action.label}
              </Text>
            </Badge>
          ))}
        </View>

        {/* Suggested Prompts */}
        <View className="space-y-3">
          {SUGGESTED_PROMPTS.map((prompt, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start p-4 h-auto bg-secondary/30 border border-border rounded-xl"
              onPress={() => {
                // TODO: Handle prompt selection
              }}
            >
              <Text className="text-foreground text-left">{prompt}</Text>
            </Button>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <SignedIn>
        <ChatHeader title={chatId ? 'Chat' : 'T3.chat'} />
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