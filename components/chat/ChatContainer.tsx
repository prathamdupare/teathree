import { View} from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '~/convex/_generated/api';
import { Id } from '~/convex/_generated/dataModel';
import { useChat } from '@ai-sdk/react';
import { fetch as expoFetch } from 'expo/fetch';
import { MessageList } from './MessageList';
import { generateAPIUrl } from '~/app/utils/utils';
import type { PropsWithChildren } from 'react';
import { ChatInput } from './ChatInput';
import { AI_PROVIDERS } from "~/lib/ai-providers";
import type { Message } from "~/types";
import { StreamingMessageManager } from "~/lib/streamingMessageManager";
import { StreamingSimulator } from "~/lib/streamingSimulator";

interface ChatContainerProps {
  chatId: Id<"chats"> | null;
  onChatCreated?: (newChatId: Id<"chats">) => void;
  defaultInputValue?: string;
}

interface MessageMetadata {
  tokenCount?: number;
  processingTime?: number;
  finishReason?: string;
  reasoning?: string;
  reasoningTokens?: number;
}

interface UIMessage {
  _id: Id<"messages"> | string;
  _creationTime: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  isComplete?: boolean;
  createdAt: number;
  updatedAt: number;
  chatId: Id<"chats">;
  provider?: string;
  model?: string;
  metadata?: {
    tokenCount?: number;
    processingTime?: number;
    finishReason?: string;
    reasoning?: string;
    reasoningTokens?: number;
  };
}

interface StreamMessage {
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    reasoning?: string;
    [key: string]: any;
  };
}

// AI SDK message structure with parts
interface AISDKMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  parts?: Array<{
    type: 'text' | 'reasoning' | 'tool-invocation' | 'file' | 'source';
    text?: string;
    reasoning?: string;
    details?: Array<{ type: 'text' | 'redacted'; text?: string }>;
    [key: string]: any;
  }>;
}

