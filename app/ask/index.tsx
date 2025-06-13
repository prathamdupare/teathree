import { useCompletion } from '@ai-sdk/react';
import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { generateAPIUrl } from '~/app/utils/utils';
import { fetch as expoFetch } from 'expo/fetch';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo';
import { Link } from 'expo-router';
import { Badge } from '~/components/ui/badge';
import { Card } from '~/components/ui/card';
import { ThemeToggle } from '~/components/ui/theme-toggle';

const QUESTION_SUGGESTIONS = [
  "Explain quantum computing in simple terms",
  "What are the benefits of renewable energy?",
  "How do neural networks work?",
  "What is the future of artificial intelligence?",
  "Explain blockchain technology",
  "What causes climate change?"
];

export default function Ask() {
  const { user } = useUser();
  const [message, setMessage] = useState('');
  const { complete, completion, error, isLoading } = useCompletion({
    api: generateAPIUrl('/api/completion'),
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    onError: (error) => {
      console.error('Completion Error:', error);
      console.error('Error details:', error.message);
    },
    streamProtocol: 'data',
  });

  const handleSubmit = async () => {
    if (message.trim()) {
      complete(message);
      setMessage('');
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    setMessage(suggestion);
    complete(suggestion);
  };

  return (
    <View className="flex-1 bg-background">
      <SignedIn>
        <View className="flex-1">
          {/* Header */}
          <View className="p-6 border-b border-border">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-2xl font-bold text-foreground">
                Ask AI Questions
              </Text>
              <ThemeToggle />
            </View>
            <Text className="text-muted-foreground">
              Get instant answers powered by AI
            </Text>
          </View>

          {/* Content */}
          <View className="flex-1 p-6">
            {/* Error Display */}
            {error && (
              <Card className="mb-6 p-4 border-destructive/50 bg-destructive/10">
                <Text className="text-destructive font-semibold mb-2">
                  Error: {error.message}
                </Text>
                <Text className="text-muted-foreground text-sm">
                  Please check your API configuration and try again.
                </Text>
              </Card>
            )}

            {/* Question Input */}
            <View className="mb-6">
              <Text className="text-foreground font-medium mb-3">
                What would you like to know?
              </Text>
              <View className="flex-row gap-3">
                <Input
                  placeholder="Ask any question..."
                  value={message}
                  onChangeText={setMessage}
                  className="flex-1 bg-secondary border-border"
                  multiline
                  style={{ 
                    minHeight: 48,
                    maxHeight: 120,
                    textAlignVertical: 'top'
                  }}
                />
                <Button 
                  onPress={handleSubmit}
                  disabled={isLoading || !message.trim()}
                  className="px-6 self-end"
                >
                  <Text className="text-primary-foreground font-medium">
                    {isLoading ? 'Asking...' : 'Ask'}
                  </Text>
                </Button>
              </View>
            </View>

            {/* Quick Suggestions */}
            {!completion && !isLoading && (
              <View className="mb-6">
                <Text className="text-foreground font-medium mb-4">
                  Or try one of these questions:
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {QUESTION_SUGGESTIONS.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="mb-2 h-auto py-3 px-4 rounded-lg border-border bg-secondary/30"
                      onPress={() => handleSuggestionPress(suggestion)}
                    >
                      <Text className="text-foreground text-sm text-center flex-wrap">
                        {suggestion}
                      </Text>
                    </Button>
                  ))}
                </View>
              </View>
            )}

            {/* Loading State */}
            {isLoading && (
              <Card className="p-6 bg-secondary/50">
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse" />
                  <Text className="text-muted-foreground">
                    AI is thinking...
                  </Text>
                </View>
              </Card>
            )}

            {/* Response Display */}
            {completion && (
              <View className="flex-1">
                <View className="flex-row items-center mb-4">
                  <Badge variant="default" className="mr-2">
                    <Text className="text-primary-foreground">AI Response</Text>
                  </Badge>
                  <Text className="text-xs text-muted-foreground">
                    Generated just now
                  </Text>
                </View>
                
                <Card className="p-6 bg-secondary/30 border-border">
                  <Text className="text-foreground leading-6 text-base">
                    {completion}
                  </Text>
                </Card>

                {/* Actions */}
                <View className="flex-row gap-3 mt-4">
                  <Button
                    variant="outline"
                    onPress={() => {
                      setMessage('');
                      // Reset completion by calling complete with empty string
                    }}
                    className="flex-1"
                  >
                    <Text className="text-foreground">Ask Another Question</Text>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onPress={() => {
                      // Could add copy to clipboard functionality
                    }}
                    className="px-6"
                  >
                    <Text className="text-muted-foreground">Copy</Text>
                  </Button>
                </View>
              </View>
            )}

            {/* Welcome State */}
            {!completion && !isLoading && !message && (
              <View className="flex-1 items-center justify-center">
                <Text className="text-6xl mb-4">🤖</Text>
                <Text className="text-xl font-semibold text-foreground mb-2">
                  Hello, {user?.firstName || 'there'}!
                </Text>
                <Text className="text-muted-foreground text-center">
                  I'm here to help answer your questions. What would you like to know?
                </Text>
              </View>
            )}
          </View>
        </View>
      </SignedIn>

      <SignedOut>
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-3xl font-bold text-center mb-4 text-foreground">
            Ask AI Questions
          </Text>
          <Text className="text-lg text-muted-foreground text-center mb-8">
            Get instant answers to your questions
          </Text>
          <Text className="text-base text-center mb-8 text-muted-foreground">
            Please sign in to start asking questions
          </Text>
          <Link href="/sign-in">
            <Button className="px-8 py-3">
              <Text className="text-primary-foreground font-semibold">
                Sign In with Google
              </Text>
            </Button>
          </Link>
        </View>
      </SignedOut>
    </View>
  );
}
