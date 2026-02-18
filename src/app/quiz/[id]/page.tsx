"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Clock, ArrowLeft, ArrowRight, CheckCircle2,
    XCircle, Trophy, Star, RotateCcw, Home, Crown, Flame
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
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
                    <p className="text-sm font-bold text-muted-foreground animate-pulse">Chargement de votre épreuve...</p>
                </div>
            </div>
        );
    }

    if (!quiz) return null;

    // ─── Page de résultats ──────────────────────────────────────────
    if (result) {
        return (
            <div className="min-h-screen bg-slate-50/50 pb-24 overflow-hidden relative">
                {result.percentage >= 80 && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {/* Simple confetti markers using CSS or SVGs could go here */}
                        <div className="absolute top-10 left-10 text-4xl animate-bounce">🎉</div>
                        <div className="absolute top-20 right-20 text-4xl animate-bounce delay-100">✨</div>
                        <div className="absolute bottom-1/4 left-1/4 text-4xl animate-bounce delay-200">🏆</div>
                    </div>
                )}

                <div className="container mx-auto px-6 py-12 max-w-3xl relative z-10">
                    {/* Score principal */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center space-y-6 mb-12"
                    >
                        <div className="relative inline-block">
                            <div className={cn(
                                "mx-auto h-40 w-40 rounded-[3rem] flex items-center justify-center shadow-2xl relative z-10",
                                result.percentage >= 80 ? "bg-gradient-to-br from-green-400 to-green-600 text-white shadow-green-500/30" :
                                    result.percentage >= 50 ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-amber-500/30" :
                                        "bg-gradient-to-br from-red-400 to-red-600 text-white shadow-red-500/30"
                            )}>
                                <span className="text-5xl font-black">{result.percentage}%</span>
                            </div>
                            {/* Glow effect */}
                            <div className={cn(
                                "absolute inset-0 blur-3xl opacity-40 rounded-full transform scale-150",
                                result.percentage >= 80 ? "bg-green-500" :
                                    result.percentage >= 50 ? "bg-amber-500" :
                                        "bg-red-500"
                            )} />
                        </div>

                        <div className="space-y-2">
                            <motion.h1
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-4xl font-black tracking-tight"
                            >
                                {result.percentage >= 80 ? "Incroyable ! 🌟" :
                                    result.percentage >= 50 ? "Bien joué ! 👍" : "Courage ! 💪"}
                            </motion.h1>
                            <p className="text-muted-foreground font-medium text-lg">
                                Vous avez obtenu <span className="font-bold text-foreground">{result.score}</span> sur <span className="font-bold text-foreground">{result.totalPoints}</span> points
                            </p>
                        </div>

                        {/* Badge gagné */}
                        {result.badgeEarned && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="inline-flex items-center gap-4 px-6 py-4 rounded-3xl bg-amber-50 border-2 border-amber-100 text-amber-800 shadow-lg shadow-amber-500/10"
                            >
                                <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                                    <Trophy className="h-6 w-6" />
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-sm uppercase tracking-wider text-amber-600">Nouveau Badge !</p>
                                    <p className="font-bold text-lg">{result.badgeEarned.description}</p>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Détail des réponses */}
                    <div className="space-y-6 mb-12">
                        <h2 className="text-2xl font-black flex items-center gap-2">
                            <CheckCircle2 className="h-6 w-6 text-primary" />
                            Correction détaillée
                        </h2>
                        {result.results.map((r, i) => (
                            <motion.div
                                key={r.questionId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * i }}
                                className={cn(
                                    "p-6 rounded-[2rem] border-2 transition-all hover:scale-[1.01]",
                                    r.isCorrect ? "bg-green-50/30 border-green-100 hover:border-green-200" : "bg-red-50/30 border-red-100 hover:border-red-200"
                                )}
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    <div className={cn(
                                        "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                                        r.isCorrect ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                                    )}>
                                        {r.isCorrect ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg text-slate-800">{i + 1}. {r.question}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-12">
                                    {r.options.map((opt: string, j: number) => (
                                        <div key={j} className={cn(
                                            "px-5 py-3 rounded-xl text-sm font-bold transition-colors",
                                            j === r.correctAnswer ? "bg-green-500 text-white shadow-lg shadow-green-500/20" :
                                                j === r.userAnswer && !r.isCorrect ? "bg-red-100 text-red-700 border border-red-200" :
                                                    "bg-white border text-slate-500"
                                        )}>
                                            {opt}
                                            {j === r.correctAnswer && <span className="ml-2">✓</span>}
                                        </div>
                                    ))}
                                </div>
                                {r.explanation && (
                                    <div className="mt-4 ml-12 p-4 bg-primary/5 rounded-2xl text-sm text-primary/80 italic font-medium">
                                        💡 {r.explanation}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t z-50 md:static md:bg-transparent md:border-none md:p-0">
                        <div className="flex flex-col md:flex-row gap-4 justify-center max-w-3xl mx-auto">
                            <button
                                onClick={() => {
                                    setResult(null);
                                    setAnswers(new Array(quiz.questions.length).fill(null));
                                    setCurrentQuestion(0);
                                    setTimeLeft(quiz.duration * 60);
                                }}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 h-14 px-8 rounded-2xl bg-white border-2 border-slate-200 text-slate-700 font-black text-sm hover:bg-slate-50 transition-all"
                            >
                                <RotateCcw className="h-5 w-5" /> Retenter
                            </button>
                            <Link
                                href="/quiz"
                                className="hidden md:flex flex-1 md:flex-none items-center justify-center gap-2 h-14 px-8 rounded-2xl bg-white border-2 border-slate-200 text-slate-700 font-black text-sm hover:bg-slate-50 transition-all"
                            >
                                <Home className="h-5 w-5" /> Accueil
                            </Link>
                            <Link
                                href="/profile/dashboard"
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 h-14 px-8 rounded-2xl bg-primary text-white font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                <Star className="h-5 w-5" /> Voir mon niveau
                            </Link>
                        </div>
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
        <div className="min-h-screen bg-slate-50 relative flex flex-col">
            {/* Header Sticky */}
            <header className="bg-white border-b px-6 py-4 sticky top-0 z-30 shadow-sm">
                <div className="container mx-auto max-w-3xl flex items-center justify-between">
                    <Link
                        href="/quiz"
                        className="p-2 -ml-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
                    >
                        <XCircle className="h-6 w-6" />
                    </Link>

                    <div className="flex flex-col items-center">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Temps restant</span>
                        <div className={cn(
                            "flex items-center gap-2 font-black text-xl tabular-nums",
                            timeLeft < 60 ? "text-red-500 animate-pulse" : "text-slate-800"
                        )}>
                            <Clock className="h-5 w-5" />
                            {formatTime(timeLeft)}
                        </div>
                    </div>

                    <div className="w-10" /> {/* Spacer for centering */}
                </div>
                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-6 py-8 max-w-3xl flex flex-col">
                {/* Question Info */}
                <div className="flex items-center justify-between mb-8 text-xs font-bold text-muted-foreground">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">{quiz.subject.name}</span>
                    <span>Question {currentQuestion + 1} / {quiz.questions.length}</span>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-1 flex flex-col"
                    >
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-8">
                            {question.question}
                        </h2>

                        <div className="space-y-4 flex-1">
                            {question.options.map((option: string, i: number) => (
                                <motion.button
                                    key={i}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => selectAnswer(i)}
                                    className={cn(
                                        "w-full text-left p-6 rounded-2xl border-2 font-bold text-lg transition-all flex items-center justify-between group",
                                        answers[currentQuestion] === i
                                            ? "border-primary bg-primary text-white shadow-xl shadow-primary/20"
                                            : "border-slate-200 bg-white hover:border-primary/50 hover:shadow-lg hover:shadow-slate-200/50 text-slate-700"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className={cn(
                                            "inline-flex items-center justify-center h-8 w-8 rounded-lg text-sm font-black transition-colors",
                                            answers[currentQuestion] === i ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                                        )}>
                                            {String.fromCharCode(65 + i)}
                                        </span>
                                        {option}
                                    </div>
                                    {answers[currentQuestion] === i && (
                                        <CheckCircle2 className="h-6 w-6 text-white" />
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Sticky Bottom Actions */}
            <div className="bg-white border-t p-6 pb-8 md:pb-6">
                <div className="container mx-auto max-w-3xl flex justify-between items-center">
                    <button
                        onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                        disabled={currentQuestion === 0}
                        className="p-4 rounded-xl text-slate-400 hover:bg-slate-50 disabled:opacity-30 transition-all font-bold text-sm"
                    >
                        Précédent
                    </button>

                    {currentQuestion === quiz.questions.length - 1 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                        >
                            {submitting ? "Correction..." : "Valider le quiz"}
                            {!submitting && <Crown className="h-5 w-5 text-amber-500" />}
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentQuestion(Math.min(quiz.questions.length - 1, currentQuestion + 1))}
                            className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                        >
                            Suivant <ArrowRight className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
