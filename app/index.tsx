import { generateAPIUrl } from './utils/utils';
import { useChat } from '@ai-sdk/react';
import { fetch as expoFetch } from 'expo/fetch';
import { View, TextInput, ScrollView, Text, SafeAreaView, Platform } from 'react-native';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo';
import { SignOutButton } from '~/components/SignOutButton';
import { Link } from 'expo-router';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { ThemeToggle } from '~/components/ui/theme-toggle';
import { useState } from 'react';

const SUGGESTED_PROMPTS = [
  "How does AI work?",
  "Are black holes real?", 
  "How many Rs are in the word \"strawberry\"?",
  "What is the meaning of life?"
];

const ACTION_BADGES = [
  { label: "Create", icon: "✨" },
  { label: "Explore", icon: "🔍" },
  { label: "Code", icon: "💻" },
  { label: "Learn", icon: "📚" }
];

export default function App() {
  const { user } = useUser();
  const [selectedModel, setSelectedModel] = useState("Gemini 1.5 Flash");
  
  const { messages, error, handleInputChange, input, handleSubmit } = useChat({
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    api: generateAPIUrl('/api/chat'),
    streamProtocol: 'data',
    onError: error => {
      console.error('Chat Error:', error);
      console.error('Error details:', error.message);
    },
    onFinish: (message) => {
      console.log('Message completed:', message);
    },
  });

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-destructive text-lg font-semibold mb-2">
            Error: {error.message}
          </Text>
          <Text className="text-muted-foreground text-sm text-center">
            Please check your API configuration and try again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
                handleInputChange({
                  target: { value: prompt }
                } as any);
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
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border">
          <Text className="text-xl font-semibold text-foreground">T3.chat</Text>
          <View className="flex-row items-center gap-3">
            <ThemeToggle />
            <SignOutButton />
          </View>
        </View>

        {/* Main Content */}
        <View className="flex-1">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            <ScrollView 
              className="flex-1 px-4"
              contentContainerStyle={{ paddingVertical: 16 }}
            >
              {messages.map((message) => (
                <View
                  key={message.id}
                  className={`mb-6 ${
                    message.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <View
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-[hsl(var(--chat-bubble-user))] ml-auto'
                        : 'bg-secondary mr-auto'
                    }`}
                  >
                    <Text
                      className={`text-sm leading-6 ${
                        message.role === 'user'
                          ? 'text-white'
                          : 'text-foreground'
                      }`}
                    >
                      {message.content}
                    </Text>
                  </View>
                  <Text className="text-xs text-muted-foreground mt-1 px-1">
                    {message.role === 'user' ? 'You' : 'AI'}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Input Area */}
        <View className="p-4 border-t border-border">
          <View className="flex-row items-end gap-3">
            {/* Model Display (simplified) */}
            <View className="min-w-[140px]">
              <View className="h-12 bg-secondary border border-border rounded-lg px-3 py-2 justify-center">
                <Text className="text-foreground text-sm font-medium">
                  {selectedModel}
                </Text>
              </View>
            </View>

            {/* Message Input */}
            <View className="flex-1">
              <View className="relative">
                <TextInput
                  className="bg-secondary border border-border rounded-xl px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground min-h-[48px] text-base"
                  placeholder="Type your message here..."
                  value={input}
                  onChangeText={(text) =>
                    handleInputChange({
                      target: { value: text }
                    } as any)
                  }
                  onSubmitEditing={(e) => {
                    handleSubmit(e as any);
                  }}
                  multiline
                  style={{
                    maxHeight: 120,
                    textAlignVertical: 'top',
                  }}
                />
                
                {/* Send Button */}
                <Button
                  onPress={() => handleSubmit()}
                  disabled={!input.trim()}
                  className="absolute right-2 bottom-2 w-8 h-8 rounded-lg bg-primary disabled:opacity-50"
                  size="icon"
                >
                  <Text className="text-primary-foreground">↑</Text>
                </Button>
              </View>
            </View>
          </View>
        </View>
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
          
          {/* Debug: Test navigation */}
          <View className="gap-4">
            <Link href="/sign-in" asChild>
              <Button className="px-8 py-3">
                <Text className="text-primary-foreground font-semibold">
                  Sign In with Google
                </Text>
              </Button>
            </Link>
            
            {/* Debug button to test if buttons work */}
            <Button 
              variant="outline"
              onPress={() => {
                console.log('Debug button pressed - buttons are working!')
                alert('Button works! Issue might be with navigation.')
              }}
            >
              <Text className="text-foreground">Test Button (Debug)</Text>
            </Button>
          </View>
        </View>
      </SignedOut>
    </SafeAreaView>
  );
}