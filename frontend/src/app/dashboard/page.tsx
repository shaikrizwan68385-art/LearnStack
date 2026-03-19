'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/useAuthStore';
import Link from 'next/link';
import { BookOpen, Clock, ChevronRight, Sparkles, Search, Wand2 } from 'lucide-react';

export default function DashboardPage() {
    const { user } = useAuthStore();
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        window.dispatchEvent(new CustomEvent('open-ai', { detail: { query: searchQuery } }));
        setSearchQuery('');
    };

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const { data } = await api.get('/courses/dashboard');
                setSubjects(data.subjects);
            } catch (error) {
                console.error('Failed to load dashboard', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="p-10 max-w-7xl mx-auto">
            {/* Legend / Welcome */}
            <div className="mb-12 relative">
                <div className="flex items-center gap-3 text-primary mb-3">
                    <Sparkles size={20} />
                    <span className="text-sm font-bold tracking-[0.2em] uppercase">Student Dashboard</span>
                </div>
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div>
                        <h1 className="text-5xl font-black tracking-tighter mb-4">
                            Welcome back, <span className="text-gradient">{user?.name}</span>!
                        </h1>
                        <p className="text-lg text-muted-foreground font-light max-w-2xl">
                            You're doing great! Continue your journey where you left off or explore new horizons.
                        </p>
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
                                placeholder="Ask StackAI about your courses..."
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
            </div>

            {/* Courses Section */}
            <section>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold tracking-tight">Your Learning Path</h2>
                    <Link href="/subjects" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                        View All Courses <ChevronRight size={16} />
                    </Link>
                </div>

                {subjects.length === 0 ? (
                    <div className="glass-card rounded-[2.5rem] p-16 text-center border-dashed border-white/10">
                        <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <BookOpen size={40} />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">No active courses</h3>
                        <p className="text-muted-foreground mb-8 font-light max-w-md mx-auto">
                            It looks like you haven't enrolled in any courses yet. Start your journey by browsing our premium catalog.
                        </p>
                        <Link href="/subjects" className="px-10 py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:scale-105 transition shadow-xl shadow-primary/20 inline-block">
                            Browse Subjects
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {subjects.map((s) => (
                            <Link key={s.id} href={`/subjects/${s.id}`} className="group relative block">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-indigo-500/10 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-500" />
                                <div className="glass-card relative border border-white/5 hover:border-primary/30 transition duration-500 rounded-[2.5rem] p-8 h-full flex flex-col justify-between overflow-hidden shadow-2xl">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <BookOpen size={120} />
                                    </div>

                                    <div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-6">
                                            Software Development
                                        </div>
                                        <h3 className="text-2xl font-black mb-3 group-hover:text-primary transition">{s.title}</h3>
                                        <p className="text-muted-foreground font-light leading-relaxed line-clamp-2 mb-8">{s.description}</p>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Clock size={14} />
                                                12h 45m left
                                            </div>
                                            <div className="w-1 h-1 rounded-full bg-white/20" />
                                            <div className="text-xs text-primary font-bold">75% Complete</div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                            <ChevronRight size={20} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

