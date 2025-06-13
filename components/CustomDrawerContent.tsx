import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Avatar } from '~/components/ui/avatar';
import { ThemeToggle } from '~/components/ui/theme-toggle';

// Mock chat data - replace with real data later
const MOCK_CHATS = {
  pinned: [
    { id: '1', title: 'Windsurf commands in Arch L...', time: '2h ago' },
    { id: '2', title: 'extra psychopg', time: '4h ago' },
  ],
  today: [
    { id: '3', title: 'Greeting', time: '1h ago' },
    { id: '4', title: 'JSON Generation', time: '3h ago' },
    { id: '5', title: 'Working great and birthday w...', time: '5h ago' },
    { id: '6', title: 'Google OAuth with Clerk and ...', time: '6h ago' },
  ],
  yesterday: [
    { id: '7', title: 'AI Chat App with Expo, Clerk,...', time: 'Yesterday' },
    { id: '8', title: 'Next.js Route Creation with S ...', time: 'Yesterday' },
    { id: '9', title: 'Habit Creation API Fixes and ...', time: 'Yesterday' },
    { id: '10', title: 'Tailwind CSS Backdrop Blur a...', time: 'Yesterday' },
    { id: '11', title: 'Convex integration branch na...', time: 'Yesterday' },
    { id: '12', title: 'Greeting', time: 'Yesterday' },
    { id: '13', title: 'AI safety and control', time: 'Yesterday' },
  ],
};

function ChatItem({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="px-3 py-2 rounded-lg hover:bg-accent active:bg-accent"
    >
      <Text className="text-sm text-foreground truncate">
        {title}
      </Text>
    </Pressable>
  );
}

function ChatSection({ title, chats }: { title: string; chats: typeof MOCK_CHATS.today }) {
  return (
    <View className="mb-6">
      <Text className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-3">
        {title}
      </Text>
      <View className="space-y-1">
        {chats.map((chat) => (
          <ChatItem
            key={chat.id}
            title={chat.title}
            onPress={() => {
              // Navigate to specific chat - implement later
              router.push('/');
            }}
          />
        ))}
      </View>
    </View>
  );
}

export function CustomDrawerContent(props: any) {
  const { user } = useUser();
  const { signOut } = useAuth();

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="p-4 border-b border-border">
        <Text className="text-xl font-semibold text-foreground mb-4">
          T3.chat
        </Text>
        
        {/* New Chat Button */}
        <Button
          onPress={() => router.push('/')}
          className="w-full mb-4 bg-primary"
        >
          <Text className="text-primary-foreground font-medium">
            New Chat
          </Text>
        </Button>

        {/* Search */}
        <Input
          placeholder="Search your threads..."
          className="bg-secondary border-border"
        />
      </View>

      {/* Chat History */}
      <ScrollView className="flex-1 p-2">
        <ChatSection title="📌 Pinned" chats={MOCK_CHATS.pinned} />
        <ChatSection title="Today" chats={MOCK_CHATS.today} />
        <ChatSection title="Yesterday" chats={MOCK_CHATS.yesterday} />
      </ScrollView>

      {/* Bottom Section */}
      <View className="p-4 border-t border-border">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-3 flex-1">
            <Avatar className="w-8 h-8" alt={`${user?.firstName || 'User'} profile`}>
              <Text className="text-xs">
                {user?.firstName?.[0]?.toUpperCase() || 'U'}
              </Text>
            </Avatar>
            <View className="flex-1">
              <Text className="text-sm font-medium text-foreground">
                {user?.firstName || 'User'}
              </Text>
              <Text className="text-xs text-muted-foreground">
                Pro
              </Text>
            </View>
          </View>
          <ThemeToggle />
        </View>
        
        <Button
          variant="ghost"
          onPress={() => signOut()}
          className="w-full justify-start p-2 h-auto"
        >
          <Text className="text-muted-foreground text-sm">
            Sign Out
          </Text>
        </Button>
      </View>
    </View>
  );
} 