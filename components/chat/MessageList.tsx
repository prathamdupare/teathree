import { View, ScrollView, Text, Pressable, Platform, ActivityIndicator } from "react-native";
import type { Message } from "~/types";
import { CustomMarkdown } from "../CustomMarkdown";
import { memo, useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';
import { AI_PROVIDERS, getModelDisplayName } from '~/lib/ai-providers';
import { useQuery } from 'convex/react';
import { api } from '~/convex/_generated/api';
import { Id } from '~/convex/_generated/dataModel';

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
  messages: ExtendedMessage[];
  contentContainerStyle?: any;
  enableReasoning?: boolean;
}

const TypingIndicator = ({ size = 20 }: { size?: number }) => (
  <ActivityIndicator 
    size="small" 
    color="#b02372" 
    style={{ width: size, height: size }}
  />
);

const MessageItem = memo(({ message, enableReasoning = false }: { message: ExtendedMessage; enableReasoning?: boolean }) => {
  const isOptimistic = typeof message._id === 'string' && message._id.startsWith('temp-');
  const isLoading = !message.isComplete;
  const isAI = message.role === 'assistant';
  const [isMessageHovered, setIsMessageHovered] = useState(false);
  const [isCopyHovered, setIsCopyHovered] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);

  // Extract reasoning using useMemo to prevent re-computation on every render/hover
  const { reasoning, displayContent, hasReasoningCapability } = useMemo(() => {
    if (!isAI) {
      return { reasoning: null, displayContent: message.content, hasReasoningCapability: false };
    }

    console.log('[MessageItem] Extracting reasoning for message:', { 
      messageId: message._id,
      provider: message.provider, 
      model: message.model, 
      contentLength: message.content?.length,
      hasContent: !!message.content,
      hasMetadata: !!message.metadata,
      metadataReasoning: message.metadata?.reasoning
    });

    // Check if this model supports reasoning to determine if we should show the dropdown
    let hasReasoningCapability = false;
    if (message.provider && message.model) {
      const providerConfig = AI_PROVIDERS[message.provider as keyof typeof AI_PROVIDERS];
      if (providerConfig) {
        const modelConfig = providerConfig.models.find(m => m.id === message.model);
        hasReasoningCapability = !!modelConfig?.supportsReasoning;
      }
    }

    // First check if reasoning is already in metadata (for native reasoning models)
    if (message.metadata?.reasoning) {
      console.log('[MessageItem] Found reasoning in metadata:', {
        messageId: message._id,
        reasoningLength: message.metadata.reasoning.length
      });
      return {
        reasoning: message.metadata.reasoning,
        displayContent: message.content,
        hasReasoningCapability
      };
    }

    if (!message.provider || !message.model) {
      console.log('[MessageItem] No provider or model:', { 
        messageId: message._id,
        provider: message.provider, 
        model: message.model 
      });
      return { reasoning: null, displayContent: message.content, hasReasoningCapability };
    }

    // Get provider config
    const providerConfig = AI_PROVIDERS[message.provider as keyof typeof AI_PROVIDERS];
    if (!providerConfig) {
      console.log('[MessageItem] No provider config found:', { 
        messageId: message._id,
        provider: message.provider 
      });
      return { reasoning: null, displayContent: message.content, hasReasoningCapability };
    }

    // Get model config
    const modelConfig = providerConfig.models.find(m => m.id === message.model);
    if (!modelConfig?.supportsReasoning) {
      console.log('[MessageItem] Model does not support reasoning:', { 
        messageId: message._id,
        model: message.model, 
        modelConfig: modelConfig,
        supportsReasoning: modelConfig?.supportsReasoning 
      });
      return { reasoning: null, displayContent: message.content, hasReasoningCapability };
    }

    console.log('[MessageItem] Model supports reasoning, extracting...:', { 
      messageId: message._id,
      model: message.model, 
      reasoningType: modelConfig.reasoningType,
      supportsReasoning: modelConfig.supportsReasoning 
    });

    let extractedReasoning: string | null = null;
    let cleanContent = message.content;

    switch (modelConfig.reasoningType) {
      case 'thinking': {
        const thinkMatch = message.content.match(/<think>(.*?)<\/think>/s);
        console.log('[MessageItem] Thinking extraction result:', { 
          messageId: message._id,
          hasMatch: !!thinkMatch, 
          matchLength: thinkMatch?.[1]?.length,
          contentPreview: message.content.substring(0, 200) + '...'
        });
        if (thinkMatch) {
          extractedReasoning = thinkMatch[1].trim();
          cleanContent = message.content.replace(/<think>.*?<\/think>/s, '').trim();
        }
        break;
      }
      case 'reasoning': {
        const reasonMatch = message.content.match(/<reason>(.*?)<\/reason>/s);
        console.log('[MessageItem] Reasoning extraction result:', { 
          messageId: message._id,
          hasMatch: !!reasonMatch, 
          matchLength: reasonMatch?.[1]?.length 
        });
        if (reasonMatch) {
          extractedReasoning = reasonMatch[1].trim();
          cleanContent = message.content.replace(/<reason>.*?<\/reason>/s, '').trim();
        }
        break;
      }
      case 'native': {
        // For models with native reasoning (like OpenAI's o-series)
        // The reasoning should be in metadata, which we already checked above
        console.log('[MessageItem] Native reasoning (should be in metadata):', { 
          messageId: message._id,
          hasMetadata: !!message.metadata,
          hasReasoning: !!message.metadata?.reasoning
        });
        extractedReasoning = message.metadata?.reasoning || null;
        break;
      }
      default: {
        console.log('[MessageItem] Unknown reasoning type:', {
          messageId: message._id,
          reasoningType: modelConfig.reasoningType
        });
        break;
      }
    }

    console.log('[MessageItem] Final reasoning extraction result:', { 
      messageId: message._id,
      hasReasoning: !!extractedReasoning, 
      reasoningLength: extractedReasoning?.length,
      cleanContentLength: cleanContent.length,
      provider: message.provider,
      model: message.model
    });

    return {
      reasoning: extractedReasoning,
      displayContent: cleanContent,
      hasReasoningCapability
    };
  }, [message._id, message.content, message.provider, message.model, message.metadata, isAI]);

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

  // Determine if we should show reasoning section (only if reasoning is enabled AND model supports it AND either loading or reasoning exists)
  const shouldShowReasoningSection = isAI && enableReasoning && hasReasoningCapability && (isLoading || reasoning);
  const isReasoningLoading = isLoading && enableReasoning && hasReasoningCapability && !reasoning;

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
          {/* Reasoning Section - Always shown for AI messages from reasoning-capable models */}
          {shouldShowReasoningSection && (
            <View className="mb-3">
              <Pressable
                onPress={() => setShowReasoning(!showReasoning)}
                className="flex-row items-center gap-2 py-2"
                disabled={isReasoningLoading}
              >
                <Ionicons 
                  name={showReasoning ? "chevron-down" : "chevron-forward"} 
                  size={16} 
                  color="#b02372" 
                />
                <Text className="text-sm text-[#b02372] dark:text-[#d7c2ce] font-medium">
                  Reasoning
                </Text>
                {isReasoningLoading && (
                  <View className="ml-1">
                    <TypingIndicator size={16} />
                  </View>
                )}
              </Pressable>
              
              {showReasoning && reasoning && (
                <View className="mt-2 bg-[#f5dbef]/30 dark:bg-[#2b2431] rounded-lg p-3 border border-[#f5dbef]/50 dark:border-[#181217]">
                  <CustomMarkdown content={reasoning} />
                </View>
              )}
            </View>
          )}

          {/* Main Content */}
          <View className="flex-1">
            {message.content === '...' && isAI && isLoading ? (
              <TypingIndicator />
            ) : (
              <CustomMarkdown content={displayContent} />
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
              {getModelDisplayName(message.provider || '', message.model)}
            </Text>
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
    </Pressable>
  );
});

MessageItem.displayName = "MessageItem";

export function MessageList({ messages, contentContainerStyle, enableReasoning = false }: MessageListProps) {
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
        <MessageItem 
          key={message._id} 
          message={message as ExtendedMessage}
          enableReasoning={enableReasoning}
        />
      ))}
    </ScrollView>
  );
} 
