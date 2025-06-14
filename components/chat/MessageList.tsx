import { View, ScrollView } from "react-native";
import type { Message } from "~/types";
import { CustomMarkdown } from "../CustomMarkdown";

interface MessageListProps {
  messages?: Message[];
  contentContainerStyle?: any;
}

export function MessageList({ messages, contentContainerStyle }: MessageListProps) {
  if (!messages?.length) return null;

  return (
    <ScrollView 
      className="flex-1 space-y-4"
      contentContainerStyle={contentContainerStyle}
    >
      {messages.map((message) => (
        <View 
          key={message._id} 
          className={`flex flex-row ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <View 
            className={`
              max-w-[85%] rounded-2xl p-4
              ${message.role === 'user' 
                ? 'bg-muted rounded-br-none' 
                : 'bg-background rounded-bl-none'
              }
            `}
          >
            <CustomMarkdown content={message.content} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
} 