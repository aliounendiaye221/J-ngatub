"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2, XCircle, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";

interface AICorrectionProps {
    documentId: string;
}

export default function AICorrection({ documentId }: AICorrectionProps) {
    const [exerciseNumber, setExerciseNumber] = useState("");
    const [studentAnswer, setStudentAnswer] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [isAI, setIsAI] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!exerciseNumber.trim() || !studentAnswer.trim() || loading) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch("/api/ai/correct", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ documentId, exerciseNumber, studentAnswer }),
            });

            if (res.ok) {
                const data = await res.json();
                setResult(data.correction);
                setIsAI(data.isAI);
            } else {
                const err = await res.json();
                setError(err.error || "Erreur lors de la correction");
            }
        } catch {
            setError("Erreur de connexion au serveur");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Formulaire */}
            <div className="bg-white rounded-[2rem] border p-6 shadow-sm space-y-4">
                <h3 className="font-black text-sm flex items-center gap-2">
                    <PenLine className="h-4 w-4 text-primary" />
                    Soumettre votre réponse
                </h3>

                <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                        Numéro de l&apos;exercice / question
                    </label>
                    <input
                        type="text"
                        value={exerciseNumber}
                        onChange={(e) => setExerciseNumber(e.target.value)}
                        placeholder="Ex: Exercice 2, Question 3a..."
                        className="w-full h-12 px-4 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        disabled={loading}
                    />
                </div>

                <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                        Votre réponse
                    </label>
                    <textarea
                        value={studentAnswer}
                        onChange={(e) => setStudentAnswer(e.target.value)}
                        placeholder="Tapez votre réponse ici... Détaillez vos calculs et raisonnements."
                        rows={8}
                        className="w-full px-4 py-3 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                        disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        {studentAnswer.length}/5000 caractères
                    </p>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading || !exerciseNumber.trim() || studentAnswer.length < 5}
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:hover:scale-100"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            L&apos;IA corrige...
                        </>
                    ) : (
                        <>
                            <Send className="h-5 w-5" />
                            Corriger ma réponse
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

            {/* Résultat de la correction */}
            {result && (
                <div className="bg-white rounded-[2rem] border p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <h2 className="font-black text-lg">Correction IA</h2>
                        {isAI && (
                            <span className="ml-auto px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest border border-green-100">
                                Llama 3.3
                            </span>
                        )}
                    </div>
                    <div
                        className="prose prose-slate max-w-none text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatMarkdown(result) }}
                    />
                </div>
            )}
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
