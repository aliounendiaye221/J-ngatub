/**
 * Page /quiz/[id] — Interface de quiz interactif.
 * 
 * Affiche les questions une par une avec un timer.
 * À la soumission, affiche les résultats détaillés.
 * Premium uniquement (protégé par middleware).
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    Brain, Clock, ArrowLeft, ArrowRight, CheckCircle2,
    XCircle, Trophy, Star, Sparkles, RotateCcw, Home
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface Question {
    id: string;
    question: string;
    options: string[];
    points: number;
    order: number;
}

interface Quiz {
    id: string;
    title: string;
    description: string | null;
    duration: number;
    level: { name: string };
    subject: { name: string };
    questions: Question[];
}

interface QuizResult {
    score: number;
    totalPoints: number;
    percentage: number;
    quizTitle: string;
    results: {
        questionId: string;
        question: string;
        options: string[];
        userAnswer: number;
        correctAnswer: number;
        isCorrect: boolean;
        explanation: string | null;
        points: number;
    }[];
    badgeEarned: { name: string; description: string; icon: string } | null;
}

export default function QuizPage() {
    const params = useParams();
    const router = useRouter();
    const quizId = params.id as string;

    // États
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<(number | null)[]>([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<QuizResult | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);

    // Charger le quiz
    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`/api/quiz/${quizId}`);
                if (res.ok) {
                    const data = await res.json();
                    setQuiz(data);
                    setAnswers(new Array(data.questions.length).fill(null));
                    setTimeLeft(data.duration * 60); // en secondes
                } else {
                    router.push("/quiz");
                }
            } catch {
                router.push("/quiz");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [quizId, router]);

    // Soumettre le quiz
    const handleSubmit = useCallback(async () => {
        if (!quiz || submitting) return;
        setSubmitting(true);

        try {
            // Remplacer les null par 0 (première option par défaut)
            const finalAnswers = answers.map((a) => a ?? 0);

            const res = await fetch("/api/quiz/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quizId: quiz.id, answers: finalAnswers }),
            });

            if (res.ok) {
                const data = await res.json();
                setResult(data);
            }
        } catch (error) {
            console.error("Erreur soumission:", error);
        } finally {
            setSubmitting(false);
        }
    }, [quiz, answers, submitting]);

    // Timer countdown
    useEffect(() => {
        if (!quiz || result || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(); // Auto-submit quand le temps expire
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [quiz, result, timeLeft, handleSubmit]);

    // Formater le temps restant
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    // Sélectionner une réponse
    const selectAnswer = (optionIndex: number) => {
        if (result) return;
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = optionIndex;
        setAnswers(newAnswers);
    };

    // ─── Rendu ──────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!quiz) return null;

    // ─── Page de résultats ──────────────────────────────────────────
    if (result) {
        return (
            <div className="min-h-screen bg-slate-50/50 pb-24">
                <div className="container mx-auto px-6 py-12 max-w-3xl">
                    {/* Score principal */}
                    <div className="text-center space-y-6 mb-12">
                        <div className={cn(
                            "mx-auto h-32 w-32 rounded-[2.5rem] flex items-center justify-center shadow-2xl",
                            result.percentage >= 80 ? "bg-green-500 text-white shadow-green-500/30" :
                            result.percentage >= 50 ? "bg-amber-500 text-white shadow-amber-500/30" :
                            "bg-red-500 text-white shadow-red-500/30"
                        )}>
                            <span className="text-4xl font-black">{result.percentage}%</span>
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-black">
                                {result.percentage >= 80 ? "Excellent !" :
                                 result.percentage >= 50 ? "Bien joué !" : "Continuez à réviser !"}
                            </h1>
                            <p className="text-muted-foreground font-medium">
                                {result.score} / {result.totalPoints} points — {result.quizTitle}
                            </p>
                        </div>

                        {/* Badge gagné */}
                        {result.badgeEarned && (
                            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700">
                                <Trophy className="h-6 w-6" />
                                <div className="text-left">
                                    <p className="font-black text-sm">Badge débloqué !</p>
                                    <p className="text-xs">{result.badgeEarned.description}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Détail des réponses */}
                    <div className="space-y-4 mb-12">
                        <h2 className="text-xl font-black">Détail des réponses</h2>
                        {result.results.map((r, i) => (
                            <div key={r.questionId} className={cn(
                                "p-6 rounded-2xl border",
                                r.isCorrect ? "bg-green-50/50 border-green-200" : "bg-red-50/50 border-red-200"
                            )}>
                                <div className="flex items-start gap-3 mb-4">
                                    {r.isCorrect
                                        ? <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        : <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                    }
                                    <p className="font-bold text-sm">{i + 1}. {r.question}</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-8">
                                    {r.options.map((opt: string, j: number) => (
                                        <div key={j} className={cn(
                                            "px-4 py-2 rounded-xl text-sm font-medium",
                                            j === r.correctAnswer ? "bg-green-100 text-green-800 border border-green-300" :
                                            j === r.userAnswer && !r.isCorrect ? "bg-red-100 text-red-800 border border-red-300" :
                                            "bg-white border text-slate-600"
                                        )}>
                                            {opt}
                                        </div>
                                    ))}
                                </div>
                                {r.explanation && (
                                    <p className="mt-3 ml-8 text-xs text-muted-foreground italic border-l-2 border-primary/20 pl-3">
                                        {r.explanation}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-4 justify-center">
                        <button
                            onClick={() => {
                                setResult(null);
                                setAnswers(new Array(quiz.questions.length).fill(null));
                                setCurrentQuestion(0);
                                setTimeLeft(quiz.duration * 60);
                            }}
                            className="flex items-center gap-2 h-14 px-8 rounded-2xl bg-primary text-white font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                        >
                            <RotateCcw className="h-5 w-5" /> Retenter
                        </button>
                        <Link
                            href="/quiz"
                            className="flex items-center gap-2 h-14 px-8 rounded-2xl border bg-white font-black text-sm hover:bg-slate-50 transition-all"
                        >
                            <Home className="h-5 w-5" /> Autres quiz
                        </Link>
                        <Link
                            href="/profile/dashboard"
                            className="flex items-center gap-2 h-14 px-8 rounded-2xl border bg-white font-black text-sm hover:bg-slate-50 transition-all"
                        >
                            <Star className="h-5 w-5" /> Mon dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Interface du quiz en cours ─────────────────────────────────
    const question = quiz.questions[currentQuestion];
    const answeredCount = answers.filter((a) => a !== null).length;
    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

    return (
        <div className="min-h-screen bg-slate-50/50 pb-24">
            <div className="container mx-auto px-6 py-8 max-w-3xl">
                {/* Header quiz */}
                <div className="flex items-center justify-between mb-8">
                    <Link
                        href="/quiz"
                        className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary"
                    >
                        <ArrowLeft className="h-4 w-4" /> Quitter
                    </Link>
                    <div className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full font-black text-sm",
                        timeLeft < 60 ? "bg-red-100 text-red-700 animate-pulse" :
                        timeLeft < 300 ? "bg-amber-100 text-amber-700" :
                        "bg-slate-100 text-slate-700"
                    )}>
                        <Clock className="h-4 w-4" />
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Infos du quiz */}
                <div className="mb-8 space-y-4">
                    <h1 className="text-2xl font-black">{quiz.title}</h1>
                    <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                        <span>{quiz.level.name}</span>
                        <span>•</span>
                        <span>{quiz.subject.name}</span>
                        <span>•</span>
                        <span>Question {currentQuestion + 1} / {quiz.questions.length}</span>
                    </div>
                    {/* Barre de progression */}
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Question */}
                <div className="bg-white rounded-[2rem] border p-8 mb-8 shadow-sm">
                    <p className="text-lg font-bold mb-8">{question.question}</p>

                    <div className="space-y-3">
                        {question.options.map((option: string, i: number) => (
                            <button
                                key={i}
                                onClick={() => selectAnswer(i)}
                                className={cn(
                                    "w-full text-left p-5 rounded-xl border-2 font-medium text-sm transition-all active:scale-[0.98]",
                                    answers[currentQuestion] === i
                                        ? "border-primary bg-primary/5 text-primary"
                                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                )}
                            >
                                <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-slate-100 text-xs font-black mr-3">
                                    {String.fromCharCode(65 + i)}
                                </span>
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                        disabled={currentQuestion === 0}
                        className="flex items-center gap-2 h-12 px-6 rounded-xl border bg-white font-bold text-sm disabled:opacity-50 hover:bg-slate-50 transition-all"
                    >
                        <ArrowLeft className="h-4 w-4" /> Précédent
                    </button>

                    {/* Indicateurs de questions */}
                    <div className="hidden md:flex items-center gap-1.5">
                        {quiz.questions.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentQuestion(i)}
                                className={cn(
                                    "h-8 w-8 rounded-lg text-xs font-black transition-all",
                                    i === currentQuestion ? "bg-primary text-white" :
                                    answers[i] !== null ? "bg-primary/20 text-primary" :
                                    "bg-slate-100 text-slate-400"
                                )}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    {currentQuestion === quiz.questions.length - 1 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex items-center gap-2 h-12 px-8 rounded-xl bg-primary text-white font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {submitting ? "Envoi..." : "Terminer"}
                            <CheckCircle2 className="h-4 w-4" />
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentQuestion(Math.min(quiz.questions.length - 1, currentQuestion + 1))}
                            className="flex items-center gap-2 h-12 px-6 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all"
                        >
                            Suivant <ArrowRight className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Compteur réponses */}
                <p className="text-center mt-6 text-xs font-bold text-muted-foreground">
                    {answeredCount} / {quiz.questions.length} questions répondues
                </p>
            </div>
        </div>
    );
}
