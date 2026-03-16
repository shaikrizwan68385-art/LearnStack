'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../lib/axios';
import { extractYoutubeId } from '../../../lib/utils';
import YouTube, { YouTubeEvent } from 'react-youtube';
import clsx from 'clsx';
import { Lock, PlayCircle, CheckCircle2, ChevronLeft, Award, BookOpen, Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { CreditCard, QrCode, Smartphone, X as CloseIcon } from 'lucide-react';

export default function SubjectDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [subject, setSubject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeVideo, setActiveVideo] = useState<any>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentSelected, setPaymentSelected] = useState<string | null>(null);
    const playerRef = useRef<any>(null);
    const saveInterval = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const fetchSubject = async () => {
            try {
                const { data } = await api.get(`/courses/${id}`);
                setSubject(data);
            } catch (error) {
                console.error('Failed to load subject', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSubject();
    }, [id]);

    useEffect(() => {
        return () => {
            if (saveInterval.current) clearInterval(saveInterval.current);
        };
    }, []);

    const handleEnroll = async () => {
        setShowPaymentModal(true);
    };

    const confirmPaymentAndEnroll = async () => {
        try {
            await api.post(`/courses/${id}/enroll`);
            setSubject({ ...subject, isEnrolled: true });
            setShowPaymentModal(false);
            setPaymentSelected(null);
        } catch (error) {
            alert('Failed to enroll');
        }
    };

    const handleVideoSelect = (video: any, isLocked: boolean) => {
        if (isLocked) return;
        setActiveVideo(video);
    };

    const saveProgress = async (currentTime: number, isCompleted: boolean = false) => {
        if (!activeVideo) return;
        try {
            await api.post('/progress/save', {
                videoId: activeVideo.id,
                progressSeconds: Math.floor(currentTime),
                isCompleted
            });
            setSubject((prev: any) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    sections: prev.sections.map((sec: any) => ({
                        ...sec,
                        videos: sec.videos.map((v: any) => {
                            if (v.id === activeVideo.id) {
                                return {
                                    ...v,
                                    progress_seconds: Math.floor(currentTime),
                                    is_completed: isCompleted ? 1 : v.is_completed
                                };
                            }
                            return v;
                        })
                    }))
                };
            });
        } catch (error) {
            console.error('Save progress failed', error);
        }
    };

    const handleStateChange = (event: YouTubeEvent) => {
        const player = event.target;
        if (event.data === 1) { // Playing
            if (!saveInterval.current) {
                saveInterval.current = setInterval(() => {
                    const time = player.getCurrentTime();
                    const duration = player.getDuration();
                    if (duration > 0) {
                        const isCompleted = time / duration >= 0.8;
                        saveProgress(time, isCompleted);
                    }
                }, 5000);
            }
        } else {
            if (saveInterval.current) clearInterval(saveInterval.current);
            saveInterval.current = null;
            if (event.data === 0) { // Ended
                const time = player.getCurrentTime();
                saveProgress(time, true);
            }
        }
    };

    const handlePlayerReady = (event: YouTubeEvent) => {
        playerRef.current = event.target;
        if (activeVideo && activeVideo.progress_seconds > 0 && !activeVideo.is_completed) {
            event.target.seekTo(activeVideo.progress_seconds);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
    if (!subject) return <div className="p-8 text-center text-2xl font-bold">Subject not found</div>;

    let globalVideoIndex = 0;
    let isPreviousCompleted = true;

    return (
        <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
            {/* Header */}
            <header className="h-20 glass border-b border-white/5 flex items-center px-8 justify-between flex-shrink-0 relative z-20">
                <div className="flex items-center gap-6">
                    <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center glass-card hover:bg-white/10 rounded-xl transition">
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-[3px] mb-0.5">
                            <BookOpen size={12} /> Course Module
                        </div>
                        <h1 className="text-xl font-black tracking-tight truncate max-w-md">{subject.title}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {!subject.isEnrolled ? (
                        <button onClick={handleEnroll} className="px-8 py-3 bg-primary text-white font-bold rounded-2xl hover:scale-105 transition shadow-xl shadow-primary/20 flex items-center gap-2">
                            <Sparkles size={18} /> Enroll to Unlock
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl text-xs font-bold border border-emerald-500/20 uppercase tracking-widest">
                            <Award size={16} /> Enrolled
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Video Area */}
                <div className="flex-1 overflow-auto bg-[#0a0a0c] p-10 flex flex-col items-center relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

                    {activeVideo ? (
                        <div className="w-full max-w-6xl space-y-8 relative z-10">
                            <div className="aspect-video glass-card border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                                <YouTube
                                    videoId={extractYoutubeId(activeVideo.video_url) || ''}
                                    opts={{ width: '100%', height: '100%', playerVars: { autoplay: 1, modestbranding: 1 } }}
                                    className="w-full h-full"
                                    onStateChange={handleStateChange}
                                    onReady={handlePlayerReady}
                                />
                            </div>
                            <div className="px-6">
                                <h2 className="text-3xl font-black tracking-tight mb-3">{activeVideo.title}</h2>
                                <p className="text-muted-foreground font-light leading-relaxed max-w-3xl">This lesson covers essential concepts within {subject.title}. Watch fully to unlock the next certificate module.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center relative z-10">
                            <div className="w-24 h-24 glass-card bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mb-8 animate-pulse">
                                <PlayCircle size={48} />
                            </div>
                            <h2 className="text-4xl font-black tracking-tight mb-4">Start Learning</h2>
                            <p className="text-muted-foreground font-light text-lg mb-8 max-w-md">
                                {subject.isEnrolled
                                    ? "Select a lesson from the curriculum sidebar to begin your journey."
                                    : "You must enroll in this course to access the high-definition video lessons and quizzes."}
                            </p>
                            {!subject.isEnrolled && (
                                <button onClick={handleEnroll} className="px-12 py-4 bg-primary text-white font-black rounded-[2rem] hover:scale-105 transition shadow-2xl shadow-primary/30">
                                    Enroll in Course
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <aside className="w-96 border-l border-white/5 bg-card flex flex-col overflow-hidden relative z-20">
                    <div className="p-8 border-b border-white/5">
                        <h3 className="text-lg font-black tracking-tight mb-1">Course Content</h3>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest flex items-center gap-2">
                            <Clock size={12} /> {subject.sections.reduce((acc: number, sec: any) => acc + sec.videos.length, 0)} Professional Lessons
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {subject.sections.map((section: any, sIdx: number) => (
                            <div key={section.id} className="mb-4">
                                <div className="px-8 py-3 bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground sticky top-0 z-10 backdrop-blur-md">
                                    Section {sIdx + 1}: {section.title}
                                </div>
                                <div className="flex flex-col">
                                    {section.videos.map((video: any, vIdx: number) => {
                                        const isLocked = !subject.isEnrolled || (!isPreviousCompleted && globalVideoIndex !== 0);
                                        const isCompleted = video.is_completed === 1;
                                        const isActive = activeVideo?.id === video.id;

                                        if (!isCompleted) isPreviousCompleted = false;
                                        globalVideoIndex++;

                                        return (
                                            <button
                                                key={video.id}
                                                onClick={() => handleVideoSelect(video, isLocked)}
                                                disabled={isLocked}
                                                className={clsx(
                                                    "px-8 py-5 text-left flex gap-4 transition-all relative border-b border-white/5",
                                                    isActive ? "bg-primary/10" : "hover:bg-white/5",
                                                    isLocked ? "opacity-30" : "cursor-pointer"
                                                )}
                                            >
                                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary shadow-[0_0_15px_rgba(168,85,247,0.5)]" />}
                                                <div className="mt-1 flex-shrink-0">
                                                    {isCompleted ? (
                                                        <CheckCircle2 size={18} className="text-emerald-500" />
                                                    ) : isLocked ? (
                                                        <Lock size={18} className="text-muted-foreground" />
                                                    ) : (
                                                        <PlayCircle size={18} className={isActive ? "text-primary" : "text-muted-foreground"} />
                                                    )}
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <p className={clsx("font-bold text-sm line-clamp-2 transition-colors", isActive ? "text-primary" : "text-foreground")}>
                                                        {video.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                                                            {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')} Video
                                                        </span>
                                                        {video.progress_seconds > 0 && !isCompleted && (
                                                            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-primary"
                                                                    style={{ width: `${(video.progress_seconds / video.duration) * 100}%` }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowPaymentModal(false)} />
                    <div className="relative w-full max-w-lg glass-card border border-white/10 rounded-[3rem] p-10 shadow-[0_40px_100px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in duration-300">
                        <button
                            onClick={() => setShowPaymentModal(false)}
                            className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center glass-card hover:bg-white/10 rounded-2xl transition"
                        >
                            <CloseIcon size={20} />
                        </button>

                        <div className="text-center space-y-4 mb-10">
                            <div className="w-20 h-20 bg-primary/10 text-primary rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
                                <CreditCard size={32} />
                            </div>
                            <h2 className="text-4xl font-black tracking-tight">Unlock Course</h2>
                            <p className="text-muted-foreground font-light px-10">Choose your preferred payment method to get instant access to {subject.title}.</p>
                        </div>

                        <div className="space-y-4">
                            {/* Google Pay */}
                            <button
                                onClick={() => setPaymentSelected('googlepay')}
                                className={clsx(
                                    "w-full p-6 rounded-[1.5rem] border-2 flex items-center justify-between transition-all duration-300",
                                    paymentSelected === 'googlepay' ? "border-primary bg-primary/10" : "border-white/5 bg-white/5 hover:border-white/20"
                                )}
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-inner overflow-hidden">
                                        <div className="font-bold text-gray-800 text-lg tracking-tight">G<span className="text-[#EA4335]">P</span><span className="text-[#FBBC05]">a</span><span className="text-[#34A853]">y</span></div>
                                    </div>
                                    <div className="text-left">
                                        <div className="font-black text-lg">Google Pay</div>
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Instant Checkout</div>
                                    </div>
                                </div>
                                <div className={clsx("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors", paymentSelected === 'googlepay' ? "border-primary bg-primary" : "border-white/10")}>
                                    {paymentSelected === 'googlepay' && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>
                            </button>

                            {/* PhonePe */}
                            <button
                                onClick={() => setPaymentSelected('phonepe')}
                                className={clsx(
                                    "w-full p-6 rounded-[1.5rem] border-2 flex items-center justify-between transition-all duration-300",
                                    paymentSelected === 'phonepe' ? "border-[#6739B7] bg-[#6739B7]/10" : "border-white/5 bg-white/5 hover:border-white/20"
                                )}
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-inner overflow-hidden p-2">
                                        <Smartphone className="text-[#6739B7]" size={24} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-black text-lg">PhonePe</div>
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">UPI Quick Transfer</div>
                                    </div>
                                </div>
                                <div className={clsx("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors", paymentSelected === 'phonepe' ? "border-[#6739B7] bg-[#6739B7]" : "border-white/10")}>
                                    {paymentSelected === 'phonepe' && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>
                            </button>
                        </div>

                        {paymentSelected && (
                            <div className="mt-10 animate-in slide-in-from-top-4 duration-500">
                                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4 text-emerald-500">
                                        <QrCode size={24} />
                                        <span className="text-sm font-bold">Scanning for secure connection...</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-muted-foreground uppercase">Grand Total</div>
                                        <div className="text-xl font-black">₹499.00</div>
                                    </div>
                                </div>
                                <button
                                    onClick={confirmPaymentAndEnroll}
                                    className="w-full py-5 bg-primary text-white font-black text-xl rounded-[1.5rem] hover:scale-105 transition shadow-2xl shadow-primary/30"
                                >
                                    Confirm Enrollment
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

