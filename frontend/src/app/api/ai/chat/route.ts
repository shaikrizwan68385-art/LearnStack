import { NextResponse } from 'next/server';

export const runtime = 'edge'; // Zero cold-starts and low latency for AI responses

export async function POST(request: Request) {
    let query = '';
    let history: any[] = [];
    try {
        const body = await request.json();
        query = body.query;
        history = body.history;
        let API_KEY = process.env.HUGGINGFACE_API_KEY || "";
        
        // Clean the API key in case the user accidentally pasted "Bearer " or has whitespace
        let cleanApiKey = API_KEY.trim();
        if (cleanApiKey.startsWith('Bearer ')) {
            cleanApiKey = cleanApiKey.replace('Bearer ', '');
        }

        if (!cleanApiKey) {
            console.error('❌ HUGGINGFACE_API_KEY is missing in environment variables');
            return NextResponse.json({ 
                response: "I'm currently missing my AI brain. Please set HUGGINGFACE_API_KEY in Vercel." 
            }, { status: 200 }); // Keep 200 so the frontend can display the message properly
        }

        // Format history for Hugging Face Router
        // Handle input history format if it differs
        const formattedHistory = (history || []).map((msg: any) => ({
            role: msg.role === 'assistant' || msg.role === 'ai' ? 'assistant' : 'user',
            content: msg.content || msg.text
        }));

        const messages = [
            { 
                role: "system", 
                content: "You are StackAI, a brilliant global tutor. Provide clear, accurate, and helpful educational answers. Use markdown formatting where appropriate." 
            },
            ...formattedHistory.slice(-5), // Keep only last few messages for context
            { role: "user", content: query }
        ];

        console.log('🔄 StackAI calling Hugging Face Router...');

        const hf_response = await fetch(
            "https://router.huggingface.co/v1/chat/completions",
            {
                headers: { 
                    "Authorization": `Bearer ${cleanApiKey}`,
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({
                    model: "meta-llama/Llama-3.1-8B-Instruct", // High-speed, high-quality model
                    messages: messages,
                    max_tokens: 400, // Reduced for faster delivery
                    temperature: 0.7,
                }),
            }
        );

        if (!hf_response.ok) {
            const errData = await hf_response.json();
            console.error('❌ Hugging Face Error:', errData);
            const errorMessage = errData.error?.message || errData.error || 'Unknown Error';
            return NextResponse.json({ 
                response: `[Hugging Face Error]: ${errorMessage}. Please check your API key and Vercel environment variables.` 
            });
        }

        const result: any = await hf_response.json();
        
        if (result.choices && result.choices[0] && result.choices[0].message) {
            return NextResponse.json({ response: result.choices[0].message.content.trim() });
        }
        
        throw new Error('Unexpected API response structure');

    } catch (error: any) {
        console.error('❌ StackAI Error:', error);
        return NextResponse.json({ 
            response: `StackAI Connection Error: ${error.message}. Try disabling Edge Runtime if this persists, or verify the API key at Hugging Face.` 
        });
    }
}
