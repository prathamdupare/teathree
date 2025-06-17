export const AI_PROVIDERS = {
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
      { id: 'gemini-2.5-flash-thinking', name: 'Gemini 2.5 Flash (Thinking)' },
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
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'gpt-4o', name: 'GPT-4o' },
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
      { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', isDefault: true },
      { id: 'claude-3.7-sonnet', name: 'Claude 3.7 Sonnet' },
      { id: 'claude-3.7-sonnet-reasoning', name: 'Claude 3.7 Sonnet (Reasoning)' },
      { id: 'claude-4-sonnet', name: 'Claude 4 Sonnet' },
      { id: 'claude-4-sonnet-reasoning', name: 'Claude 4 Sonnet (Reasoning)' },
      { id: 'claude-4-opus', name: 'Claude 4 Opus' }
    ],
    requiresApiKey: 'ANTHROPIC_API_KEY'
  },
  meta: {
    name: 'Meta',
    models: [
      { id: 'llama-3.3-70b', name: 'Llama 3.3 70b', isDefault: true },
      { id: 'llama-4-scout', name: 'Llama 4 Scout' },
      { id: 'llama-4-maverick', name: 'Llama 4 Maverick' }
    ],
    requiresApiKey: 'META_API_KEY'
  },
  deepseek: {
    name: 'DeepSeek',
    models: [
      { id: 'deepseek-v3-fireworks', name: 'DeepSeek v3 (Fireworks)', isDefault: true },
      { id: 'deepseek-v3-0324', name: 'DeepSeek v3 (0324)' },
      { id: 'deepseek-r1-openrouter', name: 'DeepSeek R1 (OpenRouter)' },
      { id: 'deepseek-r1-0528', name: 'DeepSeek R1 (0528)' },
      { id: 'deepseek-r1-llama-distilled', name: 'DeepSeek R1 (Llama Distilled)' },
      { id: 'deepseek-r1-qwen-distilled', name: 'DeepSeek R1 (Qwen Distilled)' }
    ],
    requiresApiKey: 'DEEPSEEK_API_KEY'
  },
  qwen: {
    name: 'Qwen',
    models: [
      { id: 'qwen-qwq-32b', name: 'Qwen qwq-32b', isDefault: true },
      { id: 'qwen-2.5-32b', name: 'Qwen 2.5 32b' }
    ],
    requiresApiKey: 'QWEN_API_KEY'
  },
  openrouter: {
    name: 'OpenRouter',
    models: [
      { id: 'o3-mini', name: 'o3-mini', isDefault: true },
      { id: 'o4-mini', name: 'o4-mini' },
      { id: 'o3', name: 'o3' },
      { id: 'o3-pro', name: 'o3 Pro' }
    ],
    requiresApiKey: 'OPENROUTER_API_KEY'
  }
};
