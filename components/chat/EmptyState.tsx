import { View, Text, Pressable } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { Button } from '~/components/ui/button';
import { Ionicons } from '@expo/vector-icons';

const EXAMPLE_PROMPTS = [
  "How does AI work?",
  "Are black holes real?",
  'How many Rs are in the word "strawberry"?',
  "What is the meaning of life?",
];

const ACTION_BUTTONS = [
  { label: "Create", icon: "sparkles-outline" },
  { label: "Explore", icon: "compass-outline" },
  { label: "Code", icon: "code-slash-outline" },
  { label: "Learn", icon: "school-outline" },
];

export function EmptyState() {
  const { user } = useUser();

  return (
    <View className="flex-1 items-center justify-center p-8 bg-[#221d27] dark:bg-[#f8f2f8]">
      <View className="max-w-2xl w-full">
        <Text className="text-3xl font-medium mb-8 text-[hsl(var(--text-primary))] text-center">
          How can I help you, {user?.firstName}?
        </Text>

        {/* Action Buttons */}
        <View className="flex-row justify-center gap-3 mb-12">
          {ACTION_BUTTONS.map((button) => (
            <Button
              key={button.label}
              variant="outline"
              className="bg-transparent border-[#2b2431] dark:border-[#f5dbef] hover:bg-[#2b2431] dark:hover:bg-[#f5dbef] transition-colors"
            >
              <View className="flex-row items-center px-4 py-2">
                <Ionicons 
                  name={button.icon as any} 
                  size={16} 
                  color="hsl(var(--text-muted))" 
                  className="mr-2"
                />
                <Text className="text-[hsl(var(--text-muted))] text-sm group-hover:text-[hsl(var(--text-primary))]">
                  {button.label}
                </Text>
              </View>
            </Button>
          ))}
        </View>

        {/* Example Prompts */}
        <View className="space-y-3">
          {EXAMPLE_PROMPTS.map((prompt, index) => (
            <Pressable
              key={index}
              className="rounded-lg p-4 hover:bg-[#2b2431] dark:hover:bg-[#f5dbef] transition-colors"
            >
              <Text className="text-[hsl(var(--text-muted))] text-left text-base hover:text-[hsl(var(--text-primary))]">
                {prompt}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
} 