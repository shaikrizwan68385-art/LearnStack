'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/useAuthStore';
import Link from 'next/link';
import { BookOpen, LogOut, LayoutDashboard, Settings } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, user, logout } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        } else if (user?.role !== 'ADMIN') {
            router.push('/dashboard');
        }
    }, [isAuthenticated, user, router]);

    if (!isAuthenticated || user?.role !== 'ADMIN') return null;

    return (
        <div className="flex h-screen bg-background text-foreground">
            {/* Sidebar */}
            <div className="w-64 bg-card border-r shadow-sm flex flex-col justify-between hidden md:flex">
                <div>
                    <div className="p-6">
                        <h1 className="text-2xl font-bold tracking-tight text-primary">Quest Admin</h1>
                    </div>
                    <nav className="mt-4 px-4 space-y-2">
                        <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-medium hover:bg-primary/20 transition">
                            <LayoutDashboard size={20} />
                            Overview
                        </Link>
                        <Link href="/admin/courses" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-input hover:text-foreground transition">
                            <BookOpen size={20} />
                            Manage Courses
                        </Link>
                    </nav>
                </div>
                <div className="p-4 border-t border-border">
                    <div className="mb-4 px-2">
                        <p className="text-sm font-medium">{user?.name} (Admin)</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <button
                        onClick={() => { logout(); router.push('/login'); }}
                        className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto bg-muted/30">
                {children}
            </div>
        </div>
    );
}
