import React, { useState } from "react";
import { View, ScrollView, Pressable, useColorScheme } from "react-native";
import { useUser} from "@clerk/clerk-expo";
import { router, usePathname } from "expo-router";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { ThemeToggle } from "~/components/ui/theme-toggle";
import { useQuery, useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { LinearGradient } from 'expo-linear-gradient';
import { SignOutButton } from "./SignOutButton";
import { Separator } from "./ui/separator";
import { Id } from "~/convex/_generated/dataModel";

function ChatItem({
  title,
  onPress,
  id,
  isSelected,
  isPinned,
}: {
  title: string;
  onPress: () => void;
  id: Id<"chats">;
  isSelected: boolean;
  isPinned: boolean;
}) {
  const [isItemHovered, setIsItemHovered] = useState(false);
  const [isPinHovered, setIsPinHovered] = useState(false);
  const [isDeleteHovered, setIsDeleteHovered] = useState(false);
  const pinChat = useMutation(api.chats.pinChat);
  const deleteChat = useMutation(api.chats.deleteChat);

  const handlePin = async (e: any) => {
    e.stopPropagation();
    await pinChat({ chatId: id });
  };

  const handleDelete = async (e: any) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      await deleteChat({ chatId: id });
      router.push('/');
    }
  };

  const showActions = isItemHovered || isPinHovered || isDeleteHovered || isPinned;

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setIsItemHovered(true)}
      onHoverOut={() => setIsItemHovered(false)}
      className={`flex-row items-center justify-between text-sm p-2 rounded-md cursor-pointer transition-colors ${
        isSelected 
          ? 'bg-[#f8f8f7] dark:bg-[#261922]' 
          : 'hover:bg-[#f8f8f7] dark:hover:bg-[#261922]'
      }`}
    >
      <Text 
        className={`flex-1 text-sm truncate transition-colors ${
          isSelected
            ? 'text-[#560f2b] dark:text-[#d7c2ce]'
            : 'text-[#b02372] dark:text-[#d7c2ce] hover:text-[#560f2b]'
        }`}
        style={{ fontFamily: 'Ubuntu' }}
      >
        {title}
      </Text>
      <View className="flex-row gap-1">
        <Pressable
          onPress={handlePin}
          onHoverIn={() => setIsPinHovered(true)}
          onHoverOut={() => setIsPinHovered(false)}
          className={`w-6 h-6 items-center justify-center rounded-full transition-all duration-200 ${
            showActions ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          } ${
            isPinHovered 
              ? 'bg-[#ecc7e4] dark:bg-[#362d3c]' 
              : 'hover:bg-[#ecc7e4] dark:hover:bg-[#362d3c]'
          }`}
        >
          <AntDesign 
            name={isPinned ? "pushpin" : "pushpino"}
            size={14}
            className={`transition-colors ${
              isPinned 
                ? 'text-[#560f2b] dark:text-[#d7c2ce]' 
                : 'text-[#b02372] dark:text-[#d7c2ce]'
            }`}
          />
        </Pressable>
        <Pressable
          onPress={handleDelete}
          onHoverIn={() => setIsDeleteHovered(true)}
          onHoverOut={() => setIsDeleteHovered(false)}
          className={`w-6 h-6 items-center justify-center rounded-full transition-all duration-200 ${
            showActions ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          } ${
            isDeleteHovered 
              ? 'bg-[#ecc7e4] dark:bg-[#362d3c]' 
              : 'hover:bg-[#ecc7e4] dark:hover:bg-[#362d3c]'
          }`}
        >
          <AntDesign 
            name="delete"
            size={14}
            className="text-[#b02372] dark:text-[#d7c2ce]"
          />
        </Pressable>
      </View>
    </Pressable>
  );
}

function ChatSection({
  title,
  chats,
  icon,
  selectedChatId,
}: {
  title: string;
  chats: any[];
  icon?: string;
  selectedChatId?: string;
}) {
  if (!chats?.length) return null;

  return (
    <View className="mb-6">
      <View className="flex-row items-center gap-2 mb-3">
        {icon && (
          <Ionicons
            name={icon as any}
            size={16}
            style={{ color: "#f5dbef" }}
            className="dark:text-[#2b2431]"
          />
        )}
        <Text className="text-sm text-[#560f2b] dark:text-[#c46095]" style={{ fontFamily: 'Ubuntu-Medium' }}>
          {title}
        </Text>
      </View>
      <View className="space-y-1">
        {chats.map((chat) => (
          <ChatItem
            key={chat._id}
            id={chat._id}
            title={chat.title || "Untitled Chat"}
            onPress={() => {
              router.push(`/chat/${chat._id}`);
            }}
            isSelected={selectedChatId === chat._id}
            isPinned={chat.isPinned}
          />
        ))}
      </View>
    </View>
  );
}

