import { View, ScrollView, Text } from "react-native";
import type { Message } from "~/types";
import { CustomMarkdown } from "../CustomMarkdown";
import { memo } from "react";

interface MessageListProps {
  messages?: Message[];
  contentContainerStyle?: any;
}

const TypingIndicator = () => (
  <Text className="text-[hsl(var(--text-muted))]">...</Text>
);

const MessageItem = memo(({ message }: { message: Message }) => {
  const isOptimistic = typeof message._id === 'string' && message._id.startsWith('temp-');
  const isLoading = !message.isComplete;
  const isAI = message.role === 'assistant';

  return (
    <View 
      className={`flex flex-row ${isAI ? 'justify-start' : 'justify-end'} mb-6`}
      style={{ opacity: isOptimistic ? 0.7 : 1 }}
    >
      <View 
        className={`max-w-[85%] rounded-2xl p-4 ${
          isAI 
            ? 'rounded-bl-none bg-transparent' 
            : 'rounded-br-none bg-[#f5dbef] dark:bg-[#2b2431]'
        }`}
      >
        {message.content === '...' && isAI && isLoading ? (
          <TypingIndicator />
        ) : (
          <Text 
            className={`text-base ${
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