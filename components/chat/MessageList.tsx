import { View, Text, ScrollView } from "react-native";
import { CustomMarkdown } from "../CustomMarkdown";
import type { Message } from "~/types";

interface MessageListProps {
  messages?: Message[];
  contentContainerStyle?: any;
}

export function MessageList({ messages, contentContainerStyle }: MessageListProps) {
  if (!messages?.length) return null;

  return (
    <ScrollView 
      className="flex-1"
      contentContainerStyle={{ 
        paddingBottom: 16,
        ...contentContainerStyle 
      }}
    >
      <View className="w-full max-w-[768px] mx-auto px-4">
        {messages.map((message) => (
          <View
            key={message._id}
            className={`mb-8 flex ${
              message.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <View className="flex-row items-start gap-3">
              {message.role === 'assistant' && (
                <View className="h-8 w-8 rounded-lg bg-primary/10 items-center justify-center">
                  <Text className="text-primary font-medium">AI</Text>
                </View>
              )}
              <View className="flex-1 max-w-[90%]">
                <CustomMarkdown content={message.content} />
                <Text className="text-xs text-muted-foreground mt-1">
                  {message.role === 'user' ? 'You' : 'Assistant'}
                </Text>
              </View>
              {message.role === 'user' && (
                <View className="h-8 w-8 rounded-lg bg-primary/10 items-center justify-center">
                  <Text className="text-primary font-medium">You</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
} 