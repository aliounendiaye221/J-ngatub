"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    BarChart3, Trophy, Star, Brain, TrendingUp, TrendingDown,
    BookOpen, ArrowLeft, Clock, Target, Award, Heart,
    Sparkles, ArrowRight, AlertTriangle, Flame, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types (Keep existing types)
interface SubjectStat {
    name: string;
    totalAttempts: number;
    totalScore: number;
    totalPossible: number;
    bestPercentage: number;
    averagePercentage: number;
}

interface RecentAttempt {
    id: string;
    quizTitle: string;
    subject: string;
    level: string;
    score: number;
    totalPoints: number;
    percentage: number;
    completedAt: string;
}

interface BadgeItem {
    name: string;
    description: string;
    icon: string;
    earnedAt: string;
}

interface DashboardData {
    stats: {
        totalAttempts: number;
        averagePercentage: number;
        totalScore: number;
        totalPossible: number;
        favoritesCount: number;
        badgeCount: number;
    };
    subjectStats: SubjectStat[];
    recentAttempts: RecentAttempt[];
    weakSubjects: SubjectStat[];
    strongSubjects: SubjectStat[];
    badges: BadgeItem[];
    subscription: any;
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/progress");
                if (res.ok) {
                    setData(await res.json());
                }
            } catch (error) {
                console.error("Erreur chargement dashboard:", error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-muted-foreground">Impossible de charger le dashboard.</p>
            </div>
        );
    }

    // Mock calculations for Gamification
    const currentLevel = Math.floor(data.stats.totalAttempts / 5) + 1;
    const progressToNextLevel = (data.stats.totalAttempts % 5) / 5 * 100;
    const nextLevel = currentLevel + 1;

    return (
        <div className="min-h-screen bg-slate-50/50 pb-24">
            {/* 2026 Header with Glassmorphism */}
            <div className="relative bg-white border-b mb-8 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="container mx-auto px-6 py-8 relative z-10">
                    <Link
                        href="/profile"
                        className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-6"
                    >
                        <ArrowLeft className="h-4 w-4" /> Mon profil
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-500/30"
                            >
                                <CrownIcon className="h-3 w-3" />
                                <span>Membre Elite</span>
                            </motion.div>
                            <h1 className="text-5xl font-black tracking-tight text-slate-900">
                                Bonjour, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Champion</span>
                            </h1>
                            <p className="text-muted-foreground font-medium max-w-md">
                                Vous êtes sur une série incroyable. Continuez comme ça pour atteindre le niveau {nextLevel} !
                            </p>
                        </div>

                        {/* Level Progress Card */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white p-4 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 min-w-[280px]"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-black uppercase text-slate-400">Niveau actuel</span>
                                <span className="text-xs font-black text-primary">{data.stats.totalAttempts}/5 XP</span>
                            </div>
                            <div className="flex items-end gap-2 mb-3">
                                <span className="text-3xl font-black text-slate-800">{currentLevel}</span>
                                <span className="text-sm font-bold text-slate-400 mb-1">/ {nextLevel}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressToNextLevel}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 space-y-8">
                {/* ─── Statistiques principales ──────────────────────────────── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <StatCard
                        label="Série en cours"
                        value="3 Jours"
                        icon={Flame}
                        color="text-orange-500"
                        bg="bg-orange-50"
                        delay={0.1}
                    />
                    <StatCard
                        label="Score moyen"
                        value={`${data.stats.averagePercentage}%`}
                        icon={Target}
                        color="text-green-600"
                        bg="bg-green-50"
                        delay={0.2}
                    />
                    <StatCard
                        label="Badges"
                        value={data.stats.badgeCount}
                        icon={Award}
                        color="text-amber-600"
                        bg="bg-amber-50"
                        delay={0.3}
                    />
                    <StatCard
                        label="Quiz terminés"
                        value={data.stats.totalAttempts}
                        icon={Brain}
                        color="text-blue-600"
                        bg="bg-blue-50"
                        delay={0.4}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ─── Graphique par matière ──────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="lg:col-span-2 space-y-8"
                    >
                        <div className="bg-white p-8 rounded-[2rem] border shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-5">
                                <BarChart3 className="h-48 w-48" />
                            </div>
                            <div className="flex items-center justify-between mb-8 relative z-10">
                                <h2 className="text-xl font-black flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-amber-500" />
                                    Performance par matière
                                </h2>
                                <Link href="/quiz" className="text-xs font-bold text-primary hover:underline">Voir tout</Link>
                            </div>

                            {data.subjectStats.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-2xl border border-dashed">
                                    <BookOpen className="h-10 w-10 mx-auto mb-4 opacity-50" />
                                    <p className="font-bold">Aucune donnée encore</p>
                                    <p className="text-sm">Complétez des quiz pour voir vos statistiques ici.</p>
                                    <Link href="/quiz" className="inline-block mt-4 text-xs font-bold text-white bg-primary px-4 py-2 rounded-lg">Commencer</Link>
                                </div>
                            ) : (
                                <div className="space-y-6 relative z-10">
                                    {data.subjectStats.map((stat, i) => (
                                        <div key={stat.name} className="space-y-2 group">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-3">
                                                    <span className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-500">{i + 1}</span>
                                                    <span className="font-bold text-slate-700">{stat.name}</span>
                                                </div>
                                                <span className={cn(
                                                    "font-black px-2 py-1 rounded-md text-xs",
                                                    stat.averagePercentage >= 80 ? "bg-green-100 text-green-700" :
                                                        stat.averagePercentage >= 50 ? "bg-amber-100 text-amber-700" :
                                                            "bg-red-100 text-red-700"
                                                )}>
                                                    {stat.averagePercentage}%
                                                </span>
                                            </div>
                                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${stat.averagePercentage}%` }}
                                                    transition={{ duration: 1, delay: 0.2 }}
                                                    className={cn(
                                                        "h-full rounded-full",
                                                        stat.averagePercentage >= 80 ? "bg-green-500" :
                                                            stat.averagePercentage >= 50 ? "bg-amber-500" :
                                                                "bg-red-500"
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recent History with Modern Cards */}
                        <div className="bg-white p-8 rounded-[2rem] border shadow-sm">
                            <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary" />
                                Activité Récente
                            </h2>
                            {data.recentAttempts.length === 0 ? (
                                <p className="text-center py-8 text-muted-foreground text-sm">
                                    Aucune tentative de quiz pour le moment.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {data.recentAttempts.map((attempt) => (
                                        <div key={attempt.id} className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "h-12 w-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm transition-transform group-hover:scale-110",
                                                    attempt.percentage >= 80 ? "bg-green-500 text-white" :
                                                        attempt.percentage >= 50 ? "bg-amber-500 text-white" :
                                                            "bg-red-500 text-white"
                                                )}>
                                                    {attempt.percentage}%
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 group-hover:text-primary transition-colors">{attempt.quizTitle}</p>
                                                    <p className="text-xs text-muted-foreground font-medium flex items-center gap-2 mt-1">
                                                        <span className="bg-slate-200 px-2 py-0.5 rounded text-[10px] uppercase tracking-wide text-slate-600">{attempt.subject}</span>
                                                        <span>• {attempt.score}/{attempt.totalPoints} pts</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* ─── Sidebar ────────────────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="space-y-6"
                    >
                        {/* Call to Action - Practice Weak Subjects */}
                        {data.weakSubjects.length > 0 && (
                            <div className="bg-gradient-to-br from-red-50 to-white p-6 rounded-[2rem] border border-red-100 relative overflow-hidden group">
                                <div className="absolute right-0 top-0 h-32 w-32 bg-red-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                <h3 className="font-black text-sm mb-4 flex items-center gap-2 text-red-700 relative z-10">
                                    <TrendingDown className="h-4 w-4" />
                                    Focus Prioritaire
                                </h3>
                                <div className="space-y-3 relative z-10 mb-6">
                                    {data.weakSubjects.slice(0, 2).map((s) => (
                                        <div key={s.name} className="flex items-center justify-between bg-white p-3 rounded-xl border border-red-100 shadow-sm">
                                            <span className="text-sm font-bold text-red-900">{s.name}</span>
                                            <span className="text-xs font-black text-red-500">{s.averagePercentage}%</span>
                                        </div>
                                    ))}
                                </div>
                                <Link
                                    href="/quiz"
                                    className="relative z-10 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/20 transition-all"
                                >
                                    S&apos;entraîner maintenant <ArrowRight className="h-3 w-3" />
                                </Link>
                            </div>
                        )}

                        {/* Badges Collection */}
                        <div className="bg-white p-6 rounded-[2rem] border shadow-sm">
                            <h3 className="font-black text-sm mb-4 flex items-center gap-2">
                                <Trophy className="h-4 w-4 text-amber-500" />
                                Collection
                            </h3>
                            <div className="grid grid-cols-4 gap-2">
                                {data.badges.map((badge, i) => (
                                    <div key={i} className="aspect-square rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 hover:scale-110 transition-transform cursor-help" title={badge.description}>
                                        <Star className="h-5 w-5 fill-current" />
                                    </div>
                                ))}
                                {[...Array(Math.max(0, 8 - data.badges.length))].map((_, i) => (
                                    <div key={`empty-${i}`} className="aspect-square rounded-xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-300">
                                        <div className="h-2 w-2 rounded-full bg-slate-200"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color, bg, delay }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay }}
            className="bg-white p-6 rounded-[2rem] border shadow-sm hover:shadow-md transition-shadow group"
        >
            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:rotate-12", bg, color)}>
                <Icon className="h-6 w-6" />
            </div>
            <p className="text-3xl font-black tracking-tight text-slate-900">{value}</p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">{label}</p>
        </motion.div>
    );
}

function CrownIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m2 4 3 12h14l3-12-6 7-4-3-4 3-6-7z" />
        </svg>
    );
}
