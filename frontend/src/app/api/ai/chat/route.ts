import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const { query } = await req.json();

    // Standalone QuestAI Mock Logic
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
