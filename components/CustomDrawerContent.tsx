import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar';
import { ThemeToggle } from '~/components/ui/theme-toggle';
import { useQuery } from 'convex/react';
import { api } from '~/convex/_generated/api';
import { formatDistanceToNow } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { SignOutButton } from './SignOutButton';

function ChatItem({ title, onPress, id }: { title: string; onPress: () => void; id: string }) {
  return (
    <Pressable
      onPress={onPress}
      className="text-sm p-2 rounded-md cursor-pointer hover:bg-[#f5dbef] dark:hover:bg-[#2b2431] transition-colors"
    >
      <Text className="text-sm truncate dark:text-[#d7c2ce] text-[#b02372] hover:text-[#560f2b] transition-colors">
        {title}
      </Text>
    </Pressable>
  );
}

function ChatSection({ title, chats, icon }: { title: string; chats: any[]; icon?: string }) {
  if (!chats?.length) return null;
  
  return (
    <View className="mb-6">
      <View className="flex-row items-center gap-2 mb-3">
        {icon && (
          <Ionicons name={icon as any} size={16} style={{ color: '#f5dbef' }} className="dark:text-[#2b2431]" />
        )}
        <Text className="text-sm font-semibold text-[#560f2b] dark:text-[#c46095]">
          {title}
        </Text>
      </View>
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
    if (!chats) return { pinned: [], today: [], yesterday: [], older: [] };

    const now = Date.now();
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;

    return chats.reduce((acc: any, chat) => {
      if (chat.isPinned) {
        acc.pinned.push(chat);
        return acc;
      }

      const chatDate = chat._creationTime;

      if (chatDate >= todayStart) {
        acc.today.push(chat);
      } else if (chatDate >= yesterdayStart) {
        acc.yesterday.push(chat);
      } else {
        acc.older.push(chat);
      }

      return acc;
    }, { pinned: [], today: [], yesterday: [], older: [] });
  }, [chats]);

  return (
    <View className="w-64 flex-1 bg-[#f3e4f5] dark:bg-[#181217]">
      {/* Header */}
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <Ionicons name="menu" size={20} style={{ color: 'hsl(var(--text-muted))' }} />
            <Text className="text-lg font-semibold text-[hsl(var(--text-primary))]">T3.chat</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Ionicons name="cash-outline" size={16} style={{ color: 'hsl(var(--text-muted))' }} />
            <ThemeToggle />
          </View>
        </View>
        <Button
          onPress={() => router.push('/')}
          className="w-full rounded-lg py-2.5 font-medium bg-[hsl(var(--primary-accent))]"
        >
          <Text className="font-semibold text-white">New Chat</Text>
        </Button>
      </View>

      {/* Search */}
      <View className="px-4 pb-4">
        <View className="relative">
          <View className="absolute left-3 top-1/2 -translate-y-1/2">
            <Ionicons name="search" size={16} style={{ color: 'hsl(var(--text-muted))' }} />
          </View>
          <Input
            placeholder="Search your threads..."
            className="pl-10 rounded-lg bg-[hsl(var(--input-bg))] border-[hsl(var(--input-border))] text-[hsl(var(--text-primary))]"
          />
        </View>
      </View>

      {/* Chat History */}
      <ScrollView className="flex-1 px-4">
        <ChatSection title="Pinned" chats={organizedChats.pinned} icon="pin" />
        <ChatSection title="Today" chats={organizedChats.today} />
        <ChatSection title="Yesterday" chats={organizedChats.yesterday} />
        {organizedChats.older.length > 0 && (
          <ChatSection title="Last 7 Days" chats={organizedChats.older} />
        )}
      </ScrollView>

      {/* User Profile */}
      <View className="p-4 ">
        <View className="flex-row items-center gap-3">
          <Avatar className="w-8 h-8" alt={`${user?.firstName || 'User'} profile`}>
            <AvatarFallback 
              className="text-sm font-medium bg-[hsl(var(--primary-accent))]"
            >
              <Text className="font-semibold text-white">
                {user?.firstName?.[0]?.toUpperCase() || 'U'}
              </Text>
            </AvatarFallback>
          </Avatar>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-[hsl(var(--text-primary))]">
              {user?.firstName} {user?.lastName}
            </Text>
            <Text className="text-xs font-medium text-[hsl(var(--text-muted))]">Pro</Text>
          </View>
        </View>
        <View className="mt-4">
          <SignOutButton />
        </View>
      </View>
    </View>
  );
}