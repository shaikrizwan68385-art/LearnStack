'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/axios';
import Link from 'next/link';
import { User, Mail, Lock, UserPlus } from 'lucide-react';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/register', { name, email, password });
            alert('Registration successful, please login');
            router.push('/login');
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Registration failed';
            const hint = error.response?.data?.hint ? `\n\nHint: ${error.response.data.hint}` : '';
            alert(`${errorMsg}${hint}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background relative flex items-center justify-center p-6 overflow-hidden">
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md glass-card rounded-[2.5rem] shadow-2xl p-10 relative z-10">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">Join Quest Academy</h1>
                    <p className="text-muted-foreground font-light">Start your professional journey today</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 text-foreground rounded-2xl focus:outline-none focus:border-primary/50 transition-all font-light"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="email"
                            placeholder="Ask QuestAI about your courses..."
                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 text-foreground rounded-2xl focus:outline-none focus:border-primary/50 transition-all font-light"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="password"
                            placeholder="Create Password"
                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 text-foreground rounded-2xl focus:outline-none focus:border-primary/50 transition-all font-light"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Processing...' : (
                            <>
                                Create Account <UserPlus size={18} />
                            </>
                        )}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm font-light text-muted-foreground">
                    Already have an account? <Link href="/login" className="text-primary font-semibold hover:underline">Log in</Link>
                </p>
            </div>
        </div>
    );
}

