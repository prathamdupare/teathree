import React from "react";
import { View, ScrollView, Pressable } from "react-native";
import { useUser} from "@clerk/clerk-expo";
import { router, usePathname } from "expo-router";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { ThemeToggle } from "~/components/ui/theme-toggle";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { SignOutButton } from "./SignOutButton";
import { Separator } from "./ui/separator";

function ChatItem({
  title,
  onPress,
  id,
  isSelected,
}: {
  title: string;
  onPress: () => void;
  id: string;
  isSelected: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`text-sm p-2 rounded-md cursor-pointer transition-colors ${
        isSelected 
          ? 'bg-[#f5dbef] dark:bg-[#2b2431]' 
          : 'hover:bg-[#f5dbef] dark:hover:bg-[#2b2431]'
      }`}
    >
      <Text 
        className={`text-sm truncate transition-colors ${
          isSelected
            ? 'text-[#560f2b] dark:text-[#d7c2ce]'
            : 'text-[#b02372] dark:text-[#d7c2ce] hover:text-[#560f2b]'
        }`}
        style={{ fontFamily: 'Ubuntu' }}
      >
        {title}
      </Text>
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
          />
        ))}
      </View>
    </View>
  );
}

export function CustomDrawerContent(props: any) {
  const { user } = useUser();
  const userImage = user?.imageUrl;
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
    <View className="w-64 flex-1 bg-[#f3e4f5] dark:bg-[#181217]">
      {/* Header */}
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <Text className="text-lg text-[hsl(var(--text-primary))]" style={{ fontFamily: 'Ubuntu-Medium' }}>
              Tea3 Chat
            </Text> 
          </View>
          <View className="flex-row items-center gap-2">
            <ThemeToggle />
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
      <View className="px-4 pb-4 border-none">
        <View className="relative">
          <View className="absolute left-3 top-1/2 -translate-y-1/2">
            <Ionicons
              name="search"
              size={16}
              style={{ color: "hsl(var(--text-muted))" }}
            />
          </View>
          <Input
            placeholder="Search your threads..."
            className="border-none pl-10 rounded-lg bg-transparent text-[hsl(var(--text-primary))]"
            style={{ fontFamily: 'Ubuntu' }}
          />
            <Separator className='my-4' />
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
      <View className="p-4 ">
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
