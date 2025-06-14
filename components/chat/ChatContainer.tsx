import { View, SafeAreaView, TextInput, Text } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '~/convex/_generated/api';
import { Id } from '~/convex/_generated/dataModel';
import { useChat } from '@ai-sdk/react';
import { fetch as expoFetch } from 'expo/fetch';
import { MessageList } from './MessageList';
import { generateAPIUrl } from '~/app/utils/utils';
import type { PropsWithChildren } from 'react';
import { CustomMarkdown } from '../CustomMarkdown';

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
  const [isLoading, setIsLoading] = useState(false);
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
        }
      }
    };

    updateStreamingMessage();
  }, [streamingMessages, isStreamingLoading, currentAiMessageId]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!streamingInput.trim() || !user?.id || isLoading) return;
    setIsLoading(true);

    try {
      // Create new chat if needed
      let targetChatId = chatId;
      if (!targetChatId) {
        targetChatId = await createChat({
          title: streamingInput.slice(0, 50) + (streamingInput.length > 50 ? '...' : ''),
          userId: user.id,
          provider: 'google',
        });
        
        // Notify parent about new chat
        onChatCreated?.(targetChatId);
      }

      // Save user message to Convex
      await createStreamingMessage({
        chatId: targetChatId,
        role: 'user',
        content: streamingInput,
        isComplete: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Create initial AI message in Convex
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

      // Set current AI message ID for streaming updates
      setCurrentAiMessageId(aiMessageId);

      // Trigger streaming response
      await handleStreamingSubmit(e);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Combine Convex and streaming messages for display
  const displayMessages = messages || [];
  const streamingMessage = streamingMessages[streamingMessages.length - 1];
  const isStreaming = isStreamingLoading && streamingMessage?.role === 'assistant';

  return (
    <View className="flex-1 flex-col px-4 max-w-3xl mx-auto w-full">
      {children}
      <View className="flex-1">
        <MessageList messages={displayMessages} />
        {isStreaming && (
          <View className="flex flex-row justify-start">
            <View className="max-w-[85%] rounded-2xl p-4 bg-muted rounded-bl-none">
                <CustomMarkdown content={streamingMessage.content} />
            </View>
          </View>
        )}
      </View>
      <View className="py-4">
        <TextInput
          className="bg-input text-foreground rounded-lg px-4 py-3 w-full"
          placeholder="Say something..."
          placeholderTextColor="#666"
          value={streamingInput}
          onChange={e =>
            handleInputChange({
              ...e,
              target: {
                ...e.target,
                value: e.nativeEvent.text,
              },
            } as unknown as React.ChangeEvent<HTMLInputElement>)
          }
          onSubmitEditing={handleSubmit}
          autoFocus={true}
        />
      </View>
    </View>
  );
} 