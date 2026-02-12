/**
 * Page admin /admin/quiz — Gestion des quiz.
 * 
 * Permet à l'administrateur de voir, créer et gérer les quiz.
 * Formulaire de création avec questions dynamiques.
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft, Plus, Brain, Trash2, CheckCircle2,
    Loader2, ChevronDown, ChevronUp, GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Quiz {
    id: string;
    title: string;
    description: string | null;
    duration: number;
    level: { name: string };
    subject: { name: string };
    _count?: { questions: number };
    createdAt: string;
}

interface QuestionForm {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    points: number;
}

const emptyQuestion = (): QuestionForm => ({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: "",
    points: 1,
});

export default function AdminQuizPage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [levels, setLevels] = useState<{ id: string; name: string }[]>([]);
    const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Formulaire de création
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [duration, setDuration] = useState(30);
    const [levelId, setLevelId] = useState("");
    const [subjectId, setSubjectId] = useState("");
    const [questions, setQuestions] = useState<QuestionForm[]>([emptyQuestion()]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [quizRes, levelsRes, subjectsRes] = await Promise.all([
                fetch("/api/quiz"),
                fetch("/api/admin/documents?meta=levels"),
                fetch("/api/admin/documents?meta=subjects"),
            ]);

            if (quizRes.ok) {
                const data = await quizRes.json();
                setQuizzes(data.quizzes || []);
            }

            if (levelsRes.ok) {
                const data = await levelsRes.json();
                setLevels(data);
            }

            if (subjectsRes.ok) {
                const data = await subjectsRes.json();
                setSubjects(data);
            }
        } catch (error) {
            console.error("Erreur:", error);
        } finally {
            setLoading(false);
        }
    };

    /** Ajouter une question au formulaire */
    const addQuestion = () => {
        setQuestions([...questions, emptyQuestion()]);
    };

    /** Supprimer une question */
    const removeQuestion = (index: number) => {
        if (questions.length <= 1) return;
        setQuestions(questions.filter((_, i) => i !== index));
    };

    /** Mettre à jour une question */
    const updateQuestion = (index: number, field: string, value: any) => {
        const updated = [...questions];
        (updated[index] as any)[field] = value;
        setQuestions(updated);
    };

    /** Mettre à jour une option d'une question */
    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const updated = [...questions];
        updated[qIndex].options[oIndex] = value;
        setQuestions(updated);
    };

    /** Soumettre le quiz */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !levelId || !subjectId || questions.length === 0) return;

        setSubmitting(true);
        try {
            const res = await fetch("/api/quiz", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description: description || undefined,
                    duration,
                    levelId,
                    subjectId,
                    questions: questions.map((q) => ({
                        question: q.question,
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                        explanation: q.explanation || undefined,
                        points: q.points,
                    })),
                }),
            });

            if (res.ok) {
                // Réinitialiser le formulaire
                setTitle("");
                setDescription("");
                setDuration(30);
                setLevelId("");
                setSubjectId("");
                setQuestions([emptyQuestion()]);
                setShowForm(false);
                await loadData();
            } else {
                const err = await res.json();
                alert(err.error || "Erreur lors de la création");
            }
        } catch (error) {
            console.error("Erreur:", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pb-24">
            {/* En-tête */}
            <div className="bg-white border-b mb-12">
                <div className="container mx-auto px-6 py-12">
                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-6"
                    >
                        <ArrowLeft className="h-4 w-4" /> Console Admin
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black tracking-tight">
                                Gestion des <span className="text-primary">Quiz</span>
                            </h1>
                            <p className="text-muted-foreground">{quizzes.length} quiz créés</p>
                        </div>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="h-14 px-8 rounded-2xl bg-primary text-white font-black text-sm uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                        >
                            <Plus className="h-5 w-5" /> Nouveau Quiz
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 max-w-5xl space-y-12">
                {/* Formulaire de création */}
                {showForm && (
                    <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] border p-8 space-y-8">
                        <h2 className="text-xl font-black">Créer un quiz</h2>

                        {/* Infos générales */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-bold">Titre du quiz</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Ex: Mathématiques BFEM 2023"
                                    className="w-full h-12 px-4 rounded-xl border bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    required
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-bold">Description (optionnelle)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Description du quiz..."
                                    rows={2}
                                    className="w-full px-4 py-3 rounded-xl border bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Niveau</label>
                                <select
                                    value={levelId}
                                    onChange={(e) => setLevelId(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl border bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    required
                                >
                                    <option value="">Sélectionner un niveau</option>
                                    {levels.map((l) => (
                                        <option key={l.id} value={l.id}>{l.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Matière</label>
                                <select
                                    value={subjectId}
                                    onChange={(e) => setSubjectId(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl border bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    required
                                >
                                    <option value="">Sélectionner une matière</option>
                                    {subjects.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Durée (minutes)</label>
                                <input
                                    type="number"
                                    value={duration}
                                    onChange={(e) => setDuration(Number(e.target.value))}
                                    min={5}
                                    max={180}
                                    className="w-full h-12 px-4 rounded-xl border bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>
                        </div>

                        {/* Questions */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-black">Questions ({questions.length})</h3>
                                <button
                                    type="button"
                                    onClick={addQuestion}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20 transition-all"
                                >
                                    <Plus className="h-4 w-4" /> Ajouter
                                </button>
                            </div>

                            {questions.map((q, qIndex) => (
                                <div key={qIndex} className="p-6 rounded-2xl border bg-slate-50 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-black text-primary">Question {qIndex + 1}</span>
                                        {questions.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeQuestion(qIndex)}
                                                className="p-1 rounded-lg hover:bg-red-100 text-red-500 transition-all"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Énoncé */}
                                    <input
                                        type="text"
                                        value={q.question}
                                        onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                                        placeholder="Énoncé de la question"
                                        className="w-full h-12 px-4 rounded-xl border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        required
                                    />

                                    {/* 4 options */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {q.options.map((opt, oIndex) => (
                                            <div key={oIndex} className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuestion(qIndex, "correctAnswer", oIndex)}
                                                    className={cn(
                                                        "h-8 w-8 rounded-lg border flex-shrink-0 flex items-center justify-center text-xs font-black transition-all",
                                                        q.correctAnswer === oIndex
                                                            ? "bg-green-500 text-white border-green-500"
                                                            : "bg-white text-muted-foreground hover:border-green-300"
                                                    )}
                                                    title="Marquer comme bonne réponse"
                                                >
                                                    {String.fromCharCode(65 + oIndex)}
                                                </button>
                                                <input
                                                    type="text"
                                                    value={opt}
                                                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                    placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                                    className="flex-1 h-10 px-3 rounded-lg border bg-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                    required
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Explication + points */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                        <input
                                            type="text"
                                            value={q.explanation}
                                            onChange={(e) => updateQuestion(qIndex, "explanation", e.target.value)}
                                            placeholder="Explication (optionnelle)"
                                            className="md:col-span-3 h-10 px-3 rounded-lg border bg-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        />
                                        <input
                                            type="number"
                                            value={q.points}
                                            onChange={(e) => updateQuestion(qIndex, "points", Number(e.target.value))}
                                            min={1}
                                            max={10}
                                            placeholder="Points"
                                            className="h-10 px-3 rounded-lg border bg-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="flex-1 h-12 rounded-xl border font-bold text-sm hover:bg-slate-50 transition-all"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 h-12 rounded-xl bg-primary text-white font-black text-sm hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {submitting ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Création...</>
                                ) : (
                                    <><CheckCircle2 className="h-4 w-4" /> Créer le quiz</>
                                )}
                            </button>
                        </div>
                    </form>
                )}

                {/* Liste des quiz existants */}
                <section className="space-y-4">
                    <h2 className="text-xl font-black">Quiz existants</h2>
                    {quizzes.length === 0 ? (
                        <div className="bg-white rounded-[2rem] border p-12 text-center">
                            <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="font-bold text-lg">Aucun quiz</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Créez votre premier quiz en cliquant sur &quot;Nouveau Quiz&quot;.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {quizzes.map((quiz) => (
                                <div key={quiz.id} className="bg-white p-6 rounded-[2rem] border shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                            <Brain className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="font-black">{quiz.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {quiz.duration} min • {new Date(quiz.createdAt).toLocaleDateString("fr-FR")}
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/quiz/${quiz.id}`}
                                        className="px-4 py-2 rounded-xl bg-slate-50 text-sm font-bold text-primary hover:bg-primary/10 transition-all"
                                    >
                                        Voir
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
