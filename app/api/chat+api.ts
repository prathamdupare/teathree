import { google } from "@ai-sdk/google"
import { openai } from "@ai-sdk/openai"
import { anthropic, AnthropicProviderOptions } from "@ai-sdk/anthropic"
import { deepseek } from "@ai-sdk/deepseek"
import { xai } from "@ai-sdk/xai"
import { streamText } from 'ai';
import { AI_PROVIDERS } from "~/lib/ai-providers";

type Provider = keyof typeof AI_PROVIDERS;
type ProviderSDK = typeof google | typeof openai | typeof anthropic | typeof xai;

interface ChatRequest {
  messages: any[];
  provider?: Provider;
  model?: string;
  enableReasoning?: boolean;
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

export async function POST(req: Request) {
  try {
    const { messages, provider = 'google', model, enableReasoning = false } = (await req.json()) as ChatRequest;

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

    // Create model instance without reasoning options
    const modelInstance = providerSDKs[provider](modelToUse);

    // Prepare streamText options
    const streamTextOptions: any = {
      model: modelInstance,
      messages
    };

    // Add provider-specific reasoning options
    if (enableReasoning) {
      if (provider === 'anthropic' && (modelToUse.includes('claude-4') || modelToUse.includes('claude-3-7'))) {
        console.log('[Chat API] Enabling Anthropic thinking:', { model: modelToUse });
        streamTextOptions.providerOptions = {
          anthropic: {
            thinking: { 
              type: 'enabled' as const,
              budgetTokens: 12000 
            }
          } satisfies AnthropicProviderOptions
        };
        console.log('[Chat API] Provider options set:', JSON.stringify(streamTextOptions.providerOptions, null, 2));
      } else if (provider === 'openai' && modelToUse.startsWith('o')) {
        console.log('[Chat API] Enabling OpenAI reasoning effort:', { model: modelToUse });
        streamTextOptions.providerOptions = {
          openai: {
            reasoningEffort: 'medium'
          }
        };
      } else if (provider === 'deepseek' && modelToUse.includes('r1')) {
        console.log('[Chat API] Enabling DeepSeek reasoning:', { model: modelToUse });
        streamTextOptions.providerOptions = {
          deepseek: {
            sendReasoning: true
          }
        };
      }
    }

    console.log('[Chat API] Making request:', { 
      provider, 
      model: modelToUse, 
      messageCount: messages.length,
      enableReasoning,
      hasProviderOptions: !!streamTextOptions.providerOptions,
      providerOptions: streamTextOptions.providerOptions
    });

    const result = await streamText(streamTextOptions);

    console.log('[Chat API] Stream result created, returning response with sendReasoning:', enableReasoning);

    return result.toDataStreamResponse({
      sendReasoning: enableReasoning,
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