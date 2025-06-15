import { View, SafeAreaView, Text } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useState, useEffect, useMemo, useRef } from 'react';
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
import { AI_PROVIDERS } from "~/lib/ai-providers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Button } from '~/components/ui/button';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ModelSelector } from './ModelSelector';

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
  // Track messages in local state to maintain continuity
  const [localMessages, setLocalMessages] = useState<any[]>([]);
  const [currentAiMessageId, setCurrentAiMessageId] = useState<Id<"messages"> | null>(null);
  const lastUpdateRef = useRef<string>('');
  const createStreamingMessage = useMutation(api.messages.createStreamingMessage);
  const updateMessageContent = useMutation(api.messages.updateMessageContent);
  const createChat = useMutation(api.chats.createChat);
  const convexMessages = useQuery(api.messages.getChatMessages, 
    chatId ? { chatId } : 'skip'
  );
  const chat = useQuery(api.chats.getChat, 
    chatId ? { chatId } : 'skip'
  );

  // Initialize provider/model from chat or defaults
  const [selectedProvider, setSelectedProvider] = useState(
    chat?.currentProvider || 'google'
  );
  const [selectedModel, setSelectedModel] = useState(
    chat?.currentModel || AI_PROVIDERS.google.models.find(m => m.isDefault)?.id || 'gemini-1.5-flash'
  );

  // Update when chat changes
  useEffect(() => {
    if (chat) {
      setSelectedProvider(chat.currentProvider);
      setSelectedModel(chat.currentModel);
    }
  }, [chat]);

  const updateChatProvider = useMutation(api.chats.updateChatProvider);
  
  const handleProviderModelChange = async (provider: string, model: string) => {
    setSelectedProvider(provider);
    setSelectedModel(model);
    
    if (chatId) {
      await updateChatProvider({
        chatId,
        provider,
        model,
      });
    }
  };

  const {
    handleInputChange,
    input: streamingInput,
    handleSubmit: handleStreamingSubmit,
    isLoading: isStreamingLoading,
    messages: streamingMessages
  } = useChat({
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    api: generateAPIUrl('/api/chat'),
    body: {
      provider: selectedProvider,
      model: selectedModel
    },
    onError: error => console.error(error, 'ERROR'),
  });

  // Sync local state with Convex messages while preserving optimistic updates
  useEffect(() => {
    if (!convexMessages) {
      setLocalMessages([]);
      return;
    }

    setLocalMessages(prev => {
      // Keep optimistic messages during streaming
      if (isStreamingLoading && currentAiMessageId) {
        const optimisticAiMessage = prev.find(msg => msg.role === 'assistant' && !msg.isComplete);
        if (optimisticAiMessage) {
          return convexMessages.map(msg => 
            msg._id === currentAiMessageId ? optimisticAiMessage : msg
          );
        }
      }
      return convexMessages;
    });
  }, [convexMessages, isStreamingLoading, currentAiMessageId]);

  const handleSubmit = async () => {
    if (!streamingInput.trim() || !user?.id || isStreamingLoading) return;

    const timestamp = Date.now();
    
    // Create optimistic messages
    const optimisticUserMessage = {
      _id: `temp-user-${timestamp}`,
      role: 'user',
      content: streamingInput,
      createdAt: timestamp,
      updatedAt: timestamp,
      isComplete: true
    };

    const optimisticAiMessage = {
      _id: `temp-ai-${timestamp}`,
      role: 'assistant',
      content: '...',
      createdAt: timestamp,
      updatedAt: timestamp,
      isComplete: false
    };

    // Update local messages immediately
    setLocalMessages(prev => [...prev, optimisticUserMessage, optimisticAiMessage]);

    try {
      // Create new chat if needed
      let targetChatId = chatId;
      if (!targetChatId) {
        targetChatId = await createChat({
          title: streamingInput.slice(0, 50) + (streamingInput.length > 50 ? '...' : ''),
          userId: user.id,
          provider: selectedProvider,
          model: selectedModel,
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

      // Create placeholder AI message in Convex
      const aiMessageId = await createStreamingMessage({
        chatId: targetChatId,
        role: 'assistant',
        content: '',
        provider: selectedProvider,
        model: selectedModel,
        isComplete: false,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      setCurrentAiMessageId(aiMessageId);

      // Start streaming
      await handleStreamingSubmit({} as any);
    } catch (error) {
      console.error('Error:', error);
      // Revert local messages on error
      setLocalMessages(convexMessages || []);
    }
  };

  // Effect to update Convex when streaming is complete
  useEffect(() => {
    const updateStreamingMessage = async () => {
      if (!currentAiMessageId || !streamingMessages.length) return;

      const lastMessage = streamingMessages[streamingMessages.length - 1];
      if (lastMessage?.role === 'assistant' && lastMessage.content) {
        // Update local state immediately
        setLocalMessages(prev => 
          prev.map(msg => 
            msg._id === currentAiMessageId 
              ? { ...msg, content: lastMessage.content, isComplete: !isStreamingLoading }
              : msg
          )
        );

        // Update Convex with chunks during streaming
        if (lastMessage.content !== lastUpdateRef.current) {
          await updateMessageContent({
            messageId: currentAiMessageId,
            content: lastMessage.content,
            isComplete: !isStreamingLoading,
          });
          lastUpdateRef.current = lastMessage.content;
        }
        
        // Clean up when streaming is complete
        if (!isStreamingLoading) {
          setCurrentAiMessageId(null);
          lastUpdateRef.current = '';
        }
      }
    };

    updateStreamingMessage();
  }, [streamingMessages, isStreamingLoading, currentAiMessageId]);

  return (
    <View className="flex-1 flex-col px-4 max-w-3xl mx-auto w-full">
      <ModelSelector 
        selectedProvider={selectedProvider}
        selectedModel={selectedModel}
        onModelSelect={handleProviderModelChange}
      />
      {children}
      <View className="flex-1">
        <MessageList messages={localMessages} />
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
        selectedProvider={selectedProvider}
        selectedModel={selectedModel}
        onModelSelect={handleProviderModelChange}
      />
    </View>
  );
} 