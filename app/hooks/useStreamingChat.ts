import { useState } from 'react';
import { generateAPIUrl } from '../utils/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface StreamContext {
  aiMessageId: string;
}

interface UseStreamingChatOptions {
  api: string;
  onResponse?: () => Promise<StreamContext>;
  onStream?: (data: { message: Message; context: StreamContext }) => void;
  onFinish?: (message: Message, context: StreamContext) => void;
}

export function useStreamingChat({
  api,
  onResponse,
  onStream,
  onFinish,
}: UseStreamingChatOptions) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (text: string) => {
    setInput(text);
  };

  const handleSubmit = async (content: string) => {
    if (!content.trim() || isLoading) return;
    setIsLoading(true);
    setInput('');

    try {
      // Get initial context from onResponse
      const context = onResponse ? await onResponse() : undefined;

      // Make API call
      const response = await fetch(generateAPIUrl(api), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content }] })
      });

      if (!response.ok) {
        throw new Error('API call failed');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let streamContent = '';

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            streamContent += chunk;

            // Call onStream with current content
            if (onStream && context) {
              onStream({
                message: { role: 'assistant', content: streamContent },
                context,
              });
            }
          }
        } finally {
          reader.releaseLock();
        }

        // Call onFinish with final content
        if (onFinish && context) {
          onFinish(
            { role: 'assistant', content: streamContent },
            context
          );
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setInput(content); // Restore input on error
    } finally {
      setIsLoading(false);
    }
  };

  return {
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
  };
} 