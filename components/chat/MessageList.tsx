import { View, ScrollView, Text, Pressable, Platform } from "react-native";
import type { Message } from "~/types";
import { CustomMarkdown } from "../CustomMarkdown";
import { memo, useState, useCallback, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';
import { AI_PROVIDERS } from '~/lib/ai-providers';

interface MessageMetadata {
  tokenCount?: number;
  processingTime?: number;
  finishReason?: string;
  reasoning?: string;
}

interface ExtendedMessage extends Message {
  metadata?: MessageMetadata;
}

interface MessageListProps {
  messages?: Message[];
  contentContainerStyle?: any;
}

const TypingIndicator = () => (
  <Text className="font-bold text-3xl">...</Text>
);

const MessageItem = memo(({ message }: { message: ExtendedMessage }) => {
  const isOptimistic = typeof message._id === 'string' && message._id.startsWith('temp-');
  const isLoading = !message.isComplete;
  const isAI = message.role === 'assistant';
  const [isMessageHovered, setIsMessageHovered] = useState(false);
  const [isCopyHovered, setIsCopyHovered] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);

  // Extract reasoning based on provider and model
  const extractReasoning = (content: string, provider?: string, model?: string) => {
    if (!provider || !model) return null;

    // Get provider config
    const providerConfig = AI_PROVIDERS[provider as keyof typeof AI_PROVIDERS];
    if (!providerConfig) return null;

    // Get model config
    const modelConfig = providerConfig.models.find(m => m.id === model);
    if (!modelConfig?.supportsReasoning) return null;

    switch (modelConfig.reasoningType) {
      case 'thinking':
        const thinkMatch = content.match(/<think>(.*?)<\/think>/s);
        return thinkMatch ? thinkMatch[1].trim() : null;
      case 'reasoning':
        const reasonMatch = content.match(/<reason>(.*?)<\/reason>/s);
        return reasonMatch ? reasonMatch[1].trim() : null;
      case 'native':
        // For models with native reasoning (like OpenAI's o-series)
        // The reasoning is part of the metadata
        return message.metadata?.reasoning || null;
      default:
        return null;
    }
  };

  const reasoning = isAI ? extractReasoning(message.content, message.provider, message.model) : null;
  const displayContent = isAI && reasoning ? 
    message.content.replace(/<think>.*?<\/think>/s, '')
      .replace(/<reason>.*?<\/reason>/s, '')
      .trim() : 
    message.content;

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
      className="mb-1 last:mb-0"
      onHoverIn={() => Platform.OS === 'web' && setIsMessageHovered(true)}
      onHoverOut={() => Platform.OS === 'web' && setIsMessageHovered(false)}
    >
      <View 
        className={`flex flex-row ${isAI ? 'justify-start' : 'justify-end'}`}
        style={{ opacity: isOptimistic ? 0.7 : 1 }}
      >
        <View 
          className={`max-w-[85%] rounded-2xl m-0 px-3 py-0 ${
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
                <CustomMarkdown content={displayContent} />
              </Text>
            )}
          </View>
        </View>
      </View>
      
      {!isLoading && (
        <View 
          className={`flex-row items-center gap-2 mt-0.5 px-4 transition-opacity duration-200 ${
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
          {reasoning && (
            <Pressable
              onPress={() => setShowReasoning(!showReasoning)}
              className={`flex-row items-center justify-center px-2 py-1 rounded transition-all duration-200 ${
                showReasoning
                  ? 'bg-[#b02372] dark:bg-[#d7c2ce]'
                  : 'bg-[#f5dbef] dark:bg-[#2b2431]'
              }`}
            >
              <Text className={`text-xs ${
                showReasoning
                  ? 'text-white dark:text-[#2b2431]'
                  : 'text-[#b02372] dark:text-[#d7c2ce]'
              }`}>
                {showReasoning ? 'Hide Reasoning' : 'Show Reasoning'}
              </Text>
            </Pressable>
          )}
          <Pressable
            onPress={copyToClipboard}
            onHoverIn={() => Platform.OS === 'web' && setIsCopyHovered(true)}
            onHoverOut={() => Platform.OS === 'web' && setIsCopyHovered(false)}
            className={`flex-row items-center justify-center w-6 h-6 rounded-md transition-all duration-200 ${
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
      
      {reasoning && showReasoning && (
        <View className="mt-2 px-4">
          <View className="bg-[#f5dbef]/30 dark:bg-[#2b2431] rounded-lg p-3 border border-[#f5dbef]/50 dark:border-[#181217]">
            <Text className="text-sm text-[#b02372] dark:text-[#d7c2ce] font-medium mb-1">
              Reasoning Process:
            </Text>
            <CustomMarkdown content={reasoning} />
          </View>
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
          paddingVertical: 16,
          paddingBottom: 160 
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
