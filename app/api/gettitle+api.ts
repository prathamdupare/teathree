import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(req: Request) {
    const { message, provider, model } = await req.json();
    
    try {
        const prompt = `Generate a very short, concise title (max 5 words) for this chat based on the message: "${message}"`;
        console.log('Generating title for message:', message);
        
        const { text } = await generateText({
            model: google('gemini-1.5-flash'),  // Let's use a specific model for now
            prompt: prompt
        });

        console.log('Generated title:', text);
        return Response.json({ title: text.trim() });
    } catch (error) {
        console.error('Error generating title:', error);
        // Let's make the error more visible in logs
        console.error('Full error details:', JSON.stringify(error, null, 2));
        return Response.json({ 
            error: 'Failed to generate title',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
} 