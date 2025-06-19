import { View, TextInput, Text, Pressable, useColorScheme } from "react-native"
import { memo } from "react"
import { Button } from "~/components/ui/button"
import { Ionicons } from "@expo/vector-icons"
import { ModelSelector } from "./ModelSelector"
import { modelSupportsReasoning } from "~/lib/ai-providers"

interface ChatInputProps {
  input: string
  onInputChange: (text: string) => void
  onSubmit: () => void
  selectedModel: string
  selectedProvider: string
  onModelSelect: (provider: string, model: string) => void
  isLoading?: boolean
  enableReasoning?: boolean
  onReasoningToggle?: (enabled: boolean) => void
}

const ChatInputComponent = ({
  input,
  onInputChange,
  onSubmit,
  selectedProvider,
  selectedModel,
  onModelSelect,
  isLoading = false,
  enableReasoning = false,
  onReasoningToggle,
}: ChatInputProps) => {
  const canSubmit = input.trim().length > 0 && !isLoading
  const colorScheme = useColorScheme()
  const supportsReasoning = modelSupportsReasoning(selectedProvider, selectedModel)

  // Choose icon color based on theme
  const iconColor = colorScheme === "dark" ? "#bdbdbd" : "#6b6b6b"

  const handleSubmit = (e?: any) => {
    if (e?.nativeEvent?.key === "Enter" && !e.nativeEvent.shiftKey) {
      e.preventDefault?.()
      if (canSubmit) {
        onSubmit()
      }
      return
    }
    // If called from button, just submit
    if (canSubmit && !e?.nativeEvent) {
      onSubmit()
    }
  }

  return (
    <View className="absolute bottom-0 left-0 right-0 m-0">
      {/* Outer container with rounded top corners and border */}
      <View className="border border-[#fadcfd] dark:border-[#3a242f] rounded-t-2xl mx-4 shadow-sm">
        {/* Inner container with subtle border */}
        <View className="border border-[hsl(var(--input-border))] rounded-t-2xl m-1 mb-0 bg-[#fcf3fc] dark:bg-[#2a242f]">
          <View className="py-1">
            <View className="relative">
              <TextInput
                className="w-full text-base px-3 py-2 bg-transparent text-[hsl(var(--text-primary))]"
                placeholder="Type your message here..."
                value={input}
                onChangeText={onInputChange}
                onKeyPress={handleSubmit}
                multiline={true}
                blurOnSubmit={false}
                returnKeyType="send"
                enablesReturnKeyAutomatically={true}
                style={{
                  textAlignVertical: "center",
                  minHeight: 36,
                  maxHeight: 100,
                  // Remove outline: "none" (not needed in RN)
                  outline: "none",
                  // No border color change on focus
                  borderWidth: 0, // Ensures no border highlight on focus
                }}
                placeholderTextColor="#6b6b6b"
                autoCorrect={false}
                spellCheck={false}
                editable={!isLoading}
                // No onFocus/onBlur border color change
              />
            </View>
            <View className="flex-row items-center gap-2">
              <ModelSelector
                selectedProvider={selectedProvider}
                selectedModel={selectedModel}
                onModelSelect={onModelSelect}
              />
              
              {/* Reasoning Toggle for supported models */}
              {supportsReasoning && (
                <Pressable
                  onPress={() => onReasoningToggle?.(!enableReasoning)}
                  className={`flex-row items-center gap-1 px-2 py-1 rounded-md transition-all duration-200 ${
                    enableReasoning
                      ? 'bg-[#b02372] dark:bg-[#d7c2ce]'
                      : 'bg-[#f5dbef] dark:bg-[#2b2431]'
                  }`}
                >
                  <Ionicons 
                    name="bulb" 
                    size={12} 
                    color={enableReasoning ? "white" : "#b02372"} 
                  />
                  <Text className={`text-xs ${
                    enableReasoning
                      ? 'text-white dark:text-[#2b2431]'
                      : 'text-[#b02372] dark:text-[#d7c2ce]'
                  }`}>
                    {enableReasoning ? 'Reasoning ON' : 'Reasoning'}
                  </Text>
                </Pressable>
              )}
              
              <Pressable
                className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-lg w-10 h-10 items-center justify-center bg-[#cd98b2] dark:bg-[#3a2033]"
                onPress={() => handleSubmit()}
                disabled={!canSubmit}
              >
                <Ionicons name="arrow-up" size={14} color="white" />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

const ChatInput = memo(ChatInputComponent)
ChatInput.displayName = "ChatInput"

export { ChatInput }