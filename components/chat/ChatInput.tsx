import { View, TextInput, Text, Pressable } from "react-native";
import { memo } from "react";
import { Button } from '~/components/ui/button';
import { Ionicons } from '@expo/vector-icons';
import { ModelSelector } from './ModelSelector';

interface ChatInputProps {
  input: string;
  onInputChange: (text: string) => void;
  onSubmit: () => void;
  selectedModel: string;
  selectedProvider: string;
  onModelSelect: (provider: string, model: string) => void;
  isLoading?: boolean;
}

export const ChatInput = memo(({
  input,
  onInputChange,
  onSubmit,
  selectedProvider,
  selectedModel,
  onModelSelect,
  isLoading = false,
}: ChatInputProps) => {
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
    <View className="absolute bottom-0 left-0 right-0 bg-[#fcf3fc] dark:bg-[#2a242f] border-t border-[hsl(var(--border-color))] rounded-t-2xl">
      <View className="max-w-4xl mx-auto w-full px-4 py-3">
        <View className="relative">
          <TextInput
            className="w-full text-base rounded-2xl px-4 py-3 bg-[#fcf3fc] dark:bg-[#2a242f] text-[hsl(var(--text-primary))] border border-[hsl(var(--input-border))]"
            placeholder="Type your message here..."
            value={input}
            onChangeText={onInputChange}
            onKeyPress={handleSubmit}
            multiline={true}
            blurOnSubmit={false}
            returnKeyType="send"
            enablesReturnKeyAutomatically={true}
            style={{ 
              textAlignVertical: 'center',
              minHeight: 48,
              maxHeight: 200
            }}
            placeholderTextColor="#6b6b6b"
            autoCorrect={false}
            spellCheck={false}
            editable={!isLoading}
          />
          {input && (
            <Pressable 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-xl w-8 h-8 items-center justify-center bg-[hsl(var(--primary-accent))]"
              onPress={() => handleSubmit()}
              disabled={!canSubmit}
            >
              <Ionicons name="arrow-up" size={16} color="white" />
            </Pressable>
          )}
        </View>
        <View className="flex-row items-center gap-2 mt-2">
          <ModelSelector
            selectedProvider={selectedProvider}
            selectedModel={selectedModel}
            onModelSelect={onModelSelect}
          />
          <Button
            variant="ghost"
            className="flex-row items-center gap-1 px-2 py-1 rounded-lg bg-transparent"
            onPress={() => {}}
          >
            <Ionicons name="attach" size={14} color="#6b6b6b" />
            <Text className="text-sm text-[hsl(var(--secondary-accent))]">Attach</Text>
          </Button>
        </View>
      </View>
    </View>
  );
});