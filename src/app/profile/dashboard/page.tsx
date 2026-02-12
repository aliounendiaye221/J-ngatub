/**
 * Page /profile/dashboard — Dashboard de suivi de progression.
 * 
 * Affiche les statistiques de l'utilisateur premium :
 * - Score moyen, nombre de quiz, badges
 * - Graphique par matière (barres CSS, sans dépendance chart externe)
 * - Matières fortes et faibles
 * - Historique récent des tentatives
 * - Badges obtenus
 * 
 * Premium uniquement (protégé par middleware).
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    BarChart3, Trophy, Star, Brain, TrendingUp, TrendingDown,
    BookOpen, ArrowLeft, Clock, Target, Award, Heart,
    Sparkles, ArrowRight, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
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

    return (
        <div className="min-h-screen bg-slate-50/50 pb-24">
            {/* En-tête */}
            <div className="bg-white border-b mb-12">
                <div className="container mx-auto px-6 py-12">
                    <Link
                        href="/profile"
                        className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-6"
                    >
                        <ArrowLeft className="h-4 w-4" /> Mon profil
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/10">
                                <Sparkles className="h-4 w-4" />
                                <span>Premium</span>
                            </div>
                            <h1 className="text-4xl font-black tracking-tight">
                                Mon <span className="premium-gradient-text">Dashboard</span>
                            </h1>
                            <p className="text-muted-foreground font-medium">
                                Suivez votre progression et identifiez vos points à améliorer.
                            </p>
                        </div>
                        <Link
                            href="/quiz"
                            className="flex items-center gap-2 h-14 px-8 rounded-2xl bg-primary text-white font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                        >
                            <Brain className="h-5 w-5" /> Faire un quiz
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 space-y-12">
                {/* ─── Statistiques principales ──────────────────────────────── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { label: "Quiz complétés", value: data.stats.totalAttempts, icon: Brain, color: "text-blue-600", bg: "bg-blue-50" },
                        { label: "Score moyen", value: `${data.stats.averagePercentage}%`, icon: Target, color: "text-green-600", bg: "bg-green-50" },
                        { label: "Badges obtenus", value: data.stats.badgeCount, icon: Award, color: "text-amber-600", bg: "bg-amber-50" },
                        { label: "Documents favoris", value: data.stats.favoritesCount, icon: Heart, color: "text-red-600", bg: "bg-red-50" },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white p-6 rounded-[2rem] border shadow-sm">
                            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-4", stat.bg, stat.color)}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <p className="text-3xl font-black">{stat.value}</p>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* ─── Graphique par matière ──────────────────────────────── */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-8 rounded-[2rem] border shadow-sm">
                            <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-primary" />
                                Scores par matière
                            </h2>

                            {data.subjectStats.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <BookOpen className="h-10 w-10 mx-auto mb-4 opacity-50" />
                                    <p className="font-bold">Aucune donnée encore</p>
                                    <p className="text-sm">Complétez des quiz pour voir vos statistiques ici.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {data.subjectStats.map((stat) => (
                                        <div key={stat.name} className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-bold">{stat.name}</span>
                                                <span className={cn(
                                                    "font-black",
                                                    stat.averagePercentage >= 80 ? "text-green-600" :
                                                    stat.averagePercentage >= 50 ? "text-amber-600" :
                                                    "text-red-600"
                                                )}>
                                                    {stat.averagePercentage}%
                                                </span>
                                            </div>
                                            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-1000",
                                                        stat.averagePercentage >= 80 ? "bg-green-500" :
                                                        stat.averagePercentage >= 50 ? "bg-amber-500" :
                                                        "bg-red-500"
                                                    )}
                                                    style={{ width: `${stat.averagePercentage}%` }}
                                                />
                                            </div>
                                            <p className="text-[10px] font-bold text-muted-foreground">
                                                {stat.totalAttempts} tentative{stat.totalAttempts > 1 ? "s" : ""} • Meilleur : {stat.bestPercentage}%
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ─── Historique récent ──────────────────────────────── */}
                        <div className="bg-white p-8 rounded-[2rem] border shadow-sm">
                            <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary" />
                                Historique récent
                            </h2>

                            {data.recentAttempts.length === 0 ? (
                                <p className="text-center py-8 text-muted-foreground text-sm">
                                    Aucune tentative de quiz pour le moment.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {data.recentAttempts.map((attempt) => (
                                        <div key={attempt.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm",
                                                    attempt.percentage >= 80 ? "bg-green-100 text-green-700" :
                                                    attempt.percentage >= 50 ? "bg-amber-100 text-amber-700" :
                                                    "bg-red-100 text-red-700"
                                                )}>
                                                    {attempt.percentage}%
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">{attempt.quizTitle}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {attempt.subject} • {attempt.level} • {attempt.score}/{attempt.totalPoints} pts
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-xs text-muted-foreground font-medium">
                                                {new Date(attempt.completedAt).toLocaleDateString("fr-FR")}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ─── Sidebar ────────────────────────────────────────── */}
                    <div className="space-y-8">
                        {/* Matières faibles */}
                        {data.weakSubjects.length > 0 && (
                            <div className="bg-red-50 p-6 rounded-[2rem] border border-red-200">
                                <h3 className="font-black text-sm mb-4 flex items-center gap-2 text-red-700">
                                    <AlertTriangle className="h-4 w-4" />
                                    À améliorer
                                </h3>
                                <div className="space-y-3">
                                    {data.weakSubjects.map((s) => (
                                        <div key={s.name} className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-red-800">{s.name}</span>
                                            <span className="text-sm font-black text-red-600">{s.averagePercentage}%</span>
                                        </div>
                                    ))}
                                </div>
                                <Link
                                    href="/quiz"
                                    className="mt-4 flex items-center justify-center gap-2 h-10 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-all"
                                >
                                    Réviser <ArrowRight className="h-3 w-3" />
                                </Link>
                            </div>
                        )}

                        {/* Matières fortes */}
                        {data.strongSubjects.length > 0 && (
                            <div className="bg-green-50 p-6 rounded-[2rem] border border-green-200">
                                <h3 className="font-black text-sm mb-4 flex items-center gap-2 text-green-700">
                                    <TrendingUp className="h-4 w-4" />
                                    Points forts
                                </h3>
                                <div className="space-y-3">
                                    {data.strongSubjects.map((s) => (
                                        <div key={s.name} className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-green-800">{s.name}</span>
                                            <span className="text-sm font-black text-green-600">{s.averagePercentage}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Badges */}
                        <div className="bg-white p-6 rounded-[2rem] border shadow-sm">
                            <h3 className="font-black text-sm mb-4 flex items-center gap-2">
                                <Trophy className="h-4 w-4 text-amber-500" />
                                Mes Badges
                            </h3>
                            {data.badges.length === 0 ? (
                                <p className="text-xs text-muted-foreground text-center py-4">
                                    Complétez des quiz pour gagner des badges !
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {data.badges.map((badge, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                                            <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                                                <Star className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-amber-800">{badge.description}</p>
                                                <p className="text-[10px] text-amber-600">
                                                    {new Date(badge.earnedAt).toLocaleDateString("fr-FR")}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Quick links */}
                        <div className="space-y-3">
                            <Link
                                href="/quiz"
                                className="flex items-center gap-3 p-4 rounded-xl bg-primary text-white font-bold text-sm hover:scale-[1.02] transition-all shadow-lg shadow-primary/20"
                            >
                                <Brain className="h-5 w-5" /> Quiz interactifs
                                <ArrowRight className="h-4 w-4 ml-auto" />
                            </Link>
                            <Link
                                href="/certificates"
                                className="flex items-center gap-3 p-4 rounded-xl border bg-white font-bold text-sm hover:bg-slate-50 transition-all"
                            >
                                <Award className="h-5 w-5 text-primary" /> Mes certificats
                                <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
