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
import { useQuery } from 'convex/react';
import { api } from '~/convex/_generated/api';
import { formatDistanceToNow } from 'date-fns';

function ChatItem({ title, onPress, id }: { title: string; onPress: () => void; id: string }) {
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

function ChatSection({ title, chats }: { title: string; chats: any[] }) {
  if (!chats?.length) return null;
  
  return (
    <View className="mb-6">
      <Text className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-3">
        {title}
      </Text>
      <View className="space-y-1">
        {chats.map((chat) => (
          <ChatItem
            key={chat._id}
            id={chat._id}
            title={chat.title || 'Untitled Chat'}
            onPress={() => {
              router.push(`/chat/${chat._id}`);
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
  const chats = useQuery(api.chats.getUserChats, 
    user?.id ? { userId: user.id } : "skip"
  );

  // Organize chats by date
  const organizedChats = React.useMemo(() => {
    if (!chats) return { today: [], yesterday: [], older: [] };

    const now = Date.now();
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;

    return chats.reduce((acc: any, chat) => {
      const chatDate = chat._creationTime;

      if (chatDate >= todayStart) {
        acc.today.push(chat);
      } else if (chatDate >= yesterdayStart) {
        acc.yesterday.push(chat);
      } else {
        acc.older.push(chat);
      }

      return acc;
    }, { today: [], yesterday: [], older: [] });
  }, [chats]);

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
        <ChatSection title="Today" chats={organizedChats.today} />
        <ChatSection title="Yesterday" chats={organizedChats.yesterday} />
        {organizedChats.older.length > 0 && (
          <ChatSection title="Previous" chats={organizedChats.older} />
        )}
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