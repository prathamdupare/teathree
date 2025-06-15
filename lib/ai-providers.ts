export const AI_PROVIDERS = {
    google: {
      name: 'Google',
      models: [
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', isDefault: true },
        { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro' },
        { id: 'gemini-pro', name: 'Gemini Pro' }
      ],
      requiresApiKey: 'GOOGLE_GENERATIVE_AI_API_KEY'
    },
    openai: {
      name: 'OpenAI',
      models: [
        { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo', isDefault: true },
        { id: 'gpt-4', name: 'GPT-4' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
      ],
      requiresApiKey: 'OPENAI_API_KEY'
    }
    // Easy to add more:
    // anthropic: {
    //   name: 'Anthropic',
    //   models: [
    //     { id: 'claude-3', name: 'Claude 3', isDefault: true }
    //   ],
    //   requiresApiKey: 'ANTHROPIC_API_KEY'
    // }
  };
  