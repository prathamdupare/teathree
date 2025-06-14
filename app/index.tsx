import { generateAPIUrl } from './utils/utils';
import { View, Text, SafeAreaView } from 'react-native';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '~/convex/_generated/api';
import { Id } from '~/convex/_generated/dataModel';
import { ChatHeader, ChatInput, MessageList } from '~/components/chat';

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
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("Gemini 1.5 Flash");
  const [chatId, setChatId] = useState<Id<"chats"> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const createChat = useMutation(api.chats.createChat);
  const createStreamingMessage = useMutation(api.messages.createStreamingMessage);
  const updateMessageContent = useMutation(api.messages.updateMessageContent);
  const messages = useQuery(api.messages.getChatMessages, 
    chatId ? { chatId } : 'skip'
  );

  const handleSubmit = async () => {
    if (!input.trim() || !user?.id || isLoading) return;

    const currentInput = input;
    setInput(''); // Clear input immediately
    setIsLoading(true);

    try {
      // Create new chat if needed
      let targetChatId = chatId;
      if (!targetChatId) {
        targetChatId = await createChat({
          title: currentInput.slice(0, 50) + (currentInput.length > 50 ? '...' : ''),
          userId: user.id,
          provider: 'google',
        });
        
        // Update state and URL
        setChatId(targetChatId);
        window.history.pushState({}, '', `/chat/${targetChatId}`);
      }

      // Save user message
      await createStreamingMessage({
        chatId: targetChatId,
        role: 'user',
        content: currentInput,
        isComplete: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Create initial AI message
      const aiMessageId = await createStreamingMessage({
        chatId: targetChatId,
        role: 'assistant',
        content: '',
        provider: 'google',
        model: 'gemini-1.5-flash',
        isComplete: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Make API call
      const response = await fetch(generateAPIUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...(messages?.map(m => ({ role: m.role, content: m.content })) || []),
            { role: 'user', content: currentInput }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('API call failed');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let content = '';

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            content += chunk;

            // Update message content as we receive it
            await updateMessageContent({
              messageId: aiMessageId,
              content: content,
            });
          }
        } finally {
          reader.releaseLock();
        }

        // Mark the message as complete
        await updateMessageContent({
          messageId: aiMessageId,
          content: content || 'I apologize, but I was unable to generate a response.',
          isComplete: true,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setInput(currentInput); // Restore input on error
    } finally {
      setIsLoading(false);
    }
  };

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
                setInput(prompt);
              }}
            >
              <Text className="text-foreground text-left">{prompt}</Text>
            </Button>
          ))}
        </View>
      </View>
    </View>
  );

  const chatTitle = chatId 
    ? (messages?.[0]?.content.slice(0, 50) || 'Chat') 
    : 'T3.chat';

  return (
    <SafeAreaView className="flex-1 bg-background">
      <SignedIn>
        <ChatHeader title={chatTitle} />

        <View className="flex-1">
          {!chatId ? (
            <EmptyState />
          ) : (
            <MessageList messages={messages} />
          )}
        </View>

        <ChatInput
          input={input}
          onInputChange={setInput}
          onSubmit={handleSubmit}
          selectedModel={selectedModel}
          isLoading={isLoading}
        />
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