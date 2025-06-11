import { Input } from '~/components/ui/input';
import './globals.css';

import { generateAPIUrl } from './utils/utils';
import { useChat } from '@ai-sdk/react';
import { Link } from 'expo-router';
import { fetch as expoFetch } from 'expo/fetch';
import { View, ScrollView, SafeAreaView, Pressable } from 'react-native';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';

export default function App() {
  const { messages, error, handleInputChange, input, handleSubmit } = useChat({
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    api: generateAPIUrl('/api/chat'),
    onError: error => console.error(error, 'ERROR'),
  });

  if (error) return <Text className="p-4 text-destructive">{error.message}</Text>;

  const suggestionCards = [
    { icon: "✨", title: "Create", subtitle: "Help me brainstorm ideas" },
    { icon: "🔍", title: "Explore", subtitle: "Research a topic" },
    { icon: "💻", title: "Code", subtitle: "Write and debug code" },
    { icon: "📚", title: "Learn", subtitle: "Explain concepts" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 flex-col">
        {/* Chat Messages Area */}
        <ScrollView className="flex-1 px-4">
          {messages.length === 0 ? (
            // Welcome Screen
            <View className="flex-1 justify-center items-center py-8">
              <Text className="text-3xl font-bold text-center mb-8 text-foreground">
                How can I help you, Prathmesh?
              </Text>
              
              {/* Suggestion Cards */}
              <View className="grid grid-cols-2 gap-4 w-full max-w-2xl">
                {suggestionCards.map((card, index) => (
                  <Card key={index} className="p-4 border border-border bg-card">
                    <View className="flex-row items-center space-x-3">
                      <Text className="text-xl">{card.icon}</Text>
                      <View className="flex-1">
                        <Text className="font-semibold text-card-foreground">{card.title}</Text>
                        <Text className="text-sm text-muted-foreground mt-1">{card.subtitle}</Text>
                      </View>
                    </View>
                  </Card>
                ))}
              </View>

              {/* Sample Questions */}
              <View className="mt-8 space-y-3 w-full max-w-2xl">
                <Pressable className="p-3 bg-muted rounded-lg">
                  <Text className="text-muted-foreground text-center">How does AI work?</Text>
                </Pressable>
                <Pressable className="p-3 bg-muted rounded-lg">
                  <Text className="text-muted-foreground text-center">Are black holes real?</Text>
                </Pressable>
                <Pressable className="p-3 bg-muted rounded-lg">
                  <Text className="text-muted-foreground text-center">How many Rs are in the word "strawberry"?</Text>
                </Pressable>
                <Pressable className="p-3 bg-muted rounded-lg">
                  <Text className="text-muted-foreground text-center">What is the meaning of life?</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            // Chat Messages
            <View className="py-4">
              {messages.map((m) => (
                <View key={m.id} className={`mb-6 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <View className={`max-w-[80%] ${m.role === 'user' ? 'bg-primary' : 'bg-muted'} rounded-lg p-4`}>
                    <Text className={`${m.role === 'user' ? 'text-primary-foreground' : 'text-foreground'}`}>
                      {m.content}
                    </Text>
                  </View>
                  <Text className="text-xs text-muted-foreground mt-1 px-2">
                    {m.role === 'user' ? 'You' : 'AI'}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View className="p-4 border-t border-border bg-background">
          <View className="flex-row items-end space-x-2">
            <View className="flex-1">
              <Input
                placeholder="Type your message here..."
                value={input}
                onChange={e =>
                  handleInputChange({
                    ...e,
                    target: {
                      ...e.target,
                      value: e.nativeEvent.text,
                    },
                  } as unknown as React.ChangeEvent<HTMLInputElement>)
                }
                onSubmitEditing={e => {
                  handleSubmit(e);
                  e.preventDefault();
                }}
                className="flex-1"
                autoFocus={false}
              />
            </View>
            <Button 
              onPress={() => handleSubmit()}
              disabled={!input.trim()}
              className="px-4 py-2"
            >
              <Text>Send</Text>
            </Button>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}