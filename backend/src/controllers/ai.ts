import { Request, Response } from 'express';
import dotenv from 'dotenv';
import { executeQuery } from '../config/db';
dotenv.config();

const API_KEY = process.env.HUGGINGFACE_API_KEY;

/**
 * Enhanced Fallback Logic for QuestAI
 */
const getFallbackResponse = (query: string): string => {
    const lowercaseQuery = query.toLowerCase();
    if (lowercaseQuery.includes('data science')) {
        return "Data Science is an interdisciplinary field that uses scientific methods, processes, algorithms and systems to extract knowledge and insights from noisy, structured and unstructured data.";
    } else if (lowercaseQuery.includes('full stack') || lowercaseQuery.includes('web development')) {
        return "Full Stack Web Development refers to the development of both front-end (client-side) and back-end (server-side) portions of a web application.";
    } else if (lowercaseQuery.includes('react') || lowercaseQuery.includes('next.js')) {
        return "Next.js is a powerful React framework that enables server-side rendering (SSR) and static site generation (SSG) for modern web applications.";
    } else if (lowercaseQuery.includes('java') || lowercaseQuery.includes('spring boot')) {
        return "Java is a versatile, object-oriented programming language. Spring Boot is a popular framework that simplifies creating production-ready applications.";
    } else if (lowercaseQuery.includes('python')) {
        return "Python is a high-level, general-purpose programming language. Its design philosophy emphasizes code readability, making it ideal for AI and Data Science.";
    }
    return "I am currently optimizing my global knowledge for this topic. In the meantime, explore our professional courses to accelerate your career!";
};

export const getAIResponse = async (req: Request, res: Response) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    console.log('--- QuestAI Global Knowledge Engine ---');
    console.log('Query:', query);

    try {
        // Only attempt external API if key is present and not default
        if (API_KEY && API_KEY !== 'your_token_here') {
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
                            { role: "system", content: "You are QuestAI, an expert Academy tutor. Provide direct, helpful answers." },
                            { role: "user", content: query }
                        ],
                        max_tokens: 500,
                    }),
                }
            );

            const result: any = await response.json();

            if (result.choices && result.choices[0] && result.choices[0].message) {
                console.log('✅ QuestAI Success');
                return res.json({ response: result.choices[0].message.content });
            }
        }

        // Fallback to Local Knowledge Base
        console.warn('🔄 Using QuestAI Local Knowledge Base...');
        
        try {
            const subjects: any[] = await executeQuery(
                "SELECT title, description FROM subjects WHERE title LIKE ? OR description LIKE ? LIMIT 1",
                [`%${query}%`, `%${query}%`]
            );
            
            if (subjects && subjects.length > 0) {
                const response = `Regarding "${query}", this is covered in our "${subjects[0].title}" course. ${subjects[0].description}.`;
                return res.json({ response: response + "\n\n(QuestAI is in localized mode - master your current subjects to unlock global insights!)" });
            }
        } catch (dbError) {
            console.error('DB Search Error:', dbError);
        }

        const fallbackResponse = getFallbackResponse(query);
        return res.json({ 
            response: fallbackResponse + "\n\n(QuestAI is in localized mode - master your current subjects to unlock global insights!)" 
        });

    } catch (error: any) {
        console.error('❌ QuestAI Error:', error.message);
        const fallbackResponse = getFallbackResponse(query);
        return res.json({ 
            response: fallbackResponse + "\n\n(QuestAI is currently optimizing its systems. Please continue your learning journey!)" 
        });
    }
};
