import { Request, Response } from 'express';
// We'll use a very smart model for "all the information all over the world"
import dotenv from 'dotenv';
import { executeQuery } from '../config/db';
dotenv.config();

const API_KEY = process.env.HUGGINGFACE_API_KEY;

export const getAIResponse = async (req: Request, res: Response) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    console.log('--- StackAI Global Knowledge Engine ---');
    console.log('Query:', query);

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
                        { role: "system", content: "You are StackAI, an expert tutor. Provide direct, helpful answers." },
                        { role: "user", content: query }
                    ],
                    max_tokens: 500,
                }),
            }
        );

        const result: any = await response.json();

        if (result.choices && result.choices[0] && result.choices[0].message) {
            console.log('✅ AI Success:', result.choices[0].message.content.substring(0, 50) + '...');
            return res.json({ response: result.choices[0].message.content });
        }

        if (result.error) {
            console.error('❌ AI Provider Error Detail:', JSON.stringify(result.error, null, 2));
            throw new Error(result.error.message || 'API Response Invalid');
        }

        throw new Error('Unexpected API response structure');

    } catch (error: any) {
        console.error('❌ AI Fetch Crash:', error.message);
        console.warn('🔄 Falling back to Mock Knowledge Base...');
        
        const lowercaseQuery = query.toLowerCase();
        let response = "";

        // Mock Knowledge Base for common educational queries
        if (lowercaseQuery.includes('data science')) {
            response = "Data Science is an interdisciplinary field that uses scientific methods, processes, algorithms and systems to extract knowledge and insights from noisy, structured and unstructured data. It involves statistics, data analysis, machine learning and related strategies to understand and analyze actual phenomena with data.";
        } else if (lowercaseQuery.includes('full stack') || lowercaseQuery.includes('web development')) {
            response = "Full Stack Web Development refers to the development of both front-end (client-side) and back-end (server-side) portions of a web application. A Full Stack Developer can design the UI, write the logic, and manage the database.";
        } else if (lowercaseQuery.includes('react') || lowercaseQuery.includes('next.js')) {
            response = "Next.js is a powerful React framework that enables server-side rendering (SSR) and static site generation (SSG) for web applications. It provides excellent performance, SEO benefits, and a great developer experience out of the box.";
        } else if (lowercaseQuery.includes('java') || lowercaseQuery.includes('spring boot')) {
            response = "Java is a versatile, object-oriented programming language used widely for building enterprise-level applications. Spring Boot is a popular framework that simplifies the process of creating production-ready, stand-alone, Spring-based applications.";
        } else if (lowercaseQuery.includes('python')) {
            response = "Python is a high-level, interpreted, general-purpose programming language. Its design philosophy emphasizes code readability, and its syntax allows programmers to express concepts in fewer lines of code. It's the primary language for Data Science and Machine Learning.";
        } else {
            // Enhanced Local Search from DB
            try {
                const subjects = await executeQuery(
                    "SELECT title, description FROM subjects WHERE title LIKE ? OR description LIKE ? LIMIT 1",
                    [`%${query}%`, `%${query}%`]
                );
                
                if (subjects && subjects.length > 0) {
                    response = `Regarding "${query}", this is part of our "${subjects[0].title}" course. ${subjects[0].description}. Explore our course catalog to master these skills!`;
                } else {
                    response = `I am currently optimizing my global knowledge for "${query}". In the meantime, checkout our professional courses in Full-Stack Web Development, Data Science, and Mobile App programming to accelerate your career!`;
                }
            } catch (dbError) {
                response = "StackAI is currently upgrading its global brain. Please try again in a few moments!";
            }
        }

        return res.json({ response });
    }
};