export function ChatContainer({ 
  chatId, 
  onChatCreated,
  defaultInputValue = '',
  children 
}: PropsWithChildren<ChatContainerProps>) {
  const { user } = useUser();
  const [localMessages, setLocalMessages] = useState<UIMessage[]>([]);
  const [currentAiMessageId, setCurrentAiMessageId] = useState<Id<"messages"> | null>(null);
  const streamingContentRef = useRef<string>('');
  const tempMessageIdRef = useRef<string | null>(null);
  const streamingSimulatorRef = useRef<StreamingSimulator | null>(null);
  const createStreamingMessage = useMutation(api.messages.createStreamingMessage);
  const updateMessageContent = useMutation(api.messages.updateMessageContent);
  const createChat = useMutation(api.chats.createChat);
  const convexMessages = useQuery(api.messages.getChatMessages, 
    chatId ? { chatId } : 'skip'
  );
  const chat = useQuery(api.chats.getChat, 
    chatId ? { chatId } : 'skip'
  );

  const streamManagerRef = useRef<StreamingMessageManager | null>(null);

  // Initialize StreamingMessageManager
  useEffect(() => {
    streamManagerRef.current = new StreamingMessageManager(async (opts) => {
      await updateMessageContent({
        messageId: opts.messageId,
        content: opts.content,
        isComplete: opts.isComplete,
        metadata: opts.metadata
      });
    });

    return () => {
      if (streamManagerRef.current) {
        streamManagerRef.current.reset();
      }
    };
  }, [updateMessageContent]);

  // Initialize StreamingSimulator
  useEffect(() => {
    streamingSimulatorRef.current = new StreamingSimulator({
      onUpdate: (content) => {
        if (tempMessageIdRef.current) {
          setLocalMessages(prev => 
            prev.map(msg => 
              msg._id === tempMessageIdRef.current
                ? { ...msg, content }
                : msg
            )
          );
        }
      },
      minDelay: 2,
      maxDelay: 8,
      adaptiveSpeed: true,
      wordByWord: false
    });

    return () => {
      if (streamingSimulatorRef.current) {
        streamingSimulatorRef.current.stop();
      }
    };
  }, []);

  const [selectedProvider, setSelectedProvider] = useState(
    chat?.currentProvider || 'google'
  );
  const [selectedModel, setSelectedModel] = useState(
    chat?.currentModel || AI_PROVIDERS.google.models.find(m => m.isDefault)?.id || 'gemini-1.5-flash'
  );
  const [enableReasoning, setEnableReasoning] = useState(
    chat?.enableReasoning || false
  );

  // Update when chat changes
  useEffect(() => {
    if (chat) {
      setSelectedProvider(chat.currentProvider);
      setSelectedModel(chat.currentModel);
      setEnableReasoning(chat.enableReasoning || false);
    }
  }, [chat]);

  const updateChatProvider = useMutation(api.chats.updateChatProvider);
  const updateChatTitle = useMutation(api.chats.updateChatTitle);
  const updateChatReasoning = useMutation(api.chats.updateChatReasoning);
  
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

  const handleReasoningToggle = async (enabled: boolean) => {
    setEnableReasoning(enabled);
    
    if (chatId) {
      await updateChatReasoning({
        chatId,
        enableReasoning: enabled,
      });
    }
  };

  const {
    handleInputChange,
    input: streamingInput,
    setInput: setStreamingInput,
    handleSubmit: handleStreamingSubmit,
    isLoading: isStreamingLoading,
    messages: streamingMessages
  } = useChat({
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    api: generateAPIUrl('/api/chat'),
    body: {
      provider: selectedProvider,
      model: selectedModel,
      enableReasoning: enableReasoning
    },
    onError: (error) => {
      console.error('[Chat] Stream Error:', {
        error: error,
        errorMessage: error?.message,
        errorStack: error?.stack,
        errorName: error?.name,
        provider: selectedProvider,
        model: selectedModel,
        currentChatId: chatId
      });
      
      // Reset the optimistic UI state on error
      if (currentAiMessageId) {
        setLocalMessages(messages => 
          messages.map(msg => 
            msg._id === currentAiMessageId 
              ? { ...msg, content: 'Error: Failed to generate response. Please try again.', isComplete: true }
              : msg
          )
        );
        setCurrentAiMessageId(null);
        if (streamManagerRef.current) {
          streamManagerRef.current.reset();
        }
      }
    },
  });

  // Handle defaultInputValue properly - set it once and then clear it
  useEffect(() => {
    if (defaultInputValue && !streamingInput) {
      setStreamingInput(defaultInputValue);
    }
  }, [defaultInputValue, streamingInput, setStreamingInput]);

  useEffect(() => {
    if (!convexMessages) {
      setLocalMessages([]);
      return;
    }

    setLocalMessages(prev => {
      // If we have a temporary message ID and are streaming
      if (isStreamingLoading && currentAiMessageId && tempMessageIdRef.current) {
        // Keep the streaming message as is, update others from Convex
          return convexMessages.map(msg => 
          msg._id === currentAiMessageId 
            ? prev.find(p => p._id === tempMessageIdRef.current) || msg
            : msg
          );
      }
      return convexMessages;
    });
  }, [convexMessages, isStreamingLoading, currentAiMessageId]);

  useEffect(() => {
    const updateStreamingMessage = async () => {
      if (!currentAiMessageId || !streamingMessages.length || !tempMessageIdRef.current) return;

      const lastMessage = streamingMessages[streamingMessages.length - 1] as AISDKMessage;
      if (lastMessage?.role === 'assistant') {
        console.log('[ChatContainer] Processing streaming message:', {
          messageId: currentAiMessageId,
          contentLength: lastMessage.content?.length,
          provider: selectedProvider,
          model: selectedModel,
          hasParts: !!lastMessage.parts,
          partsCount: lastMessage.parts?.length,
          parts: lastMessage.parts?.map(p => ({ type: p.type, hasReasoning: !!p.reasoning }))
        });

        // Add detailed debugging for the full message structure
        console.log('[ChatContainer] Full AI SDK message structure:', {
          messageId: currentAiMessageId,
          messageKeys: Object.keys(lastMessage),
          fullMessage: JSON.stringify(lastMessage, null, 2)
        });

        // Extract reasoning from AI SDK message parts
        let reasoning: string | undefined;
        let content = lastMessage.content || '';

        if (enableReasoning && lastMessage.parts) {
          // Look for reasoning parts in the AI SDK message
          const reasoningParts = lastMessage.parts.filter(part => part.type === 'reasoning');
          
          if (reasoningParts.length > 0) {
            // Combine all reasoning parts
            reasoning = reasoningParts.map(part => {
              if (part.reasoning) {
                return part.reasoning;
              }
              if (part.details) {
                // Handle detailed reasoning with potential redactions
                return part.details
                  .map(detail => detail.type === 'text' ? detail.text : '<redacted>')
                  .join('');
              }
              return '';
            }).filter(Boolean).join('\n\n');

            console.log('[ChatContainer] Extracted reasoning from AI SDK parts:', {
              messageId: currentAiMessageId,
              reasoningPartsCount: reasoningParts.length,
              reasoningLength: reasoning.length,
              reasoningPreview: reasoning.substring(0, 100) + '...'
            });
          }

          // Extract text content from parts if available
          const textParts = lastMessage.parts.filter(part => part.type === 'text');
          if (textParts.length > 0) {
            content = textParts.map(part => part.text).filter(Boolean).join('\n');
            console.log('[ChatContainer] Extracted content from text parts:', {
              messageId: currentAiMessageId,
              textPartsCount: textParts.length,
              contentLength: content.length
            });
          }
        }

        // Fallback: if no reasoning from parts, try the old extraction methods
        if (!reasoning && enableReasoning) {
          const providerConfig = AI_PROVIDERS[selectedProvider as keyof typeof AI_PROVIDERS];
          const modelConfig = providerConfig?.models.find(m => m.id === selectedModel);
          
          if (modelConfig?.supportsReasoning) {
            console.log('[ChatContainer] No reasoning from AI SDK parts, trying fallback extraction...');
            
            switch (modelConfig.reasoningType) {
              case 'thinking': {
                const match = content.match(/<think>(.*?)<\/think>/s);
                if (match) {
                  reasoning = match[1].trim();
                  content = content.replace(/<think>.*?<\/think>/s, '').trim();
                  console.log('[ChatContainer] Fallback: extracted thinking reasoning:', {
                    reasoningLength: reasoning.length
                  });
                }
                break;
              }
              case 'reasoning': {
                const match = content.match(/<reason>(.*?)<\/reason>/s);
                if (match) {
                  reasoning = match[1].trim();
                  content = content.replace(/<reason>.*?<\/reason>/s, '').trim();
                  console.log('[ChatContainer] Fallback: extracted reasoning content:', {
                    reasoningLength: reasoning.length
                  });
                }
                break;
              }
            }
          }
        }

        console.log('[ChatContainer] Final reasoning processing result:', {
          hasReasoning: !!reasoning,
          reasoningLength: reasoning?.length,
          contentLength: content.length,
          isComplete: !isStreamingLoading,
          messageId: currentAiMessageId
        });

        // Only update through StreamingSimulator for smooth letter-by-letter display
        if (streamingSimulatorRef.current) {
          streamingSimulatorRef.current.updateContent(content);
        }

        // Update Convex in background
        if (streamManagerRef.current) {
          const updateData = {
            messageId: currentAiMessageId,
            content,
            isComplete: !isStreamingLoading,
            metadata: {
              ...(reasoning && { reasoning })
            }
          };
          
          console.log('[ChatContainer] Updating message in Convex:', {
            messageId: currentAiMessageId,
            contentLength: content.length,
            hasReasoning: !!reasoning,
            reasoningLength: reasoning?.length,
            metadata: updateData.metadata,
            isComplete: updateData.isComplete
          });
          
          await streamManagerRef.current.updateMessage(updateData);
        }
        
        if (!isStreamingLoading) {
          setCurrentAiMessageId(null);
          tempMessageIdRef.current = null;
          if (streamManagerRef.current) {
            streamManagerRef.current.reset();
          }
          if (streamingSimulatorRef.current) {
            streamingSimulatorRef.current.stop();
          }
        }
      }
    };

    updateStreamingMessage();
  }, [streamingMessages, isStreamingLoading, currentAiMessageId, selectedProvider, selectedModel, enableReasoning]);

  const handleSubmit = async () => {
    if (!streamingInput.trim() || !user?.id || isStreamingLoading) {
      console.log('[Chat] Submit blocked:', { 
        hasInput: !!streamingInput.trim(), 
        hasUser: !!user?.id, 
        isLoading: isStreamingLoading 
      });
      return;
    }

    const timestamp = Date.now();
    const tempId = `temp-${timestamp}-${Math.random().toString(36).slice(2)}`;
    tempMessageIdRef.current = tempId;
    
    // Reset streaming simulator
    if (streamingSimulatorRef.current) {
      streamingSimulatorRef.current.stop();
    }
    
    const optimisticUserMessage: UIMessage = {
      _id: `temp-user-${timestamp}`,
      _creationTime: timestamp,
      role: 'user',
      content: streamingInput,
      createdAt: timestamp,
      updatedAt: timestamp,
      isComplete: true,
      chatId: chatId as Id<"chats">
    };

    const optimisticAiMessage: UIMessage = {
      _id: tempId,
      _creationTime: timestamp,
      role: 'assistant',
      content: '...',
      createdAt: timestamp,
      updatedAt: timestamp,
      isComplete: false,
      chatId: chatId as Id<"chats">
    };

    setLocalMessages(prev => [...prev, optimisticUserMessage, optimisticAiMessage]);

    try {
      let targetChatId = chatId;
      if (!targetChatId) {
        console.log('[Chat] Creating new chat:', { 
          userId: user.id,
          provider: selectedProvider,
          model: selectedModel
        });
        
        targetChatId = await createChat({
          title: 'New Chat',
          userId: user.id,
          provider: selectedProvider,
          model: selectedModel,
          enableReasoning: enableReasoning,
        });

        try {
          console.log('[Chat] Generating title for new chat');
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
          console.log('[Chat] Title API response:', data);
          
          if (data.error) {
            console.error('[Chat] Title generation failed:', data);
            throw new Error(data.details || data.error);
          }

          if (data.title) {
            await updateChatTitle({
              chatId: targetChatId,
              title: data.title
            });
          }
        } catch (error) {
          console.error('[Chat] Failed to generate/update title:', {
            error,
            chatId: targetChatId,
            input: streamingInput
          });
          // Use a simple title as fallback
          await updateChatTitle({
            chatId: targetChatId,
            title: streamingInput.slice(0, 30) + '...'
          });
        }
      }

      console.log('[Chat] Creating user message:', {
        chatId: targetChatId,
        content: streamingInput.length
      });

      await createStreamingMessage({
        chatId: targetChatId,
        role: 'user',
        content: streamingInput,
        isComplete: true,
        createdAt: timestamp,
        updatedAt: timestamp
      });

      console.log('[Chat] Creating AI message placeholder');
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
      if (streamManagerRef.current) {
        streamManagerRef.current.reset();
      }

      console.log('[Chat] Starting stream');
      await handleStreamingSubmit({} as any);
      
      // Notify parent that chat was created, but don't force navigation
      if (!chatId && targetChatId) {
        onChatCreated?.(targetChatId);
      }
    } catch (error) {
      console.error('[Chat] Error during submission:', {
        error,
        chatId,
        provider: selectedProvider,
        model: selectedModel
      });
      
      setLocalMessages(convexMessages || []);
      tempMessageIdRef.current = null;
      if (streamManagerRef.current) {
        streamManagerRef.current.reset();
        }
      }
    };

  return (
    <View className="flex-1 flex flex-col pt-10 bg-[#f8f2f8] dark:bg-[#221d27] border-t-[10px] border-[#f5dbef] dark:border-[#181217] rounded-t-lg">
      <View className="max-w-4xl mx-auto w-full flex-1">
        {children}
        <View className="flex-1">
          <MessageList 
            messages={localMessages as unknown as Message[]} 
            enableReasoning={enableReasoning}
          />
        </View>
        <ChatInput
          input={streamingInput}
          onInputChange={(text) =>
            handleInputChange({
              target: { value: text },
            } as unknown as React.ChangeEvent<HTMLInputElement>)
          }
          onSubmit={handleSubmit}
          selectedProvider={selectedProvider}
          selectedModel={selectedModel}
          onModelSelect={handleProviderModelChange}
          isLoading={isStreamingLoading}
          enableReasoning={enableReasoning}
          onReasoningToggle={handleReasoningToggle}
        />
      </View>
    </View>
  );
} 
