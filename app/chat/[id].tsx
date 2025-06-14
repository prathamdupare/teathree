import { generateAPIUrl } from '../utils/utils';
import { View, SafeAreaView } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '~/convex/_generated/api';
import { Id } from '~/convex/_generated/dataModel';
import { ChatHeader, ChatInput, MessageList } from '~/components/chat';

export default function ChatPage() {
  const { user } = useUser();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: Id<"chats"> }>();
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("Gemini 1.5 Flash");
  const [isLoading, setIsLoading] = useState(false);
  
  const createStreamingMessage = useMutation(api.messages.createStreamingMessage);
  const updateMessageContent = useMutation(api.messages.updateMessageContent);
  const messages = useQuery(api.messages.getChatMessages, { chatId: id });

  const handleSubmit = async () => {
    if (!input.trim() || !user?.id || isLoading) return;

    const currentInput = input;
    setInput(''); // Clear input immediately
    setIsLoading(true);

    try {
      // Save user message
      await createStreamingMessage({
        chatId: id,
        role: 'user',
        content: currentInput,
        isComplete: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Create initial AI message
      const aiMessageId = await createStreamingMessage({
        chatId: id,
        role: 'assistant',
        content: '',
        provider: 'google',
        model: 'gemini-1.5-flash',
        isComplete: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Make API call
      const response = await fetch(generateAPIUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...(messages?.map(m => ({ role: m.role, content: m.content })) || []),
            { role: 'user', content: currentInput }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('API call failed');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let content = '';

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            content += chunk;

            // Update message content as we receive it
            await updateMessageContent({
              messageId: aiMessageId,
              content: content,
            });
          }
        } finally {
          reader.releaseLock();
        }

        // Mark the message as complete
        await updateMessageContent({
          messageId: aiMessageId,
          content: content || 'I apologize, but I was unable to generate a response.',
          isComplete: true,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setInput(currentInput); // Restore input on error
    } finally {
      setIsLoading(false);
    }
  };

  const chatTitle = messages?.[0]?.content.slice(0, 50) || 'Chat';

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ChatHeader title={chatTitle} />

      <View className="flex-1">
        <MessageList messages={messages} />
      </View>

      <ChatInput
        input={input}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        selectedModel={selectedModel}
        isLoading={isLoading}
      />
    </SafeAreaView>
  );
}