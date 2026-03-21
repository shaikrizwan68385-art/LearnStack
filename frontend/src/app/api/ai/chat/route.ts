import { NextResponse } from 'next/server';

// Standard runtime for maximum compatibility
export async function POST(request: Request) {
    let query = '';
    let history: any[] = [];
    try {
        const body = await request.json();
        query = body.query;
        history = body.history;
        
        let API_KEY = process.env.HUGGINGFACE_API_KEY || "";
        let cleanApiKey = API_KEY.trim().replace(/^Bearer\s+/i, '');

        if (!cleanApiKey) {
            return NextResponse.json({ 
                response: "HUGGINGFACE_API_KEY is missing. Please set it in Vercel settings." 
            });
        }

        // Hugging Face now mandates the Router for chat completions
        const endpoint = "https://router.huggingface.co/v1/chat/completions";
        const modelId = "Qwen/Qwen2.5-72B-Instruct"; // Top-tier supported model on the router

        console.log(`🔄 StackAI using the Router: ${modelId}`);

        const response = await fetch(endpoint, {
            headers: { 
                "Authorization": `Bearer ${cleanApiKey}`,
                "Content-Type": "application/json",
                "Accept": "application/json" // Explicitly request JSON to prevent HTML fallback
            },
            method: "POST",
            body: JSON.stringify({
                model: modelId,
                messages: [
                    { role: "system", content: "You are StackAI, an expert tutor. Provide concise, helpful answers." },
                    ...history.slice(-2).map((m: any) => ({
                        role: m.role === 'assistant' || m.role === 'ai' ? 'assistant' : 'user',
                        content: m.content || m.text
                    })),
                    { role: "user", content: query }
                ],
                max_tokens: 300,
                temperature: 0.7,
            }),
        });

        // Fail-safe response body parsing
        const rawBody = await response.text();
        let result: any;
        
        try {
            result = JSON.parse(rawBody);
        } catch (parseError) {
            console.error('❌ Parse Failure. Raw Body prefix:', rawBody.substring(0, 100));
            return NextResponse.json({ 
                response: `[System Update]: Hugging Face is transitioning our AI engine. Status ${response.status}. Please try again in 30 seconds.` 
            });
        }
        
        if (result.choices && result.choices[0]?.message) {
            return NextResponse.json({ response: result.choices[0].message.content.trim() });
        }
        
        if (result.error) {
            return NextResponse.json({ response: `[AI Error]: ${result.error.message || result.error}` });
        }

        throw new Error('Unexpected API response structure');

    } catch (error: any) {
        console.error('❌ Critical AI Error:', error);
        return NextResponse.json({ 
            response: `StackAI Connection Issue: ${error.message}. Please verify your Hugging Face API key is correct and not expired.` 
        });
    }
}
