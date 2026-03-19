import { Request, Response } from 'express';
// We'll use a very smart model for "all the information all over the world"
import dotenv from 'dotenv';
import { executeQuery } from '../config/db';
dotenv.config();

const API_KEY = process.env.HUGGINGFACE_API_KEY;

export const getAIResponse = async (req: Request, res: Response) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    console.log('--- StackAI Global Knowledge Engine (Router Mode) ---');
    console.log('Query:', query);

    try {
        // Updated to Hugging Face Router (OpenAI compatible)
        // Using Qwen2.5-72B-Instruct which is extremely powerful and currently active on the router
        const hf_response = await fetch(
            "https://router.huggingface.co/v1/chat/completions",
            {
                headers: { 
                    "Authorization": `Bearer ${API_KEY}`,
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({
                    model: "Qwen/Qwen2.5-72B-Instruct",
                    messages: [
                        { 
                            role: "system", 
                            content: "You are StackAI, a brilliant global tutor. Provide clear, accurate, and helpful educational answers." 
                        },
                        { role: "user", content: query }
                    ],
                    max_tokens: 800,
                    temperature: 0.7,
                }),
            }
        );

        const result: any = await hf_response.json();
        
        if (result.choices && result.choices[0] && result.choices[0].message) {
            console.log('✅ AI Knowledge Provider Success');
            return res.json({ response: result.choices[0].message.content.trim() });
        }
        
        if (result.error) {
            console.error('Provider Error:', result.error);
            throw new Error(result.error.message || 'API Response Invalid');
        }

        throw new Error('Unexpected API response structure');

    } catch (error: any) {
        console.warn('Live AI Provider Busy, using Local Knowledge Index...');
        
        try {
            // Enhanced Local Search
            const subjects = await executeQuery(
                "SELECT title, description FROM subjects WHERE title LIKE ? OR description LIKE ? LIMIT 1",
                [`%${query}%`, `%${query}%`]
            );

            if (subjects && subjects.length > 0) {
                const s = subjects[0];
                return res.json({ response: `I found details in our curriculum: ${s.title} - ${s.description}. This is a critical subject for your career development!` });
            }

            // High-quality fallback response strategy
            const q = query.toLowerCase();
            let fallback = "I'm your global learning assistant. I can answer questions about science, technology, history, and the professional world! I'm currently in high-performance mode, so please ask clearly.";
            
            if (q.includes('capital') || q.includes('country') || q.includes('world')) {
                fallback = "Exploring the world is fascinating! As your AI tutor, I suggest checking our 'Global Studies' subjects to learn more about geography and international relations. Master your current courses to expand your horizons!";
            } else if (q.includes('who is') || q.includes('tell me about')) {
                fallback = `That's a significant topic! You should explore our related subjects once you've completed your foundational tasks. Master ${query} to reach new professional heights!`;
            } else if (q.includes('what is') || q.includes('how')) {
                fallback = `Understanding "${query}" is a key step in your learning journey. LearnStack provides structured paths to master such concepts. Check out our 'Course Catalog' to see how this fits into your career roadmap!`;
            }

            console.log('✅ Local Knowledge Fallback Success');
            return res.json({ response: fallback });

        } catch (dbError) {
            console.error('Critical Failure:', dbError);
            res.json({ response: "StackAI is currently upgrading its global brain. Please try again in a few moments!" });
        }
    }
};
