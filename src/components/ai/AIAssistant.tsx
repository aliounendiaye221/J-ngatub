"use client";

import { useState } from "react";
import {
    Send, Loader2, Sparkles, FileText, BookOpen, Calculator,
    Route, Wand2, ChevronDown, ChevronUp, Copy, Check,
    AlertCircle, Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AIAssistantProps {
    documentId: string;
}

type AssistAction = "transcribe" | "explain_exercise" | "formulas" | "methodology" | "full_assist";

interface ActionConfig {
    id: AssistAction;
    label: string;
    shortLabel: string;
    description: string;
    icon: typeof FileText;
    color: string;
    bgColor: string;
    gradient: string;
}

const ACTIONS: ActionConfig[] = [
    {
        id: "full_assist",
        label: "Assistance complète",
        shortLabel: "Tout-en-un",
        description: "Transcription + Explication + Formules + Démarche en une seule réponse",
        icon: Wand2,
        color: "text-violet-600",
        bgColor: "bg-violet-50",
        gradient: "from-violet-500 to-purple-600",
    },
    {
        id: "transcribe",
        label: "Recopier le sujet lisiblement",
        shortLabel: "Transcription",
        description: "L'IA reformule et structure le sujet pour le rendre clair et lisible",
        icon: FileText,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        gradient: "from-blue-500 to-cyan-500",
    },
    {
        id: "explain_exercise",
        label: "Expliquer l'exercice",
        shortLabel: "Explication",
        description: "Comprendre ce qu'on demande, les concepts nécessaires et les pièges",
        icon: BookOpen,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        gradient: "from-emerald-500 to-green-500",
    },
    {
        id: "formulas",
        label: "Formules & Théorèmes",
        shortLabel: "Formules",
        description: "Toutes les formules, théorèmes et propriétés nécessaires",
        icon: Calculator,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        gradient: "from-orange-500 to-amber-500",
    },
    {
        id: "methodology",
        label: "Démarche de résolution",
        shortLabel: "Méthode",
        description: "Plan étape par étape pour résoudre l'exercice",
        icon: Route,
        color: "text-pink-600",
        bgColor: "bg-pink-50",
        gradient: "from-pink-500 to-rose-500",
    },
];

export default function AIAssistant({ documentId }: AIAssistantProps) {
    const [selectedAction, setSelectedAction] = useState<AssistAction>("full_assist");
    const [exerciseText, setExerciseText] = useState("");
    const [exerciseNumber, setExerciseNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [isAI, setIsAI] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [history, setHistory] = useState<{ action: AssistAction; result: string; isAI: boolean }[]>([]);

    const currentAction = ACTIONS.find((a) => a.id === selectedAction) || ACTIONS[0];

    const handleSubmit = async () => {
        if (loading) return;
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch("/api/ai/assist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    documentId,
                    action: selectedAction,
                    exerciseText: exerciseText.trim() || undefined,
                    exerciseNumber: exerciseNumber.trim() || undefined,
                }),
            });

            const data = await res.json();

            if (res.ok || data.result) {
                setResult(data.result);
                setIsAI(data.isAI ?? false);
                setHistory((prev) => [
                    { action: selectedAction, result: data.result, isAI: data.isAI ?? false },
                    ...prev,
                ]);
            } else {
                setError(data.error || "Erreur lors de l'analyse");
            }
        } catch {
            setError("Erreur de connexion au serveur");
        } finally {
            setLoading(false);
        }
    };

    const copyResult = async () => {
        if (!result) return;
        try {
            await navigator.clipboard.writeText(result);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
        }
    };

    return (
        <div className="space-y-6">
            {/* Action Selector */}
            <div className="bg-white rounded-[2rem] border p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-3">
                    <div className={cn("p-2.5 rounded-xl", currentAction.bgColor, currentAction.color)}>
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-black text-base">Assistant IA Jàngatub</h3>
                        <p className="text-xs text-muted-foreground">
                            Choisissez le type d&apos;aide dont vous avez besoin
                        </p>
                    </div>
                </div>

                {/* Action Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ACTIONS.map((action) => {
                        const Icon = action.icon;
                        const isSelected = selectedAction === action.id;
                        return (
                            <button
                                key={action.id}
                                onClick={() => setSelectedAction(action.id)}
                                disabled={loading}
                                className={cn(
                                    "flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all hover:scale-[1.01]",
                                    isSelected
                                        ? `border-current ${action.color} bg-gradient-to-br ${action.bgColor} shadow-md`
                                        : "border-transparent bg-slate-50 text-slate-500 hover:bg-slate-100"
                                )}
                            >
                                <div className={cn(
                                    "p-2 rounded-xl shrink-0",
                                    isSelected ? `${action.bgColor} ${action.color}` : "bg-slate-200 text-slate-400"
                                )}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className={cn(
                                        "font-bold text-sm",
                                        isSelected ? "text-slate-900" : "text-slate-600"
                                    )}>
                                        {action.label}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                                        {action.description}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Exercise Input */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-amber-500" />
                            <span className="text-xs font-bold text-slate-600">
                                Collez le texte de l&apos;exercice pour une aide plus précise
                            </span>
                        </div>
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="text-xs font-bold text-primary flex items-center gap-1"
                        >
                            {showAdvanced ? "Masquer" : "Options"}
                            {showAdvanced ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>
                    </div>

                    <textarea
                        value={exerciseText}
                        onChange={(e) => setExerciseText(e.target.value)}
                        placeholder="Copiez/collez ici le texte de l'exercice ou du sujet pour une analyse précise... (Optionnel : sans texte, l'IA donne des conseils généraux)"
                        rows={5}
                        className="w-full px-4 py-3 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none placeholder:text-slate-400"
                        disabled={loading}
                    />
                    <p className="text-[11px] text-muted-foreground">
                        {exerciseText.length}/5000 caractères • Plus vous donnez de détails, meilleure sera l&apos;aide
                    </p>

                    {showAdvanced && (
                        <div className="p-4 rounded-xl bg-slate-50 border space-y-3 animate-in slide-in-from-top-2 duration-200">
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                                    Numéro de l&apos;exercice (optionnel)
                                </label>
                                <input
                                    type="text"
                                    value={exerciseNumber}
                                    onChange={(e) => setExerciseNumber(e.target.value)}
                                    placeholder="Ex: Exercice 2, Question 3a, Partie B..."
                                    className="w-full h-10 px-4 rounded-lg border bg-white text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={cn(
                        "w-full h-14 rounded-2xl text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3",
                        "hover:scale-[1.02] active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:hover:scale-100",
                        `bg-gradient-to-r ${currentAction.gradient} shadow-${currentAction.color.split("-")[1]}-500/20`
                    )}
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            L&apos;IA analyse...
                        </>
                    ) : (
                        <>
                            <currentAction.icon className="h-5 w-5" />
                            {currentAction.shortLabel}
                        </>
                    )}
                </button>

                {error && (
                    <div className="flex items-center gap-2 text-red-600 text-sm font-bold bg-red-50 rounded-xl p-3">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                    </div>
                )}
            </div>

            {/* Result */}
            {result && (
                <div className="bg-white rounded-[2rem] border p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-xl", currentAction.bgColor, currentAction.color)}>
                                <currentAction.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="font-black text-lg">{currentAction.label}</h2>
                                <p className="text-xs text-muted-foreground">
                                    {exerciseNumber || "Analyse générale"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {isAI && (
                                <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest border border-green-100">
                                    Llama 3.3
                                </span>
                            )}
                            <button
                                onClick={copyResult}
                                className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                                title="Copier"
                            >
                                {copied ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div
                        className="prose prose-slate max-w-none text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatMarkdown(result) }}
                    />
                </div>
            )}

            {/* History */}
            {history.length > 1 && (
                <div className="bg-white rounded-[2rem] border p-6 shadow-sm">
                    <h3 className="font-black text-sm mb-4 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Historique des analyses
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {history.map((h, i) => {
                            const actionConfig = ACTIONS.find((a) => a.id === h.action) || ACTIONS[0];
                            const Icon = actionConfig.icon;
                            return (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setResult(h.result);
                                        setIsAI(h.isAI);
                                        setSelectedAction(h.action);
                                    }}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                                        result === h.result
                                            ? `${actionConfig.bgColor} border border-current ${actionConfig.color}`
                                            : "bg-slate-50 hover:bg-slate-100"
                                    )}
                                >
                                    <div className={cn("p-1.5 rounded-lg", actionConfig.bgColor, actionConfig.color)}>
                                        <Icon className="h-3 w-3" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-700 truncate">
                                            {actionConfig.label}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {h.isAI ? "IA" : "Fallback"}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

function formatMarkdown(text: string): string {
    return text
        .replace(/## (.*)/g, '<h2 class="text-lg font-black mt-6 mb-3 text-slate-900">$1</h2>')
        .replace(/### (.*)/g, '<h3 class="text-base font-bold mt-4 mb-2 text-indigo-600">$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 text-sm font-mono text-pink-600">$1</code>')
        .replace(/^\d+\. (.*)/gm, '<li class="ml-4 mb-1.5 list-decimal">$1</li>')
        .replace(/^- (.*)/gm, '<li class="ml-4 mb-1 list-disc marker:text-indigo-500">$1</li>')
        .replace(/\n\n/g, "<br/><br/>")
        .replace(/\n/g, "<br/>");
}
