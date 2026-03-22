import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const { query } = await req.json();
    const API_KEY = process.env.HUGGINGFACE_API_KEY;

    // 1. Try Real AI if API Key is present
    if (API_KEY && API_KEY !== 'your_token_here') {
        try {
            const response = await fetch(
                "https://router.huggingface.co/v1/chat/completions",
                {
                    method: "POST",
                    headers: { 
                        "Authorization": `Bearer ${API_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: "Qwen/Qwen2.5-72B-Instruct",
                        messages: [
                            { role: "system", content: "You are QuestAI, a professional academy tutor. Be helpful and direct." },
                            { role: "user", content: query }
                        ],
                        max_tokens: 500,
                    }),
                }
            );

            const result: any = await response.json();
            if (result.choices && result.choices[0] && result.choices[0].message) {
                return NextResponse.json({ response: result.choices[0].message.content });
            }
        } catch (error) {
            console.error('QuestAI API Error:', error);
        }
    }

    // 2. Standalone QuestAI Mock Logic (Fallback)
    const lowercaseQuery = (query || "").toLowerCase();
    let response = "";

    if (lowercaseQuery.includes('hello') || lowercaseQuery.includes('hi')) {
        response = "Hello! I am QuestAI, your professional learning assistant. How can I help you excel in your courses today?";
    } else if (lowercaseQuery.includes('next.js')) {
        response = "Next.js is a powerful React framework for building high-performance web applications. It includes features like Server-Side Rendering (SSR) and Static Site Generation (SSG).";
    } else if (lowercaseQuery.includes('python')) {
        response = "Python is a versatile language excellent for Data Science, Automation, and Artificial Intelligence.";
    } else {
        response = "That is a great question! In this professional Academy, we focus on mastering core concepts through practical video lessons. Check out our course catalog for more details.";
    }

    return NextResponse.json({ 
        response: response + "\n\n(QuestAI is in Standalone Demo Mode - local intelligence activated!)" 
    });
}
