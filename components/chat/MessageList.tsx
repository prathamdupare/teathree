import { View, ScrollView, Text, Pressable } from "react-native";
import type { Message } from "~/types";
import { CustomMarkdown } from "../CustomMarkdown";
import { memo } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';

interface MessageListProps {
  messages?: Message[];
  contentContainerStyle?: any;
}

const TypingIndicator = () => (
  <Text className="font-bold text-3xl">...</Text>
);

const MessageItem = memo(({ message }: { message: Message }) => {
  const isOptimistic = typeof message._id === 'string' && message._id.startsWith('temp-');
  const isLoading = !message.isComplete;
  const isAI = message.role === 'assistant';

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(message.content);
  };

  return (
    <View 
      className={`flex flex-row ${isAI ? 'justify-start' : 'justify-end'}`}
      style={{ opacity: isOptimistic ? 0.7 : 1 }}
    >
      <View 
        className={`max-w-[85%] rounded-2xl m-0 px-4 py-3 ${
          isAI 
            ? 'rounded bg-transparent' 
            : 'rounded bg-[#f5dbef] dark:bg-[#2b2431]'
        }`}
      >
        <View className="flex-1">
          {message.content === '...' && isAI && isLoading ? (
            <TypingIndicator />
          ) : (
            <Text 
              className={`text-base p-0 m-0 ${
                isAI 
                  ? 'text-[hsl(var(--text-primary))]' 
                  : 'text-[hsl(var(--text-primary))]'
              }`}
            >
              <CustomMarkdown content={message.content} />
            </Text>
          )}
        </View>
        {!isLoading && isAI && (
          <View className="flex-row items-center gap-2 mt-2">
            {message.model && (
              <Text 
                className="text-xs text-[hsl(var(--text-muted))]"
                style={{ fontFamily: 'Ubuntu' }}
              >
                {message.model}
              </Text>
            )}
            <Pressable
              onPress={copyToClipboard}
              className="flex-row items-center justify-center w-6 h-6 rounded-full bg-[#f5dbef] dark:bg-[#2b2431] hover:bg-[#ecc7e4] dark:hover:bg-[#362d3c]"
            >
              <Ionicons 
                name="copy-outline" 
                size={14}
                className="text-[#b02372] dark:text-[#d7c2ce]"
              />
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
});

export function MessageList({ messages, contentContainerStyle }: MessageListProps) {
  if (!messages?.length) return null;

  return (
    <ScrollView 
      className="flex-1 px-6 bg-[#f8f2f8] dark:bg-[#221d27]"
      contentContainerStyle={[
        { 
          paddingVertical: 20,
          paddingBottom: 180 
        }, 
        contentContainerStyle
      ]}
      showsVerticalScrollIndicator={false}
    >
      {messages.map((message) => (
        <MessageItem key={message._id} message={message} />
      ))}
    </ScrollView>
  );
} 
