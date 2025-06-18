import { google } from "@ai-sdk/google"
import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"
import { xai } from "@ai-sdk/xai"
import { streamText } from 'ai';
import { AI_PROVIDERS } from "~/lib/ai-providers";

type Provider = keyof typeof AI_PROVIDERS;
type ProviderSDK = typeof google | typeof openai | typeof anthropic | typeof xai;

interface ChatRequest {
  messages: any[];
  provider?: Provider;
  model?: string;
}

const providerSDKs: Record<Provider, ProviderSDK> = {
  google,
  openai,
  anthropic,
  xai,
  meta: openai, // Meta models are often accessed through OpenAI-compatible APIs
  deepseek: openai, // DeepSeek models are often accessed through OpenAI-compatible APIs
  qwen: openai, // Qwen models are often accessed through OpenAI-compatible APIs
  openrouter: openai, // OpenRouter uses OpenAI-compatible API
}

// Provider-specific options for reasoning
const getProviderOptions = (provider: Provider, modelId: string) => {
  switch (provider) {
    case 'anthropic':
      if (modelId.includes('claude-4') || modelId.includes('claude-3')) {
        return {
          anthropic: {
            thinking: { type: 'enabled', budgetTokens: 12000 }
          }
        };
      }
      break;
    case 'openai':
      if (modelId.startsWith('o')) {
        return {
          openai: {
            reasoningEffort: 'medium'
          }
        };
      }
      break;
    case 'deepseek':
      if (modelId.includes('reasoner')) {
        return {
          deepseek: {
            sendReasoning: true
          }
        };
      }
      break;
    default:
      return {};
  }
  return {};
};

export async function POST(req: Request) {
  try {
    const { messages, provider = 'google', model } = (await req.json()) as ChatRequest;

    if (!messages || !Array.isArray(messages)) {
      console.error('[Chat API] Invalid messages format:', { messages });
      return new Response(
        JSON.stringify({ error: 'Invalid messages format' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const providerConfig = AI_PROVIDERS[provider];
    if (!providerConfig) {
      console.error('[Chat API] Provider not supported:', { provider, availableProviders: Object.keys(AI_PROVIDERS) });
      return new Response(
        JSON.stringify({ error: `Provider ${provider} not supported` }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if API key is configured
    if (!process.env[providerConfig.requiresApiKey]) {
      console.error('[Chat API] Missing API key:', { 
        provider, 
        requiredKey: providerConfig.requiresApiKey,
        availableEnvVars: Object.keys(process.env).filter(key => key.includes('API_KEY'))
      });
      return new Response(
        JSON.stringify({ error: `${providerConfig.name} API key not configured` }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const modelToUse = model || providerConfig.models.find((m: { isDefault?: boolean }) => m.isDefault)?.id;
    if (!modelToUse) {
      console.error('[Chat API] No model specified or found:', { provider, model, availableModels: providerConfig.models });
      return new Response(
        JSON.stringify({ error: `No model specified or default model found for ${provider}` }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create base model with provider-specific options
    const baseModel = providerSDKs[provider](modelToUse);
    const providerOptions = getProviderOptions(provider, modelToUse);

    console.log('[Chat API] Making request:', { 
      provider, 
      model: modelToUse, 
      messageCount: messages.length,
      providerOptions
    });

    const result = await streamText({
      model: baseModel,
      messages,
      ...providerOptions
    });

    return result.toDataStreamResponse({
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'none',
      },
    });

  } catch (error) {
    console.error('[Chat API] Error:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error // Log the full error object
    });
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process chat request',
        details: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.name : 'Unknown'
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}