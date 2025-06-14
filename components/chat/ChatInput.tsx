import { View, TextInput, Text, Pressable, useColorScheme } from "react-native";
import { BlurView } from 'expo-blur';
import { memo } from "react";

interface ChatInputProps {
  input: string;
  onInputChange: (text: string) => void;
  onSubmit: () => void;
  selectedModel?: string;
  isLoading?: boolean;
}

export const ChatInput = memo(({
  input,
  onInputChange,
  onSubmit,
  selectedModel = "GPT-4.1",
  isLoading = false,
}: ChatInputProps) => {
  const colorScheme = useColorScheme();
  const canSubmit = input.trim().length > 0 && !isLoading;

  const handleSubmit = (e?: any) => {
    if (e?.nativeEvent?.key === 'Enter' && !e.nativeEvent.shiftKey) {
      e.preventDefault?.();
      if (canSubmit) {
        onSubmit();
      }
      return;
    }
  };

  return (
    <View className="absolute bottom-0 left-0 right-0 items-center">
      <View className="h-[1px]" />
      <View className="w-full max-w-[768px]">
        <BlurView 
          intensity={90} 
          className="rounded-lg bg-secondary border border-border shadow-md"
          tint={colorScheme === 'dark' ? 'dark' : 'light'}
        >
          <TextInput
            className="text-foreground text-base px-4 py-3 pb-2"
            placeholder="Type your message here..."
            value={input}
            onChangeText={(text) => 
              onInputChange(text)
            }
            onKeyPress={handleSubmit}
            multiline={false}
            blurOnSubmit={false}
            returnKeyType="send"
            enablesReturnKeyAutomatically={true}
            placeholderTextColor="rgba(255,255,255,0.4)"
            style={{ 
              textAlignVertical: 'center',
            }}
            autoCorrect={false}
            spellCheck={false}
            editable={!isLoading}
            autoFocus={true}
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
              className={`w-8 h-8 rounded-lg items-center justify-center ${
                canSubmit ? 'bg-primary' : 'bg-muted'
              }`}
              onPress={() => handleSubmit()}
              disabled={!canSubmit}
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
});