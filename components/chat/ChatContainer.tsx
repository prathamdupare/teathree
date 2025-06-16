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
import { generateChatTitle } from '~/convex/chats';

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
  const generateChatTitle = useMutation(api.chats.generateChatTitle);
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
  const updateChatTitle = useMutation(api.chats.updateChatTitle);
  
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

  useEffect(() => {
    if (!convexMessages) {
      setLocalMessages([]);
      return;
    }

    setLocalMessages(prev => {
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
          title: 'New Chat',
          userId: user.id,
          provider: selectedProvider,
          model: selectedModel,
        });

        try {
          // Generate title using the new API
          const titleResponse = await fetch(generateAPIUrl('/api/gettitle'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: streamingInput,
              provider: 'openai',
              model: 'gpt-3.5-turbo'
            })
          });
          
          const data = await titleResponse.json();
          console.log('Title API response:', data);
          
          if (data.error) {
            console.error('Title generation failed:', data.error);
            throw new Error(data.details || data.error);
          }

          if (data.title) {
            await updateChatTitle({
              chatId: targetChatId,
              title: data.title
            });
          }
        } catch (error) {
          console.error('Failed to generate/update title:', error);
          // Use a simple title as fallback
          await updateChatTitle({
            chatId: targetChatId,
            title: streamingInput.slice(0, 30) + '...'
          });
        }
        
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
    <View className="flex-1 flex flex-col bg-[#f8f2f8] dark:bg-[#221d27] border-t-[10px] border-[#f5dbef] dark:border-[#181217] rounded-t-lg">
      <View className="max-w-4xl mx-auto w-full flex-1">
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
    </View>
  );
} 