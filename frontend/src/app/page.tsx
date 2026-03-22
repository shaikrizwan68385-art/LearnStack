'use client';

import Link from 'next/link';
import { ArrowRight, Play, BookOpen, BarChart3, ShieldCheck, Sparkles as SparklesIcon } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useEffect, useState } from 'react';

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Navbar Placeholder */}
      <nav className="h-20 flex items-center justify-between px-8 md:px-16 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <BookOpen className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight">Quest<span className="text-primary">Academy</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="#" className="hover:text-foreground transition">Courses</Link>
          <Link href="#" className="hover:text-foreground transition">Mentors</Link>
          <Link href="#" className="hover:text-foreground transition">Pricing</Link>
          <Link href="/login" className="px-5 py-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition">Login</Link>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center pt-24 pb-32 px-6">
        <div
          onClick={() => window.dispatchEvent(new CustomEvent('open-ai'))}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-8 animate-fade-in hover:bg-primary/20 cursor-pointer transition-colors group"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="flex items-center gap-1">
            <SparklesIcon size={12} className="group-hover:rotate-12 transition-transform" />
            NEW: AI-POWERED LEARNING PATHS
          </span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 text-center leading-[0.9]">
          ELEVATE YOUR <br />
          <span className="text-gradient">GENIUS</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl text-center leading-relaxed font-light">
          Experience a world-class learning platform designed for the next generation of creators, engineers, and leaders.
        </p>

        <div className="flex flex-col sm:flex-row gap-5">
          <Link
            href={isAuthenticated ? "/subjects" : "/register"}
            className="group px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold flex items-center gap-2 hover:scale-105 transition shadow-2xl shadow-primary/30"
          >
            {isAuthenticated ? "Go to My Courses" : "Start Learning Now"}
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 rounded-full glass font-semibold flex items-center gap-2 hover:bg-white/5 transition"
          >
            <Play size={18} fill="currentColor" />
            Watch Demo
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full">
          {[
            { title: 'Interactive Video', desc: 'Seamlessly track progress and resume where you left off.', icon: Play },
            { title: 'Smart Analytics', desc: 'Deep dive into your learning habits and performance.', icon: BarChart3 },
            { title: 'Certified Success', desc: 'Gain industry-recognized credentials upon completion.', icon: ShieldCheck },
          ].map((f, i) => (
            <Link key={i} href="/subjects" className="glass-card p-8 rounded-[2.5rem] group hover:border-primary/30 transition block">
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition shadow-inner">
                <f.icon size={26} />
              </div>
              <h3 className="text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

