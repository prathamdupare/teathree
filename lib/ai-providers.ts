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
  xai: {
    name: 'XAI',
    models: [
      { id: 'grok2', name: 'XAI 001', isDefault: true },
      { id: 'grok-3', name: 'Grok 3' },
      { id: 'grok-3-mini', name: 'Grok 3 Mini' }
    ],
    requiresApiKey: 'XAI_API_KEY'
  },
  anthropic: {
    name: 'Anthropic',
    models: [
      // Base models (without reasoning)
      { id: 'claude-opus-4-20250514', name: 'Claude 4 Opus', isDefault: true },
      { id: 'claude-sonnet-4-20250514', name: 'Claude 4 Sonnet' },
      { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet' },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' },
      
      // Models with extended thinking capability
      { id: 'claude-opus-4-20250514-thinking', name: 'Claude 4 Opus (Extended Thinking)', supportsReasoning: true, reasoningType: 'thinking' },
      { id: 'claude-sonnet-4-20250514-thinking', name: 'Claude 4 Sonnet (Extended Thinking)', supportsReasoning: true, reasoningType: 'thinking' },
      { id: 'claude-3-7-sonnet-20250219-thinking', name: 'Claude 3.7 Sonnet (Thinking)', supportsReasoning: true, reasoningType: 'thinking' }
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
  qwen: {
    name: 'Qwen',
    models: [
      { id: 'qwen-qwq-32b', name: 'Qwen qwq-32b', isDefault: true, supportsReasoning: true, reasoningType: 'thinking' },
      { id: 'qwen-2.5-32b', name: 'Qwen 2.5 32b' }
    ],
    requiresApiKey: 'QWEN_API_KEY'
  },
  openrouter: {
    name: 'OpenRouter',
    models: [
      { id: 'o3-mini', name: 'o3-mini', isDefault: true, supportsReasoning: true, reasoningType: 'native' },
      { id: 'o4-mini', name: 'o4-mini', supportsReasoning: true, reasoningType: 'native' },
      { id: 'o3', name: 'o3', supportsReasoning: true, reasoningType: 'native' },
      { id: 'o3-pro', name: 'o3 Pro', supportsReasoning: true, reasoningType: 'native' }
    ],
    requiresApiKey: 'OPENROUTER_API_KEY'
  }
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
