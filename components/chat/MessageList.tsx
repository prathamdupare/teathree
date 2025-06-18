import { View, ScrollView, Text, Pressable, Platform } from "react-native";
import type { Message } from "~/types";
import { CustomMarkdown } from "../CustomMarkdown";
import { memo, useState, useCallback, useEffect } from "react";
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
  const [isMessageHovered, setIsMessageHovered] = useState(false);
  const [isCopyHovered, setIsCopyHovered] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => setHasCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCopied]);

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(message.content);
    setHasCopied(true);
  };

  const isControlsVisible = Platform.OS === 'web' ? (isMessageHovered || isCopyHovered) : true;

  return (
    <Pressable 
      className="mb-4 last:mb-0"
      onHoverIn={() => Platform.OS === 'web' && setIsMessageHovered(true)}
      onHoverOut={() => Platform.OS === 'web' && setIsMessageHovered(false)}
    >
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
        </View>
      </View>
      
      {!isLoading && (
        <View 
          className={`flex-row items-center gap-2 mt-1 px-4 transition-opacity duration-200 ${
            isControlsVisible ? 'opacity-100' : 'opacity-0'
          } ${isAI ? 'justify-start' : 'justify-end'}`}
        >
          {isAI && message.model && (
            <Text 
              className="text-xs text-[hsl(var(--text-muted))]"
              style={{ fontFamily: 'Ubuntu' }}
            >
              {message.model}
            </Text>
          )}
          <Pressable
            onPress={copyToClipboard}
            onHoverIn={() => Platform.OS === 'web' && setIsCopyHovered(true)}
            onHoverOut={() => Platform.OS === 'web' && setIsCopyHovered(false)}
            className={`flex-row items-center justify-center w-6 h-6 rounded-full transition-all duration-200 ${
              hasCopied
                ? 'bg-[#b02372] dark:bg-[#d7c2ce]'
                : isCopyHovered 
                  ? 'bg-[#ecc7e4] dark:bg-[#362d3c]' 
                  : 'bg-[#f5dbef] dark:bg-[#2b2431]'
            }`}
          >
            <Ionicons 
              name={hasCopied ? "checkmark" : "copy-outline"} 
              size={16}
              className={`transition-colors duration-200 ${
                hasCopied
                  ? 'text-white dark:text-[#2b2431]'
                  : 'text-[#b02372] dark:text-[#d7c2ce]'
              }`}
            />
          </Pressable>
        </View>
      )}
    </Pressable>
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
