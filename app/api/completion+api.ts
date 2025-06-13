import { google } from "@ai-sdk/google"
import { streamText } from 'ai';

export async function POST(req: Request) {
  try {
    // Check if API key is configured
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error('GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set');
      return new Response(
        JSON.stringify({ error: 'Google API key not configured' }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid prompt format' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const result = streamText({
      model: google('gemini-1.5-flash'),
      prompt: prompt,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Completion API Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process completion request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