export function CustomDrawerContent(props: any) {
  const { user } = useUser();
  const userImage = user?.imageUrl;
  const colorScheme = useColorScheme();
  const chats = useQuery(
    api.chats.getUserChats,
    user?.id ? { userId: user.id } : "skip",
  );
  
  // Get the current chat ID from the URL
  const pathname = usePathname();
  const currentChatId = pathname.startsWith('/chat/') ? pathname.split('/')[2] : undefined;

  console.log("clerk user", user?.imageUrl);

  // Organize chats by date
  const organizedChats = React.useMemo(() => {
    if (!chats) return { pinned: [], today: [], yesterday: [], older: [] };

    const todayStart = new Date().setHours(0, 0, 0, 0);
    const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;

    return chats.reduce(
      (acc: any, chat) => {
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
      },
      { pinned: [], today: [], yesterday: [], older: [] },
    );
  }, [chats]);

  return (
    <View className="w-64 flex-1">
      <LinearGradient
        colors={['#f2e5f4', '#f2e5f4']}
        className="absolute inset-0 dark:hidden"
      />
      <LinearGradient
        colors={['#1b1219', '#0e080c']}
        className="absolute inset-0 hidden dark:flex"
      />
      {/* Header */}
      <View className="relative p-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <Text className="text-lg text-[hsl(var(--text-primary))]" style={{ fontFamily: 'Ubuntu-Medium' }}>
              Tea3 Chat
            </Text> 
          </View>
        </View>
        <Button
          onPress={() => router.push("/")}
          className="w-full rounded-lg py-2.5 bg-[hsl(var(--primary-accent))]"
        >
          <Text className="text-white" style={{ fontFamily: 'Ubuntu-Medium' }}>New Chat</Text>
        </Button>
      </View>

      {/* Search */}
      <View className="px-4 border-none">
  <View className="re">
    <View className="flex flex-row items-center gap-2">
      <Ionicons
        name="search"
        size={16}
        className="text-black dark:text-white"
        style={{ color: "hsl(var(--text-muted))" }}
      />
      <Input
        placeholder="Search your threads..."

        className="border-none pl-2 rounded-lg bg-transparent text-[hsl(var(--text-primary))]"
        style={{ fontFamily: 'Ubuntu' }}
      />
    </View>
    <Separator className="my-2" />
  </View>
</View>

      {/* Chat History */}
      <ScrollView className="flex-1 px-4">
        <ChatSection 
          title="Pinned" 
          chats={organizedChats.pinned} 
          icon="pin" 
          selectedChatId={currentChatId}
        />
        <ChatSection 
          title="Today" 
          chats={organizedChats.today} 
          selectedChatId={currentChatId}
        />
        <ChatSection 
          title="Yesterday" 
          chats={organizedChats.yesterday} 
          selectedChatId={currentChatId}
        />
        {organizedChats.older.length > 0 && (
          <ChatSection 
            title="Last 7 Days" 
            chats={organizedChats.older} 
            selectedChatId={currentChatId}
          />
        )}
      </ScrollView>

      {/* User Profile */}
      <View className="p-4">
        <View className="flex-row items-center gap-3">
          <Avatar
            className="w-8 h-8"
            alt={`${user?.firstName || "User"} profile`}
          >
            {userImage ? (
              <AvatarImage source={{ uri: userImage }} />
            ) : (
              <AvatarFallback className="text-sm bg-[hsl(var(--primary-accent))]">
                <Text style={{ fontFamily: 'Ubuntu-Medium' }}>
                  {user?.firstName?.[0] || "U"}
                </Text>
              </AvatarFallback>
            )}
          </Avatar>

          <View className="flex-1">
            <Text className="text-sm text-[hsl(var(--text-primary))]" style={{ fontFamily: 'Ubuntu-Medium' }}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text className="text-xs text-[hsl(var(--text-muted))]" style={{ fontFamily: 'Ubuntu' }}>
              Pro
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
