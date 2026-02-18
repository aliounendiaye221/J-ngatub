/**
 * Page /doc/[id]/explain — IA éducative pour un document.
 *
 * 3 onglets :
 * - Explication IA (analyse du document + questions)
 * - Correction IA (soumettre sa réponse pour correction)
 * - Quiz IA (générer un quiz interactif)
 */

"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft, Brain, Send, Loader2, Sparkles,
    BookOpen, FileText, MessageCircle, PenLine, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AICorrection from "@/components/ai/AICorrection";
import AIQuizGenerator from "@/components/ai/AIQuizGenerator";
import AIAssistant from "@/components/ai/AIAssistant";

interface ExplanationResult {
    documentTitle: string;
    level: string;
    subject: string;
    question: string;
    explanation: string;
    isAI: boolean;
}

type Tab = "explain" | "correct" | "quiz" | "assist";

export default function ExplainPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const documentId = params.id as string;

    const tabParam = searchParams.get("tab");
    const [activeTab, setActiveTab] = useState<Tab>(
        tabParam === "correct" ? "correct" : tabParam === "quiz" ? "quiz" : tabParam === "assist" ? "assist" : "explain"
    );
    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [result, setResult] = useState<ExplanationResult | null>(null);
    const [docInfo, setDocInfo] = useState<{ title: string; level: string; subject: string } | null>(null);
    const [history, setHistory] = useState<ExplanationResult[]>([]);

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

    const tabs = [
        { id: "assist" as Tab, label: "Assistant", icon: Sparkles, color: "text-violet-600 bg-violet-100" },
        { id: "explain" as Tab, label: "Expliquer", icon: Brain, color: "text-blue-600 bg-blue-100" },
        { id: "correct" as Tab, label: "Corriger", icon: PenLine, color: "text-orange-600 bg-orange-100" },
        { id: "quiz" as Tab, label: "Quiz IA", icon: Zap, color: "text-purple-600 bg-purple-100" },
    ];

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

                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Brain className="h-7 w-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black">IA Éducative Jàngatub</h1>
                            {docInfo && (
                                <p className="text-sm text-muted-foreground font-medium">
                                    {docInfo.title} • {docInfo.level} • {docInfo.subject}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Onglets */}
                    <div className="flex gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-black transition-all",
                                    activeTab === tab.id
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                )}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8 max-w-4xl">
                {/* ─── Onglet Explication ─── */}
                {activeTab === "explain" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            {result && (
                                <div className="bg-white rounded-[2rem] border p-8 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Sparkles className="h-5 w-5 text-primary" />
                                        <h2 className="font-black text-lg">{result.question}</h2>
                                        {result.isAI && (
                                            <span className="ml-auto px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                                Llama 3.3
                                            </span>
                                        )}
                                    </div>
                                    <div
                                        className="prose prose-slate max-w-none text-sm leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: formatMarkdown(result.explanation) }}
                                    />
                                </div>
                            )}

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
                                            onClick={() => setQuestion(suggestion)}
                                            className="px-3 py-1.5 rounded-full bg-slate-100 text-xs font-bold text-slate-600 hover:bg-primary/10 hover:text-primary transition-all"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

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
                )}

                {/* ─── Onglet Correction ─── */}
                {activeTab === "correct" && (
                    <div className="max-w-2xl mx-auto">
                        <AICorrection documentId={documentId} />
                    </div>
                )}

                {/* ─── Onglet Quiz IA ─── */}
                {activeTab === "quiz" && (
                    <div className="max-w-2xl mx-auto">
                        <AIQuizGenerator documentId={documentId} />
                    </div>
                )}

                {/* ─── Onglet Assistant IA ─── */}
                {activeTab === "assist" && (
                    <div className="max-w-3xl mx-auto">
                        <AIAssistant documentId={documentId} />
                    </div>
                )}
            </div>
        </div>
    );
}

function formatMarkdown(text: string): string {
    return text
        .replace(/## (.*)/g, '<h2 class="text-lg font-black mt-6 mb-3">$1</h2>')
        .replace(/### (.*)/g, '<h3 class="text-base font-bold mt-4 mb-2">$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/^\d+\. (.*)/gm, '<li class="ml-4 mb-1">$1</li>')
        .replace(/^- (.*)/gm, '<li class="ml-4 mb-1 list-disc">$1</li>')
        .replace(/\n\n/g, "<br/><br/>")
        .replace(/\n/g, "<br/>");
}
