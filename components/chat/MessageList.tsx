import { View, ScrollView, Text } from "react-native";
import type { Message } from "~/types";
import { CustomMarkdown } from "../CustomMarkdown";
import { memo } from "react";

interface MessageListProps {
  messages?: Message[];
  contentContainerStyle?: any;
}

const TypingIndicator = () => (
  <View className="flex-row gap-1 items-center">
    <View className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
    <View className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '200ms' }} />
    <View className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '400ms' }} />
  </View>
);

const MessageItem = memo(({ message }: { message: Message }) => {
  const isOptimistic = typeof message._id === 'string' && message._id.startsWith('temp-');
  const isLoading = !message.isComplete;
  const isAI = message.role === 'assistant';

  return (
    <View 
      className={`flex flex-row ${isAI ? 'justify-start' : 'justify-end'}`}
      style={{ opacity: isOptimistic ? 0.7 : 1 }}
    >
      <View 
        className={`
          max-w-[85%] rounded-2xl p-4
          ${isAI 
            ? 'bg-background rounded-bl-none' 
            : 'bg-muted rounded-br-none'
          }
        `}
      >
        {message.content === '...' && isAI && isLoading ? (
          <TypingIndicator />
        ) : (
          <CustomMarkdown content={message.content} />
        )}
      </View>
    </View>
  );
});

export function MessageList({ messages, contentContainerStyle }: MessageListProps) {
  if (!messages?.length) return null;

  return (
    <ScrollView 
      className="flex-1 space-y-4"
      contentContainerStyle={[{ paddingBottom: 20 }, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
    >
      {messages.map((message) => (
        <MessageItem key={message._id} message={message} />
      ))}
    </ScrollView>
  );
} 