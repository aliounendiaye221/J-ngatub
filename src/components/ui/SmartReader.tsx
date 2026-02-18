"use client";

import { useState, useEffect } from "react";
import { Maximize2, Minimize2, ZoomIn, ZoomOut, Moon, Sun, BookOpen, PenTool, LayoutTemplate, Smartphone, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SmartReaderProps {
    documentId: string;
    pdfUrl: string;
    title: string;
    initialMode?: "smart" | "classic";
}

export default function SmartReader({ documentId, pdfUrl, title, initialMode = "smart" }: SmartReaderProps) {
    const [mode, setMode] = useState<"smart" | "classic">(initialMode);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [zoom, setZoom] = useState(100);

    // AI Analysis State
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [loadingAnalysis, setLoadingAnalysis] = useState(false);

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullScreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullScreen(false);
            }
        }
    };

    // Load AI analysis when switching to Smart Mode
    useEffect(() => {
        if (mode === "smart" && !analysis && !loadingAnalysis) {
            setLoadingAnalysis(true);
            fetch("/api/ai/explain", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ documentId }), // No question = General Analysis
            })
                .then(res => res.json())
                .then(data => {
                    if (data.explanation) setAnalysis(data.explanation);
                })
                .catch(err => console.error(err))
                .finally(() => setLoadingAnalysis(false));
        }
    }, [mode, documentId, analysis, loadingAnalysis]);

    return (
        <div className={cn(
            "flex flex-col h-[85vh] overflow-hidden rounded-[2.5rem] transition-all bg-white shadow-2xl shadow-primary/5",
            isFullScreen ? "fixed inset-0 z-50 rounded-none h-screen" : "relative border-8 border-white",
            darkMode ? "bg-slate-900 border-slate-900" : "bg-white"
        )}>
            {/* Toolbar */}
            <div className={cn(
                "flex items-center justify-between px-6 py-4 border-b transition-colors",
                darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-100"
            )}>
                {/* Tabs / Mode Switcher */}
                <div className="flex bg-slate-100 p-1 rounded-xl dark:bg-slate-800">
                    <button
                        onClick={() => setMode("smart")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                            mode === "smart"
                                ? "bg-white text-indigo-600 shadow-sm dark:bg-indigo-600 dark:text-white"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Smartphone className="h-4 w-4" />
                        Smart View
                        <span className="ml-1 px-1.5 py-0.5 rounded-[4px] bg-indigo-100 text-[8px] text-indigo-700 font-bold dark:bg-white/20 dark:text-white">IA</span>
                    </button>
                    <button
                        onClick={() => setMode("classic")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                            mode === "classic"
                                ? "bg-white text-indigo-600 shadow-sm dark:bg-indigo-600 dark:text-white"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <BookOpen className="h-4 w-4" />
                        Original (PDF)
                    </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-muted-foreground"
                        title="Mode Nuit"
                    >
                        {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2" />
                    {mode === 'classic' && (
                        <>
                            <button
                                onClick={() => setZoom(Math.max(50, zoom - 10))}
                                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-muted-foreground"
                            >
                                <ZoomOut className="h-5 w-5" />
                            </button>
                            <span className="text-xs font-bold w-12 text-center text-muted-foreground">{zoom}%</span>
                            <button
                                onClick={() => setZoom(Math.min(200, zoom + 10))}
                                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-muted-foreground"
                            >
                                <ZoomIn className="h-5 w-5" />
                            </button>
                            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2" />
                        </>
                    )}
                    <button
                        onClick={toggleFullScreen}
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-muted-foreground"
                    >
                        {isFullScreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 relative overflow-auto bg-slate-50 dark:bg-black/50">
                <AnimatePresence mode="wait">
                    {mode === "smart" ? (
                        <motion.div
                            key="smart"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="h-full max-w-4xl mx-auto p-8"
                        >
                            {loadingAnalysis ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-6">
                                    <div className="h-20 w-20 rounded-full bg-indigo-50 flex items-center justify-center relative">
                                        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                                        <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-pulse"></div>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-black text-lg text-slate-800 dark:text-white">Analyse IA en cours...</p>
                                        <p className="text-muted-foreground text-sm">Notre IA lit le document pour vous proposer une synthèse.</p>
                                    </div>
                                </div>
                            ) : analysis ? (
                                <div className={cn(
                                    "prose prose-lg max-w-none pb-20",
                                    darkMode ? "prose-invert" : ""
                                )}>
                                    <div className="flex items-center gap-3 mb-8 pb-8 border-b dark:border-white/10">
                                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                                            <Sparkles className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black m-0 mb-1 tracking-tight">Analyse Intelligente</h2>
                                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest m-0">Généré par Groq Llama 3</p>
                                        </div>
                                    </div>

                                    <div dangerouslySetInnerHTML={{ __html: formatMarkdown(analysis) }} />

                                    <div className="mt-12 p-6 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
                                        <h4 className="flex items-center gap-2 font-black text-indigo-900 dark:text-indigo-300 m-0 mb-4">
                                            <PenTool className="h-5 w-5" />
                                            Besoin de plus d&apos;aide ?
                                        </h4>
                                        <p className="text-sm text-indigo-700 dark:text-indigo-400 m-0">
                                            L&apos;assistant complet (Pose de questions, Quiz, Correction) est disponible dans le module dédié.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
                                    <div className="h-24 w-24 rounded-3xl bg-red-50 text-red-500 flex items-center justify-center mb-6">
                                        <LayoutTemplate className="h-10 w-10" />
                                    </div>
                                    <h3 className="text-xl font-black mb-2">Analyse impossible</h3>
                                    <p className="text-muted-foreground">L&apos;IA n&apos;a pas pu analyser ce document pour le moment. Veuillez réessayer plus tard.</p>
                                    <button
                                        onClick={() => setMode("classic")}
                                        className="mt-6 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm"
                                    >
                                        Retour au PDF
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="classic"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full w-full flex items-center justify-center bg-slate-200/50 dark:bg-slate-900"
                        >
                            {/* PDF Wrapper simulating better controls */}
                            <div
                                className="h-full w-full transition-transform duration-200 ease-out"
                                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                            >
                                <iframe
                                    src={`${pdfUrl}#toolbar=0&view=FitH`}
                                    className="h-full w-full border-0 shadow-2xl"
                                    title={title}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function formatMarkdown(text: string): string {
    return text
        .replace(/## (.*)/g, '<h2 class="text-2xl font-black mt-8 mb-4 lg:text-3xl tracking-tight">$1</h2>')
        .replace(/### (.*)/g, '<h3 class="text-lg font-bold mt-6 mb-3 text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, "<strong class='text-slate-900 dark:text-white'>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/^\d+\. (.*)/gm, '<div class="flex gap-4 mb-3"><span class="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">●</span><span>$1</span></div>')
        .replace(/^- (.*)/gm, '<li class="ml-4 mb-2 list-disc marker:text-indigo-500">$1</li>')
        .replace(/\n\n/g, "<br/>")
        .replace(/\n/g, "<br/>");
}
