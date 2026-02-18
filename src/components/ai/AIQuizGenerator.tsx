"use client";

import { useState } from "react";
import { Loader2, Sparkles, CheckCircle2, XCircle, RotateCcw, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIQuizGeneratorProps {
    documentId: string;
}

interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

interface QuizData {
    title: string;
    questions: QuizQuestion[];
}

export default function AIQuizGenerator({ documentId }: AIQuizGeneratorProps) {
    const [loading, setLoading] = useState(false);
    const [quiz, setQuiz] = useState<QuizData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [numberOfQuestions, setNumberOfQuestions] = useState(5);

    // État du quiz en cours
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
    const [showResult, setShowResult] = useState(false);
    const [showExplanation, setShowExplanation] = useState<number | null>(null);

    const generateQuiz = async () => {
        setLoading(true);
        setError(null);
        setQuiz(null);
        setCurrentQuestion(0);
        setSelectedAnswers([]);
        setShowResult(false);
        setShowExplanation(null);

        try {
            const res = await fetch("/api/ai/generate-quiz", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ documentId, numberOfQuestions }),
            });

            if (res.ok) {
                const data = await res.json();
                setQuiz(data.quiz);
                setSelectedAnswers(new Array(data.quiz.questions.length).fill(null));
            } else {
                const err = await res.json();
                setError(err.error || "Erreur lors de la génération du quiz");
            }
        } catch {
            setError("Erreur de connexion au serveur");
        } finally {
            setLoading(false);
        }
    };

    const selectAnswer = (questionIndex: number, answerIndex: number) => {
        if (showResult) return;
        const newAnswers = [...selectedAnswers];
        newAnswers[questionIndex] = answerIndex;
        setSelectedAnswers(newAnswers);
    };

    const submitQuiz = () => {
        setShowResult(true);
    };

    let score = 0;
    if (quiz) {
        for (let i = 0; i < selectedAnswers.length; i++) {
            if (selectedAnswers[i] === quiz.questions[i]?.correctAnswer) {
                score++;
            }
        }
    }

    const allAnswered = selectedAnswers.every((a) => a !== null);

    // ─── Écran de génération ───────────────────────────────────────
    if (!quiz) {
        return (
            <div className="bg-white rounded-[2rem] border p-8 shadow-sm space-y-6">
                <div className="text-center space-y-3">
                    <div className="h-16 w-16 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 mx-auto">
                        <Sparkles className="h-8 w-8" />
                    </div>
                    <h3 className="font-black text-xl">Quiz IA</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        L&apos;IA génère un quiz personnalisé à partir du <strong>contenu réel</strong> de ce sujet d&apos;examen pour tester vos connaissances.
                    </p>
                </div>

                <div className="flex items-center justify-center gap-4">
                    <label className="text-sm font-bold text-muted-foreground">
                        Nombre de questions :
                    </label>
                    <select
                        value={numberOfQuestions}
                        onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
                        className="h-10 px-3 rounded-xl border text-sm font-bold bg-white"
                        disabled={loading}
                    >
                        {[3, 5, 7, 10, 15].map((n) => (
                            <option key={n} value={n}>
                                {n} questions
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={generateQuiz}
                    disabled={loading}
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Génération en cours...
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-5 w-5" />
                            Générer le quiz
                        </>
                    )}
                </button>

                {error && (
                    <div className="flex items-center gap-2 text-red-600 text-sm font-bold bg-red-50 rounded-xl p-3">
                        <XCircle className="h-4 w-4" />
                        {error}
                    </div>
                )}
            </div>
        );
    }

    // ─── Écran de résultat ─────────────────────────────────────────
    if (showResult) {
        const percentage = Math.round((score / quiz.questions.length) * 100);

        return (
            <div className="space-y-6">
                {/* Score */}
                <div className="bg-white rounded-[2rem] border p-8 shadow-sm text-center space-y-4">
                    <div className={cn(
                        "h-20 w-20 rounded-full flex items-center justify-center mx-auto",
                        percentage >= 70 ? "bg-green-100 text-green-600" :
                            percentage >= 40 ? "bg-yellow-100 text-yellow-600" :
                                "bg-red-100 text-red-600"
                    )}>
                        <Trophy className="h-10 w-10" />
                    </div>
                    <h3 className="font-black text-2xl">
                        {score}/{quiz.questions.length}
                    </h3>
                    <p className="text-sm font-bold text-muted-foreground">
                        {percentage >= 70
                            ? "Excellent ! Vous maîtrisez bien ce sujet ! 🎉"
                            : percentage >= 40
                                ? "Pas mal ! Continuez à réviser pour vous améliorer. 💪"
                                : "Courage ! Révisez les notions abordées et réessayez. 📚"}
                    </p>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                        <div
                            className={cn(
                                "h-3 rounded-full transition-all duration-1000",
                                percentage >= 70 ? "bg-green-500" :
                                    percentage >= 40 ? "bg-yellow-500" :
                                        "bg-red-500"
                            )}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                </div>

                {/* Détails par question */}
                <div className="space-y-4">
                    {quiz.questions.map((q, i) => {
                        const isCorrect = selectedAnswers[i] === q.correctAnswer;
                        return (
                            <div key={i} className="bg-white rounded-2xl border p-6 shadow-sm">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className={cn(
                                        "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                                        isCorrect ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                                    )}>
                                        {isCorrect
                                            ? <CheckCircle2 className="h-4 w-4" />
                                            : <XCircle className="h-4 w-4" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{q.question}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Votre réponse : <span className={cn("font-bold", isCorrect ? "text-green-600" : "text-red-600")}>
                                                {q.options[selectedAnswers[i] ?? 0]}
                                            </span>
                                            {!isCorrect && (
                                                <> — Bonne réponse : <span className="font-bold text-green-600">{q.options[q.correctAnswer]}</span></>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowExplanation(showExplanation === i ? null : i)}
                                    className="text-xs font-bold text-primary hover:underline"
                                >
                                    {showExplanation === i ? "Masquer" : "Voir"} l&apos;explication
                                </button>
                                {showExplanation === i && (
                                    <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 leading-relaxed">
                                        {q.explanation}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Recommencer */}
                <button
                    onClick={() => {
                        setQuiz(null);
                        setShowResult(false);
                    }}
                    className="w-full h-14 rounded-2xl border-2 border-slate-200 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all"
                >
                    <RotateCcw className="h-5 w-5" />
                    Générer un nouveau quiz
                </button>
            </div>
        );
    }

    // ─── Quiz en cours ─────────────────────────────────────────────
    const question = quiz.questions[currentQuestion];

    return (
        <div className="space-y-6">
            {/* Progression */}
            <div className="bg-white rounded-2xl border p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-black text-sm">{quiz.title}</h3>
                    <span className="text-xs font-bold text-muted-foreground">
                        {currentQuestion + 1}/{quiz.questions.length}
                    </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                        className="h-2 rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Question */}
            <div className="bg-white rounded-[2rem] border p-8 shadow-sm space-y-6">
                <p className="font-bold text-lg leading-relaxed">{question.question}</p>

                <div className="space-y-3">
                    {question.options.map((option, i) => (
                        <button
                            key={i}
                            onClick={() => selectAnswer(currentQuestion, i)}
                            className={cn(
                                "w-full text-left p-4 rounded-2xl border-2 text-sm font-medium transition-all",
                                selectedAnswers[currentQuestion] === i
                                    ? "border-primary bg-primary/5 text-primary font-bold"
                                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                            )}
                        >
                            <span className="inline-flex items-center gap-3">
                                <span className={cn(
                                    "h-8 w-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0",
                                    selectedAnswers[currentQuestion] === i
                                        ? "bg-primary text-white"
                                        : "bg-slate-100"
                                )}>
                                    {String.fromCharCode(65 + i)}
                                </span>
                                {option}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
                {currentQuestion > 0 && (
                    <button
                        onClick={() => setCurrentQuestion(currentQuestion - 1)}
                        className="flex-1 h-14 rounded-2xl border-2 border-slate-200 font-black text-sm hover:bg-slate-50 transition-all"
                    >
                        Précédent
                    </button>
                )}

                {currentQuestion < quiz.questions.length - 1 ? (
                    <button
                        onClick={() => setCurrentQuestion(currentQuestion + 1)}
                        disabled={selectedAnswers[currentQuestion] === null}
                        className="flex-1 h-14 rounded-2xl bg-primary text-white font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        Suivant
                    </button>
                ) : (
                    <button
                        onClick={submitQuiz}
                        disabled={!allAnswered}
                        className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-green-500/20 disabled:opacity-50"
                    >
                        Terminer le quiz
                    </button>
                )}
            </div>

            {/* Indicateurs de questions */}
            <div className="flex justify-center gap-2 flex-wrap">
                {quiz.questions.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentQuestion(i)}
                        className={cn(
                            "h-8 w-8 rounded-full text-xs font-black transition-all",
                            currentQuestion === i
                                ? "bg-primary text-white scale-110"
                                : selectedAnswers[i] !== null
                                    ? "bg-primary/20 text-primary"
                                    : "bg-slate-100 text-slate-400"
                        )}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        </div>
    );
}
