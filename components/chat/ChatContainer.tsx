import { View, SafeAreaView, Text } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useState, useEffect, useMemo } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '~/convex/_generated/api';
import { Id } from '~/convex/_generated/dataModel';
import { useChat } from '@ai-sdk/react';
import { fetch as expoFetch } from 'expo/fetch';
import { MessageList } from './MessageList';
import { generateAPIUrl } from '~/app/utils/utils';
import type { PropsWithChildren } from 'react';
import { CustomMarkdown } from '../CustomMarkdown';
import { ChatInput } from './ChatInput';

interface ChatContainerProps {
  chatId: Id<"chats"> | null;
  onChatCreated?: (newChatId: Id<"chats">) => void;
}

export function ChatContainer({ 
  chatId, 
  onChatCreated,
  children 
}: PropsWithChildren<ChatContainerProps>) {
  const { user } = useUser();
  const [optimisticMessages, setOptimisticMessages] = useState<any[]>([]);
  const [currentAiMessageId, setCurrentAiMessageId] = useState<Id<"messages"> | null>(null);
  const createStreamingMessage = useMutation(api.messages.createStreamingMessage);
  const updateMessageContent = useMutation(api.messages.updateMessageContent);
  const createChat = useMutation(api.chats.createChat);
  const messages = useQuery(api.messages.getChatMessages, 
    chatId ? { chatId } : 'skip'
  );

  const {
    handleInputChange,
    input: streamingInput,
    handleSubmit: handleStreamingSubmit,
    isLoading: isStreamingLoading,
    messages: streamingMessages
  } = useChat({
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    api: generateAPIUrl('/api/chat'),
    onError: error => console.error(error, 'ERROR'),
  });

  // Effect to update Convex with streaming messages
  useEffect(() => {
    const updateStreamingMessage = async () => {
      if (!currentAiMessageId || !streamingMessages.length) return;

      const lastMessage = streamingMessages[streamingMessages.length - 1];
      if (lastMessage?.role === 'assistant' && lastMessage.content) {
        await updateMessageContent({
          messageId: currentAiMessageId,
          content: lastMessage.content,
          isComplete: !isStreamingLoading,
        });

        if (!isStreamingLoading) {
          setCurrentAiMessageId(null);
          setOptimisticMessages([]);
        }
      }
    };

    updateStreamingMessage();
  }, [streamingMessages, isStreamingLoading, currentAiMessageId]);

  const handleSubmit = async () => {
    if (!streamingInput.trim() || !user?.id || isStreamingLoading) return;

    const timestamp = Date.now();
    
    // Add optimistic user message
    const optimisticUserMessage = {
      _id: `temp-user-${timestamp}`,
      role: 'user',
      content: streamingInput,
      createdAt: timestamp,
      updatedAt: timestamp,
      isComplete: true
    };

    // Add optimistic AI message
    const optimisticAiMessage = {
      _id: `temp-ai-${timestamp}`,
      role: 'assistant',
      content: '...',
      createdAt: timestamp,
      updatedAt: timestamp,
      isComplete: false
    };

    setOptimisticMessages([optimisticUserMessage, optimisticAiMessage]);

    try {
      // Create new chat if needed
      let targetChatId = chatId;
      if (!targetChatId) {
        targetChatId = await createChat({
          title: streamingInput.slice(0, 50) + (streamingInput.length > 50 ? '...' : ''),
          userId: user.id,
          provider: 'google',
        });
        
        onChatCreated?.(targetChatId);
      }

      // Save user message to Convex
      await createStreamingMessage({
        chatId: targetChatId,
        role: 'user',
        content: streamingInput,
        isComplete: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      // Create initial AI message in Convex
      const aiMessageId = await createStreamingMessage({
        chatId: targetChatId,
        role: 'assistant',
        content: '',
        provider: 'google',
        model: 'gemini-1.5-flash',
        isComplete: false,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      setCurrentAiMessageId(aiMessageId);

      // Trigger streaming response
      await handleStreamingSubmit({} as any);
    } catch (error) {
      console.error('Error:', error);
      // Remove optimistic messages on error
      setOptimisticMessages([]);
    }
  };

  // Combine and deduplicate messages
  const displayMessages = useMemo(() => {
    if (!messages) return optimisticMessages;
    
    // Create a map of real messages by timestamp
    const realMessagesByTime = new Map(
      messages.map(msg => [msg.createdAt, msg])
    );

    // Filter out optimistic messages that have corresponding real messages
    const remainingOptimistic = optimisticMessages.filter(
      msg => !realMessagesByTime.has(msg.createdAt)
    );

    return [...messages, ...remainingOptimistic];
  }, [messages, optimisticMessages]);

  const streamingMessage = streamingMessages[streamingMessages.length - 1];
  const isStreaming = isStreamingLoading && streamingMessage?.role === 'assistant';

  // Update optimistic AI message content while streaming
  if (isStreaming && optimisticMessages.length > 0) {
    optimisticMessages[optimisticMessages.length - 1].content = streamingMessage.content;
  }

  return (
    <View className="flex-1 flex-col px-4 max-w-3xl mx-auto w-full">
      {children}
      <View className="flex-1">
        <MessageList messages={displayMessages} />
      </View>
      <ChatInput
        input={streamingInput}
        onInputChange={(text) =>
          handleInputChange({
            target: { value: text },
          } as unknown as React.ChangeEvent<HTMLInputElement>)
        }
        onSubmit={handleSubmit}
        isLoading={isStreamingLoading}
      />
    </View>
  );
} 