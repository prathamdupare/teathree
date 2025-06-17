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
import { Ionicons } from '@expo/vector-icons';

// Model icons mapping
const MODEL_ICONS: { [key: string]: any } = {
  'google': 'logo-google',
  'anthropic': 'sparkles-outline',
  'openai': 'flash-outline',
  'mistral': 'planet-outline',
  'default': 'cube-outline'
};

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

  const getProviderIcon = (providerId: string) => {
    return MODEL_ICONS[providerId] || MODEL_ICONS.default;
  };

  const getModelIcon = (modelId: string) => {
    if (modelId.includes('gpt-4')) return 'diamond-outline';
    if (modelId.includes('gpt-3.5')) return 'star-outline';
    if (modelId.includes('gemini')) return 'infinite-outline';
    if (modelId.includes('claude')) return 'sparkles-outline';
    return 'cube-outline';
  };

  return (
    <View className="">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="bg- dark:bg-[#2b2431] border-none hover:bg-[#f3e4f5] dark:hover:bg-[#2a242f] flex-row items-center gap-2 px-3"
          >
            <Ionicons 
              name={getProviderIcon(selectedProvider)} 
              size={16} 
              color="#b02372"
              className="dark:text-[#d7c2ce]"
            />
            <Text className="text-sm text-[#b02372] dark:text-[#d7c2ce] flex-1">
              {currentModel?.name || 'Select Model'}
            </Text>
            <Ionicons 
              name="chevron-down" 
              size={16} 
              color="#b02372"
              className="dark:text-[#d7c2ce]"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[280px] bg-[#f3e4f5] dark:bg-[#181217] border-[#b02372] dark:border-[#d7c2ce] rounded-lg shadow-lg">
          {Object.entries(AI_PROVIDERS).map(([providerId, provider]) => (
            <Animated.View key={providerId} entering={FadeIn.duration(200)}>
              <DropdownMenuLabel className="flex-row items-center gap-2 px-3 py-2">
                <Ionicons 
                  name={getProviderIcon(providerId)} 
                  size={18} 
                  color="#560f2b"
                  className="dark:text-[#c46095]"
                />
                <Text className="text-[#560f2b] dark:text-[#c46095] font-medium">
                  {provider.name}
                </Text>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#b02372] dark:bg-[#d7c2ce] opacity-20" />
              <DropdownMenuGroup>
                {provider.models.map((model) => (
                  <DropdownMenuItem 
                    key={model.id}
                    className="hover:bg-[#f5dbef] dark:hover:bg-[#2b2431] px-3 py-2"
                  >
                    <Pressable 
                      onPress={() => onModelSelect(providerId, model.id)}
                      className="flex-1 flex-row items-center gap-2"
                    >
                      <Ionicons 
                        name={getModelIcon(model.id)} 
                        size={16} 
                        color={selectedProvider === providerId && selectedModel === model.id ? '#560f2b' : '#b02372'}
                        className="dark:text-[#d7c2ce]"
                      />
                      <View className="flex-1">
                        <Text className={`text-[#b02372] dark:text-[#d7c2ce] ${
                          selectedProvider === providerId && 
                          selectedModel === model.id 
                            ? 'font-bold' 
                            : ''
                        }`}>
                          {model.name}
                        </Text>
                      </View>
                      {selectedProvider === providerId && selectedModel === model.id && (
                        <Ionicons 
                          name="checkmark" 
                          size={16} 
                          color="#560f2b"
                          className="dark:text-[#c46095]"
                        />
                      )}
                    </Pressable>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              {providerId !== Object.keys(AI_PROVIDERS).slice(-1)[0] && (
                <DropdownMenuSeparator className="bg-[#b02372] dark:bg-[#d7c2ce] opacity-20" />
              )}
            </Animated.View>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </View>
  );
}