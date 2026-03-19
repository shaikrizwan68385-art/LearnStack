'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, MessageSquare, Sparkles, User, BrainCircuit } from 'lucide-react';
import clsx from 'clsx';
import api from '@/lib/axios';

export default function FloatingAI() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([
        { role: 'ai', text: 'Hello! I am StackAI, your LearnStack learning companion. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleOpen = (e: any) => {
            setIsOpen(true);
            if (e.detail && e.detail.query) {
                // We use a small timeout to ensure the chat window is open before sending
                setTimeout(() => {
                    handleAutoQuery(e.detail.query);
                }, 100);
            }
        };
        window.addEventListener('open-ai' as any, handleOpen);
        return () => window.removeEventListener('open-ai' as any, handleOpen);
    }, []);

    const handleAutoQuery = async (query: string) => {
        const userMessage = query.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setIsTyping(true);

        try {
            const { data } = await api.post('/ai/chat', { 
                query: userMessage,
                history: [] // No history for auto-query
            });

            if (data && data.response) {
                setMessages(prev => [...prev, { role: 'ai', text: data.response }]);
            } else {
                setMessages(prev => [...prev, { role: 'ai', text: "I'm sorry, I couldn't process that. Please try again." }]);
            }
        } catch (error) {
            console.error('AI error:', error);
            setMessages(prev => [...prev, { role: 'ai', text: "Oops! I'm having trouble connecting right now." }]);
        } finally {
            setIsTyping(false);
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMessage = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setInput('');
        setIsTyping(true);

        try {
            // Prepare history for the backend (limit to last 5 messages for context)
            const history = messages.slice(-5).map(msg => ({
                role: msg.role === 'ai' ? 'assistant' : 'user',
                content: msg.text
            }));

            const { data } = await api.post('/ai/chat', { 
                query: userMessage,
                history: history
            });

            if (data && data.response) {
                setMessages(prev => [...prev, { role: 'ai', text: data.response }]);
            } else {
                setMessages(prev => [...prev, { role: 'ai', text: "I'm sorry, I couldn't process that. Please try again." }]);
            }
        } catch (error) {
            console.error('AI error:', error);
            setMessages(prev => [...prev, { role: 'ai', text: "Oops! I'm having trouble connecting right now. Please check your internet or try again later." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-[100] font-sans">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 transform hover:scale-110",
                    isOpen ? "bg-white text-black rotate-90" : "bg-primary text-white"
                )}
            >
                {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-white border-2 border-primary"></span>
                    </span>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-[400px] h-[600px] bg-[#0f0f13] border border-white/10 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-500">
                    {/* Header */}
                    <div className="p-6 bg-gradient-to-r from-primary to-indigo-600 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                            <Bot className="text-white" size={24} />
                        </div>
                        <div>
                            <h3 className="text-white font-black text-lg leading-none">StackAI</h3>
                            <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mt-1 italic flex items-center gap-1">
                                <Sparkles size={10} /> Powered by LearnStack-Engine
                            </p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth">
                        {messages.map((msg, i) => (
                            <div key={i} className={clsx("flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}>
                                <div className={clsx(
                                    "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
                                    msg.role === 'user'
                                        ? "bg-primary text-white rounded-tr-none"
                                        : "bg-white/5 text-gray-300 border border-white/10 rounded-tl-none"
                                )}>
                                    {msg.text}
                                </div>
                                <span className="text-[9px] font-bold text-gray-500 mt-2 uppercase tracking-tighter flex items-center gap-1">
                                    {msg.role === 'user' ? <>YOU <User size={8} /></> : <><Bot size={8} /> STACK-AI</>}
                                </span>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex flex-col items-start bg-white/5 p-4 rounded-2xl border border-white/10 animate-pulse">
                                <div className="flex gap-1">
                                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer / Input */}
                    <div className="p-6 border-t border-white/5 bg-[#0a0a0c]">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask StackAI anything..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm text-white focus:outline-none focus:border-primary/50 transition-all placeholder:text-gray-600"
                            />
                            <button
                                onClick={handleSend}
                                className="absolute right-2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:scale-105 transition active:scale-95"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                        <div className="flex justify-center gap-6 mt-4 opacity-30 group">
                            <BrainCircuit size={16} className="text-primary grayscale group-hover:grayscale-0 transition duration-500" />
                            <Sparkles size={16} className="text-secondary grayscale group-hover:grayscale-0 transition duration-500" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
