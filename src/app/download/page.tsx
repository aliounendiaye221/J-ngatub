/**
 * Page /download — Packs de téléchargement groupé.
 * 
 * Permet aux membres premium de télécharger tous les PDF
 * d'un niveau / matière / année en un clic.
 * Protégé par middleware premium.
 */

"use client";

import { useState } from "react";
import { Download, FileText, Sparkles, FolderDown, ArrowRight, BookOpen, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PackDocument {
    id: string;
    title: string;
    type: string;
    year: number;
    subject: string;
    pdfUrl: string;
}

interface Pack {
    packName: string;
    totalDocuments: number;
    documents: PackDocument[];
}

export default function DownloadPage() {
    const [levelSlug, setLevelSlug] = useState("bfem");
    const [subjectSlug, setSubjectSlug] = useState("");
    const [year, setYear] = useState("");
    const [pack, setPack] = useState<Pack | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    /** Charger le pack depuis l'API */
    const loadPack = async () => {
        setLoading(true);
        setError("");
        setPack(null);

        try {
            const body: any = { levelSlug };
            if (subjectSlug) body.subjectSlug = subjectSlug;
            if (year) body.year = parseInt(year);

            const res = await fetch("/api/download/pack", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                const data = await res.json();
                setPack(data);
            } else {
                const data = await res.json();
                setError(data.error || "Erreur lors du chargement");
            }
        } catch {
            setError("Erreur de connexion");
        } finally {
            setLoading(false);
        }
    };

    /** Ouvrir un PDF dans un nouvel onglet */
    const downloadFile = (url: string) => {
        window.open(url, "_blank");
    };

    /** Télécharger tous les fichiers du pack un par un */
    const downloadAll = () => {
        if (!pack) return;
        pack.documents.forEach((doc, i) => {
            setTimeout(() => downloadFile(doc.pdfUrl), i * 500);
        });
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-24">
            {/* En-tête */}
            <div className="bg-white border-b mb-12">
                <div className="container mx-auto px-6 py-16">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="space-y-4 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/10">
                                <Sparkles className="h-4 w-4" />
                                <span>Premium</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                                Packs <span className="premium-gradient-text">Téléchargement</span>
                            </h1>
                            <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                                Téléchargez tous les sujets et corrigés d&apos;un niveau en un clic.
                            </p>
                        </div>
                        <div className="h-32 w-32 rounded-[2.5rem] bg-primary/5 flex items-center justify-center text-primary">
                            <FolderDown className="h-16 w-16" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 max-w-4xl space-y-12">
                {/* Sélection du pack */}
                <div className="bg-white rounded-[2rem] border p-8 shadow-sm space-y-6">
                    <h2 className="text-xl font-black">Configurer votre pack</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Niveau */}
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                Niveau *
                            </label>
                            <select
                                value={levelSlug}
                                onChange={(e) => setLevelSlug(e.target.value)}
                                className="h-12 w-full px-4 rounded-xl border bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="bfem">BFEM</option>
                                <option value="bac">BAC</option>
                            </select>
                        </div>

                        {/* Matière (optionnel) */}
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                Matière (optionnel)
                            </label>
                            <select
                                value={subjectSlug}
                                onChange={(e) => setSubjectSlug(e.target.value)}
                                className="h-12 w-full px-4 rounded-xl border bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">Toutes les matières</option>
                                <option value="mathematiques">Mathématiques</option>
                                <option value="physique-chimie">Physique-Chimie</option>
                                <option value="svt">SVT</option>
                                <option value="francais">Français</option>
                                <option value="anglais">Anglais</option>
                                <option value="histoire-geo">Histoire-Géographie</option>
                                <option value="philosophie">Philosophie</option>
                            </select>
                        </div>

                        {/* Année (optionnel) */}
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                Année (optionnel)
                            </label>
                            <select
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className="h-12 w-full px-4 rounded-xl border bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">Toutes les années</option>
                                {Array.from({ length: 10 }, (_, i) => 2024 - i).map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={loadPack}
                        disabled={loading}
                        className="w-full h-14 rounded-2xl bg-primary text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {loading ? (
                            <><Loader2 className="h-5 w-5 animate-spin" /> Chargement...</>
                        ) : (
                            <><Download className="h-5 w-5" /> Préparer le pack</>
                        )}
                    </button>

                    {error && (
                        <p className="text-sm text-red-600 font-bold text-center">{error}</p>
                    )}
                </div>

                {/* Résultat du pack */}
                {pack && (
                    <div className="bg-white rounded-[2rem] border shadow-sm overflow-hidden">
                        <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black">{pack.packName}</h3>
                                <p className="text-sm text-muted-foreground font-medium">
                                    {pack.totalDocuments} document{pack.totalDocuments > 1 ? "s" : ""}
                                </p>
                            </div>
                            <button
                                onClick={downloadAll}
                                className="flex items-center gap-2 h-12 px-6 rounded-xl bg-green-600 text-white font-black text-sm shadow-lg shadow-green-600/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                <FolderDown className="h-5 w-5" />
                                <span className="hidden sm:inline">Tout télécharger</span>
                            </button>
                        </div>

                        <div className="divide-y">
                            {pack.documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{doc.title}</p>
                                            <p className="text-xs text-muted-foreground font-medium">
                                                {doc.subject} • {doc.year} • {doc.type === "SUBJECT" ? "Sujet" : "Corrigé"}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => downloadFile(doc.pdfUrl)}
                                        className="p-3 rounded-xl hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all"
                                    >
                                        <Download className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
