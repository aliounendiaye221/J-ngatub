/**
 * Page /quiz — Liste des quiz interactifs disponibles.
 * 
 * Affiche tous les quiz filtrés par niveau et matière.
 * Réservé aux utilisateurs premium (protégé par middleware).
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Brain, Trophy, Clock, BookOpen, Filter, Star, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Type pour un quiz enrichi (avec score utilisateur)
interface QuizItem {
    id: string;
    title: string;
    description: string | null;
    duration: number;
    level: { name: string; slug: string };
    subject: { name: string; slug: string };
    _count: { questions: number; attempts: number };
    userBestScore: number | null;
    userTotalPoints: number | null;
    userAttemptCount: number;
}

export default function QuizListPage() {
    const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [levelFilter, setLevelFilter] = useState("all");
    const [subjectFilter, setSubjectFilter] = useState("all");

    // Charger les quiz depuis l'API
    useEffect(() => {
        async function fetchQuizzes() {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (levelFilter !== "all") params.set("level", levelFilter);
                if (subjectFilter !== "all") params.set("subject", subjectFilter);

                const res = await fetch(`/api/quiz?${params.toString()}`);
                if (res.ok) {
                    const data = await res.json();
                    setQuizzes(data);
                }
            } catch (error) {
                console.error("Erreur chargement quiz:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchQuizzes();
    }, [levelFilter, subjectFilter]);

    return (
        <div className="min-h-screen bg-slate-50/50 pb-24">
            {/* En-tête */}
            <div className="bg-white border-b mb-12">
                <div className="container mx-auto px-6 py-16">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="space-y-4 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/10">
                                <Brain className="h-4 w-4" />
                                <span>Premium</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                                Quiz <span className="premium-gradient-text">Interactifs</span>
                            </h1>
                            <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                                Testez vos connaissances avec des quiz par matière. Suivez votre progression et gagnez des badges.
                            </p>
                        </div>
                        <div className="h-32 w-32 rounded-[2.5rem] bg-primary/5 flex items-center justify-center text-primary">
                            <Brain className="h-16 w-16" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 space-y-12">
                {/* Filtres */}
                <div className="flex flex-wrap gap-4">
                    <select
                        value={levelFilter}
                        onChange={(e) => setLevelFilter(e.target.value)}
                        className="h-12 px-4 rounded-2xl border bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="all">Tous les niveaux</option>
                        <option value="bfem">BFEM</option>
                        <option value="bac">BAC</option>
                    </select>
                    <select
                        value={subjectFilter}
                        onChange={(e) => setSubjectFilter(e.target.value)}
                        className="h-12 px-4 rounded-2xl border bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="all">Toutes les matières</option>
                        <option value="mathematiques">Mathématiques</option>
                        <option value="physique-chimie">Physique-Chimie</option>
                        <option value="svt">SVT</option>
                        <option value="francais">Français</option>
                        <option value="anglais">Anglais</option>
                        <option value="histoire-geo">Histoire-Géographie</option>
                        <option value="philosophie">Philosophie</option>
                    </select>
                </div>

                {/* Grille des quiz */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-72 rounded-[2rem] bg-white border animate-pulse" />
                        ))}
                    </div>
                ) : quizzes.length === 0 ? (
                    <div className="text-center py-20 space-y-4">
                        <div className="mx-auto h-20 w-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                            <BookOpen className="h-10 w-10" />
                        </div>
                        <p className="text-2xl font-black">Aucun quiz disponible</p>
                        <p className="text-muted-foreground">Les quiz pour ce filtre seront bientôt ajoutés.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {quizzes.map((quiz) => (
                            <QuizCard key={quiz.id} quiz={quiz} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/** Carte individuelle d'un quiz */
function QuizCard({ quiz }: { quiz: QuizItem }) {
    const hasAttempted = quiz.userAttemptCount > 0;
    const percentage = hasAttempted && quiz.userTotalPoints
        ? Math.round((quiz.userBestScore! / quiz.userTotalPoints) * 100)
        : null;

    return (
        <Link
            href={`/quiz/${quiz.id}`}
            className="group flex flex-col p-8 rounded-[2rem] bg-white border hover:shadow-xl hover:border-primary/20 transition-all"
        >
            {/* En-tête */}
            <div className="flex items-start justify-between mb-6">
                <div className="space-y-2">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                        {quiz.level.name}
                    </span>
                    <h3 className="text-lg font-black leading-tight group-hover:text-primary transition-colors">
                        {quiz.title}
                    </h3>
                </div>
                {hasAttempted && (
                    <div className={cn(
                        "h-12 w-12 rounded-2xl flex items-center justify-center font-black text-sm",
                        percentage! >= 80 ? "bg-green-100 text-green-700" :
                        percentage! >= 50 ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                    )}>
                        {percentage}%
                    </div>
                )}
            </div>

            {/* Description */}
            {quiz.description && (
                <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{quiz.description}</p>
            )}

            {/* Métadonnées */}
            <div className="flex flex-wrap gap-4 text-xs font-bold text-muted-foreground mt-auto pt-4 border-t">
                <div className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    {quiz.subject.name}
                </div>
                <div className="flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5" />
                    {quiz._count.questions} questions
                </div>
                <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {quiz.duration} min
                </div>
                {hasAttempted && (
                    <div className="flex items-center gap-1.5 text-primary">
                        <Trophy className="h-3.5 w-3.5" />
                        {quiz.userAttemptCount} tentative{quiz.userAttemptCount > 1 ? "s" : ""}
                    </div>
                )}
            </div>

            {/* CTA */}
            <div className="mt-6 flex items-center justify-center gap-2 h-12 rounded-xl bg-primary/5 text-primary font-black text-sm group-hover:bg-primary group-hover:text-white transition-all">
                {hasAttempted ? "Retenter" : "Commencer"}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
        </Link>
    );
}
