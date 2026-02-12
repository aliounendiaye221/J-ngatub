/**
 * Page /doc/[id]/explain — Explications IA pour un document.
 * 
 * Permet aux membres premium de demander des explications
 * détaillées sur un sujet ou corrigé via l'IA.
 */

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft, Brain, Send, Loader2, Sparkles,
    BookOpen, FileText, MessageCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExplanationResult {
    documentTitle: string;
    level: string;
    subject: string;
    question: string;
    explanation: string;
    isAI: boolean;
}

export default function ExplainPage() {
    const params = useParams();
    const documentId = params.id as string;

    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [result, setResult] = useState<ExplanationResult | null>(null);
    const [docInfo, setDocInfo] = useState<{ title: string; level: string; subject: string } | null>(null);
    const [history, setHistory] = useState<ExplanationResult[]>([]);

    // Charger l'explication générale au chargement
    useEffect(() => {
        async function loadInitial() {
            try {
                const res = await fetch("/api/ai/explain", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ documentId }),
                });

                if (res.ok) {
                    const data = await res.json();
                    setResult(data);
                    setDocInfo({ title: data.documentTitle, level: data.level, subject: data.subject });
                    setHistory([data]);
                }
            } catch (error) {
                console.error("Erreur:", error);
            } finally {
                setInitialLoading(false);
            }
        }
        loadInitial();
    }, [documentId]);

    /** Poser une question spécifique */
    const askQuestion = async () => {
        if (!question.trim() || loading) return;
        setLoading(true);

        try {
            const res = await fetch("/api/ai/explain", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ documentId, question }),
            });

            if (res.ok) {
                const data = await res.json();
                setResult(data);
                setHistory((prev) => [...prev, data]);
                setQuestion("");
            }
        } catch (error) {
            console.error("Erreur:", error);
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                    <p className="text-sm font-bold text-muted-foreground">L&apos;IA analyse le document...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pb-24">
            {/* En-tête */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-6 py-8">
                    <Link
                        href={`/doc/${documentId}`}
                        className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" /> Retour au document
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Brain className="h-7 w-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black">Explication IA</h1>
                            {docInfo && (
                                <p className="text-sm text-muted-foreground font-medium">
                                    {docInfo.title} • {docInfo.level} • {docInfo.subject}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8 max-w-4xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contenu principal */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Explication affichée */}
                        {result && (
                            <div className="bg-white rounded-[2rem] border p-8 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                    <h2 className="font-black text-lg">{result.question}</h2>
                                </div>
                                <div
                                    className="prose prose-slate max-w-none text-sm leading-relaxed"
                                    dangerouslySetInnerHTML={{
                                        __html: formatMarkdown(result.explanation),
                                    }}
                                />
                                {!result.isAI && (
                                    <p className="mt-6 text-xs text-muted-foreground italic border-t pt-4">
                                        💡 Explication générée automatiquement. Connectez une clé OpenAI pour des réponses IA personnalisées.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Zone de question */}
                        <div className="bg-white rounded-[2rem] border p-6 shadow-sm">
                            <h3 className="font-black text-sm mb-4 flex items-center gap-2">
                                <MessageCircle className="h-4 w-4 text-primary" />
                                Posez votre question
                            </h3>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && askQuestion()}
                                    placeholder="Ex: Comment résoudre l'exercice 3 ?"
                                    className="flex-1 h-12 px-4 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    disabled={loading}
                                />
                                <button
                                    onClick={askQuestion}
                                    disabled={loading || !question.trim()}
                                    className="h-12 px-6 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {loading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4">
                                {[
                                    "Explique la méthodologie",
                                    "Quelles sont les erreurs fréquentes ?",
                                    "Comment réviser efficacement ?",
                                ].map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        onClick={() => {
                                            setQuestion(suggestion);
                                        }}
                                        className="px-3 py-1.5 rounded-full bg-slate-100 text-xs font-bold text-slate-600 hover:bg-primary/10 hover:text-primary transition-all"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar : historique */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-[2rem] border p-6 shadow-sm">
                            <h3 className="font-black text-sm mb-4">Historique</h3>
                            <div className="space-y-3">
                                {history.map((h, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setResult(h)}
                                        className={cn(
                                            "w-full text-left p-3 rounded-xl text-xs font-medium transition-all",
                                            result === h
                                                ? "bg-primary/10 text-primary border border-primary/20"
                                                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                                        )}
                                    >
                                        <p className="line-clamp-2">{h.question}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Link
                            href={`/doc/${documentId}`}
                            className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 text-white font-bold text-sm hover:scale-[1.02] transition-all"
                        >
                            <FileText className="h-5 w-5" />
                            Voir le PDF
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Convertit le markdown basique en HTML pour l'affichage.
 */
function formatMarkdown(text: string): string {
    return text
        .replace(/## (.*)/g, '<h2 class="text-lg font-black mt-6 mb-3">$1</h2>')
        .replace(/### (.*)/g, '<h3 class="text-base font-bold mt-4 mb-2">$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^\d+\. (.*)/gm, '<li class="ml-4 mb-1">$1</li>')
        .replace(/^- (.*)/gm, '<li class="ml-4 mb-1 list-disc">$1</li>')
        .replace(/\n\n/g, '<br/><br/>')
        .replace(/\n/g, '<br/>');
}
