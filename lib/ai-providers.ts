// Types for AI providers and models
interface AIModel {
  id: string;
  name: string;
  isDefault?: boolean;
  supportsReasoning?: boolean;
  reasoningType?: 'thinking' | 'reasoning' | 'native';
}

interface AIProvider {
  name: string;
  models: AIModel[];
  requiresApiKey: string;
}

export const AI_PROVIDERS: Record<string, AIProvider> = {
  google: {
    name: 'Google',
    models: [
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', isDefault: true },
      { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro' },
      { id: 'gemini-pro', name: 'Gemini Pro' },
      { id: 'gemini-pro-max', name: 'Gemini Pro Max' },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
      { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite' },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
      { id: 'gemini-2.5-flash-lite-preview-06-17', name: 'Gemini 2.5 Flash Lite (Thinking)', supportsReasoning: true, reasoningType: 'thinking' },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' }
    ],
    requiresApiKey: 'GOOGLE_GENERATIVE_AI_API_KEY'
  },
  openai: {
    name: 'OpenAI',
    models: [
      { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo', isDefault: true },
      { id: 'gpt-4', name: 'GPT-4' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
      { id: 'gpt-imagegen', name: 'GPT ImageGen' },
      { id: 'o1-mini', name: 'O1 Mini (Reasoning)', supportsReasoning: true, reasoningType: 'native' },
      { id: 'o3-mini', name: 'O3 Mini (Reasoning)', supportsReasoning: true, reasoningType: 'native' },
      { id: 'o4-mini', name: 'O4 Mini (Reasoning)', supportsReasoning: true, reasoningType: 'native' },
      { id: 'gpt-4.1', name: 'GPT-4.1' },
      { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini' },
      { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano' },
      { id: 'gpt-4.5', name: 'GPT-4.5' }
    ],
    requiresApiKey: 'OPENAI_API_KEY'
  },
  anthropic: {
    name: 'Anthropic',
    models: [
      // Official Anthropic API model IDs with reasoning support where available
      { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', isDefault: true, supportsReasoning: true, reasoningType: 'thinking' },
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', supportsReasoning: true, reasoningType: 'thinking' },
      { id: 'claude-3-7-sonnet-20250219', name: 'Claude Sonnet 3.7', supportsReasoning: true, reasoningType: 'thinking' },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude Sonnet 3.5 v2' },
      { id: 'claude-3-5-sonnet-20240620', name: 'Claude Sonnet 3.5' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude Haiku 3.5' },
      { id: 'claude-3-opus-20240229', name: 'Claude Opus 3' },
      { id: 'claude-3-sonnet-20240229', name: 'Claude Sonnet 3' },
      { id: 'claude-3-haiku-20240307', name: 'Claude Haiku 3' }
    ],
    requiresApiKey: 'ANTHROPIC_API_KEY'
  },
  deepseek: {
    name: 'DeepSeek',
    models: [
      { id: 'deepseek-v3-fireworks', name: 'DeepSeek v3 (Fireworks)', isDefault: true },
      { id: 'deepseek-v3-0324', name: 'DeepSeek v3 (0324)' },
      { id: 'deepseek-r1-openrouter', name: 'DeepSeek R1 (OpenRouter)', supportsReasoning: true, reasoningType: 'reasoning' },
      { id: 'deepseek-r1-0528', name: 'DeepSeek R1 (0528)', supportsReasoning: true, reasoningType: 'reasoning' },
      { id: 'deepseek-r1-llama-distilled', name: 'DeepSeek R1 (Llama Distilled)', supportsReasoning: true, reasoningType: 'reasoning' },
      { id: 'deepseek-r1-qwen-distilled', name: 'DeepSeek R1 (Qwen Distilled)', supportsReasoning: true, reasoningType: 'reasoning' }
    ],
    requiresApiKey: 'DEEPSEEK_API_KEY'
  },
};

// Helper function to get reasoning configuration for a model
export function getModelReasoningConfig(provider: string, modelId: string) {
  const providerConfig = AI_PROVIDERS[provider as keyof typeof AI_PROVIDERS];
  if (!providerConfig) return null;
  
  const model = providerConfig.models.find(m => m.id === modelId);
  if (!model?.supportsReasoning) return null;
  
  return {
    tagName: model.reasoningType || 'think',
    startWithReasoning: false
  };
}

// Helper function to check if a model supports reasoning
export function modelSupportsReasoning(provider: string, modelId: string): boolean {
  const providerConfig = AI_PROVIDERS[provider as keyof typeof AI_PROVIDERS];
  if (!providerConfig) return false;
  
  const model = providerConfig.models.find(m => m.id === modelId);
  return model?.supportsReasoning || false;
}

// Helper function to get the display name for a model
export function getModelDisplayName(provider: string, modelId: string): string {
  const providerConfig = AI_PROVIDERS[provider as keyof typeof AI_PROVIDERS];
  if (!providerConfig) return modelId;
  
  const model = providerConfig.models.find(m => m.id === modelId);
  return model?.name || modelId;
}
