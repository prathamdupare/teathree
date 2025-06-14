import { View, TextInput, Text, Pressable } from "react-native";
import { BlurView } from 'expo-blur';

interface ChatInputProps {
  input: string;
  onInputChange: (text: string) => void;
  onSubmit: () => void;
  selectedModel?: string;
  isLoading?: boolean;
}

export function ChatInput({
  input,
  onInputChange,
  onSubmit,
  selectedModel = "GPT-4.1",
  isLoading = false,
}: ChatInputProps) {
  return (
    <View className="absolute bottom-0 left-0 right-0 items-center">
      <View className="h-[1px]" />
      <View className="w-full max-w-[768px]">
        <BlurView 
          intensity={90} 
          className="rounded-lg bg-red-100"
          tint="dark"
        >
          <TextInput
            className="text-foreground text-base px-4 py-3 pb-2"
            placeholder="Type your message here..."
            value={input}
            onChangeText={onInputChange}
            onSubmitEditing={onSubmit}
            multiline
            placeholderTextColor="rgba(255,255,255,0.4)"
            style={{ 
              textAlignVertical: 'top',
              maxHeight: 120,
            }}
            autoCorrect={false}
            spellCheck={false}
          />
          
          <View className="flex-row items-center justify-between px-4 pb-3">
            <View className="flex-row items-center gap-3">
              <Text className="text-muted-foreground text-sm">
                {selectedModel}
              </Text>
              <Pressable>
                <Text className="text-muted-foreground text-base">📎</Text>
              </Pressable>
            </View>
            
            <Pressable 
              className={`w-8 h-8 rounded-lg items-center justify-center bg-primary ${
                !input.trim() ? 'opacity-50' : ''
              }`}
              onPress={onSubmit}
              disabled={!input.trim() || isLoading}
            >
              <Text className="text-primary-foreground text-lg">
                {isLoading ? "..." : "↑"}
              </Text>
            </Pressable>
          </View>
        </BlurView>
      </View>
    </View>
  );
}