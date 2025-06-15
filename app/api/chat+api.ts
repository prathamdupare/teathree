import { google } from "@ai-sdk/google"
import { openai } from "@ai-sdk/openai"
import { streamText } from 'ai';
import { AI_PROVIDERS } from "~/lib/ai-providers";

type Provider = keyof typeof AI_PROVIDERS;
type ProviderSDK = typeof google | typeof openai;

interface ChatRequest {
  messages: any[];
  provider?: Provider;
  model?: string;
}

const providerSDKs: Record<Provider, ProviderSDK> = {
  google,
  openai,
}

export async function POST(req: Request) {
  try {
    const { messages, provider = 'google', model } = (await req.json()) as ChatRequest;

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages format' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const providerConfig = AI_PROVIDERS[provider];
    if (!providerConfig) {
      return new Response(
        JSON.stringify({ error: `Provider ${provider} not supported` }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if API key is configured
    if (!process.env[providerConfig.requiresApiKey]) {
      return new Response(
        JSON.stringify({ error: `${providerConfig.name} API key not configured` }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const modelToUse = model || providerConfig.models.find((m: { isDefault?: boolean }) => m.isDefault)?.id;
    if (!modelToUse) {
      return new Response(
        JSON.stringify({ error: `No model specified or default model found for ${provider}` }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await streamText({
      model: providerSDKs[provider](modelToUse),
      messages,
    });

    return result.toDataStreamResponse({
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'none',
      },
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process chat request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}