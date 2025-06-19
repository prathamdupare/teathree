import { View, Text, Pressable } from "react-native"
import { useUser } from "@clerk/clerk-expo"
import { Button } from "~/components/ui/button"
import { Ionicons } from "@expo/vector-icons"

const EXAMPLE_PROMPTS = [
  "How does AI work?",
  "Are black holes real?",
  'How many Rs are in the word "strawberry"?',
  "What is the meaning of life?",
]

const ACTION_BUTTONS = [
  { label: "Create", icon: "sparkles-outline" },
  { label: "Explore", icon: "compass-outline" },
  { label: "Code", icon: "code-slash-outline" },
  { label: "Learn", icon: "school-outline" },
]

export function EmptyState() {
  const { user } = useUser()

  return (
    <View className="flex-1 items-center justify-center bg-[#1a171d] dark:bg-[#f8f2f8]">
      <View className="w-full max-w-md mx-auto px-8 py-16">
        {/* Title */}
        <Text className="text-2xl font-medium mb-8 text-white dark:text-[#1a171d] text-center">
          How can I help you, {user?.firstName}?
        </Text>

        {/* Action Buttons */}
        <View className="flex-row flex-wrap gap-2 mb-8 justify-center">
          {ACTION_BUTTONS.map((button) => (
            <Button
              key={button.label}
              variant="outline"
              className="bg-[#28242e] border-transparent hover:bg-[#322c39] dark:bg-[#f5dbef] dark:hover:bg-[#efd5e9] transition-colors rounded-full h-10"
            >
              <View className="flex-row items-center px-4">
                <Ionicons name={button.icon as any} size={14} color="#9ca3af" style={{ marginRight: 6 }} />
                <Text className="text-[#9ca3af] text-sm font-normal">{button.label}</Text>
              </View>
            </Button>
          ))}
        </View>

        {/* Example Prompts */}
        <View className="w-full space-y-3">
          {EXAMPLE_PROMPTS.map((prompt, index) => (
            <Pressable
              key={index}
              className="py-3 px-4 hover:bg-[#28242e] dark:hover:bg-[#f5dbef] transition-colors rounded-md w-full"
            >
              <Text className="text-[#9ca3af] text-center text-base">{prompt}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  )
}