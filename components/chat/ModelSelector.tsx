import { View, Pressable } from 'react-native';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import Animated, { FadeIn } from 'react-native-reanimated';
import { AI_PROVIDERS } from "~/lib/ai-providers";

interface ModelSelectorProps {
  selectedProvider: string;
  selectedModel: string;
  onModelSelect: (provider: string, model: string) => void;
}

export function ModelSelector({ 
  selectedProvider, 
  selectedModel, 
  onModelSelect 
}: ModelSelectorProps) {
  const currentProviderData = AI_PROVIDERS[selectedProvider as keyof typeof AI_PROVIDERS];
  const currentModel = currentProviderData.models.find(m => m.id === selectedModel);

  return (
    <View className="py-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[200px]">
            <Text className="text-sm">
              {currentProviderData.name} - {currentModel?.name || 'Select Model'}
            </Text>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[200px]">
          {Object.entries(AI_PROVIDERS).map(([providerId, provider]) => (
            <Animated.View key={providerId} entering={FadeIn.duration(200)}>
              <DropdownMenuLabel>
                <Text>{provider.name}</Text>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {provider.models.map((model) => (
                  <DropdownMenuItem 
                    key={model.id}
                  >
                    <Pressable 
                      onPress={() => onModelSelect(providerId, model.id)}
                      className="flex-1"
                    >
                      <Text className={`${
                        selectedProvider === providerId && 
                        selectedModel === model.id 
                          ? 'font-bold' 
                          : ''
                      }`}>
                        {model.name}
                      </Text>
                    </Pressable>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              {providerId !== Object.keys(AI_PROVIDERS).slice(-1)[0] && (
                <DropdownMenuSeparator />
              )}
            </Animated.View>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </View>
  );
}