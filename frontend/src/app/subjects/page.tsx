'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/useAuthStore';
import Link from 'next/link';
import { Search, Sparkles, Wand2 } from 'lucide-react';

export default function SubjectsPage() {
    const { user } = useAuthStore();
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        
        // Dispatch event to open AI with this query
        window.dispatchEvent(new CustomEvent('open-ai', { detail: { query: searchQuery } }));
        setSearchQuery('');
    };

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const { data } = await api.get('/courses');
                setSubjects(data);
            } catch (error) {
                console.error('Failed to load subjects', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSubjects();
    }, []);

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-10 max-w-7xl mx-auto min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter mb-2 italic">
                        All <span className="text-gradient">Subjects</span>
                    </h1>
                    <p className="text-muted-foreground font-light">Explore our handpicked premium courses.</p>
                </div>

                {/* AI Search Bar */}
                <form 
                    onSubmit={handleSearch}
                    className="relative max-w-md w-full group"
                >
                    <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition duration-500" />
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Ask QuestAI about your courses..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-14 text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-gray-600"
                        />
                        <Search className="absolute left-4 text-gray-600 group-focus-within:text-primary transition-colors" size={18} />
                        <button 
                            type="submit"
                            className="absolute right-2 w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all active:scale-95"
                        >
                            <Wand2 size={18} />
                        </button>
                    </div>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {subjects.map((s) => (
                    <Link key={s.id} href={`/subjects/${s.id}`} className="group block h-full">
                        <div className="h-full border bg-card hover:border-primary/50 transition duration-300 rounded-2xl p-6 shadow-sm group-hover:shadow-md flex flex-col justify-between cursor-pointer">
                            <div>
                                <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition">{s.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-3">{s.description}</p>
                            </div>
                            <div className="mt-4 pt-4 border-t flex justify-end items-center text-sm font-medium text-primary">
                                View Details
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
