import { View, SafeAreaView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Id } from '~/convex/_generated/dataModel';
import { ChatHeader } from '~/components/chat';
import { ChatContainer } from '~/components/chat/ChatContainer';

export default function ChatPage() {
  const { id } = useLocalSearchParams<{ id: Id<"chats"> }>();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ChatHeader title="Chat" />
      <ChatContainer chatId={id} />
    </SafeAreaView>
  );
}