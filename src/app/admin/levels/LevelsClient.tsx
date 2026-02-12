"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Plus, Trash2, Edit, Check, X, Loader2,
    GraduationCap, FileText, Brain, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Level {
    id: string;
    name: string;
    slug: string;
    _count: { documents: number; quizzes: number };
}

export default function LevelsClient({ levels }: { levels: Level[] }) {
    const router = useRouter();
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [deleting, setDeleting] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editSlug, setEditSlug] = useState("");
    const [saving, setSaving] = useState(false);

    const generateSlug = (value: string) => {
        return value
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim();
    };

    const handleNameChange = (value: string) => {
        setName(value);
        setSlug(generateSlug(value));
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/admin/levels", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, slug }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Erreur lors de la création");
                return;
            }

            setName("");
            setSlug("");
            setShowForm(false);
            router.refresh();
        } catch {
            setError("Erreur de connexion");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer ce niveau ? Cette action est irréversible.")) return;
        setDeleting(id);
        try {
            const res = await fetch("/api/admin/levels", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            const data = await res.json();
            if (!res.ok) {
                alert(data.error || "Erreur lors de la suppression");
            } else {
                router.refresh();
            }
        } catch {
            alert("Erreur de connexion");
        } finally {
            setDeleting(null);
        }
    };

    const startEdit = (level: Level) => {
        setEditingId(level.id);
        setEditName(level.name);
        setEditSlug(level.slug);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName("");
        setEditSlug("");
    };

    const handleSave = async (id: string) => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/levels", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, name: editName, slug: editSlug }),
            });
            const data = await res.json();
            if (!res.ok) {
                alert(data.error || "Erreur lors de la sauvegarde");
            } else {
                setEditingId(null);
                router.refresh();
            }
        } catch {
            alert("Erreur de connexion");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Bouton ajouter */}
            <div className="flex justify-end">
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={cn(
                        "h-12 px-6 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all",
                        showForm
                            ? "bg-slate-200 text-slate-600"
                            : "bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
                    )}
                >
                    {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {showForm ? "Annuler" : "Nouveau niveau"}
                </button>
            </div>

            {/* Formulaire de création */}
            {showForm && (
                <div className="bg-white rounded-3xl border shadow-sm p-8">
                    <h3 className="text-lg font-black mb-6">Ajouter un niveau</h3>
                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" /> {error}
                        </div>
                    )}
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">
                                    Nom du niveau
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    placeholder="ex: Terminale S"
                                    required
                                    className="w-full h-12 rounded-xl border-2 border-slate-200 px-4 text-sm
                                        focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">
                                    Slug (URL)
                                </label>
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    placeholder="ex: terminale-s"
                                    required
                                    pattern="^[a-z0-9-]+$"
                                    className="w-full h-12 rounded-xl border-2 border-slate-200 px-4 text-sm font-mono
                                        focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                                <p className="text-[11px] text-muted-foreground">
                                    Lettres minuscules, chiffres et tirets uniquement
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="h-12 px-8 rounded-2xl bg-primary text-white font-bold text-sm
                                    flex items-center gap-2 disabled:opacity-50 hover:bg-primary/90 transition-all"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                {loading ? "Création..." : "Créer le niveau"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Liste des niveaux */}
            <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
                <div className="p-6 border-b bg-slate-50/50">
                    <h3 className="font-black text-sm uppercase tracking-widest text-slate-500 flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        {levels.length} niveau{levels.length > 1 ? "x" : ""} enregistré{levels.length > 1 ? "s" : ""}
                    </h3>
                </div>

                {levels.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                        <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p className="font-bold">Aucun niveau</p>
                        <p className="text-sm mt-1">Commencez par ajouter un niveau avec le bouton ci-dessus.</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {levels.map((level) => (
                            <div key={level.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                {editingId === level.id ? (
                                    <div className="flex-1 flex items-center gap-4">
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="h-10 rounded-lg border-2 border-primary/30 px-3 text-sm font-bold flex-1 max-w-[200px]
                                                focus:border-primary focus:outline-none"
                                        />
                                        <input
                                            type="text"
                                            value={editSlug}
                                            onChange={(e) => setEditSlug(e.target.value)}
                                            className="h-10 rounded-lg border-2 border-primary/30 px-3 text-sm font-mono flex-1 max-w-[200px]
                                                focus:border-primary focus:outline-none"
                                        />
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleSave(level.id)}
                                                disabled={saving}
                                                className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                            >
                                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                                                <GraduationCap className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{level.name}</p>
                                                <p className="text-[11px] font-mono text-muted-foreground">/{level.slug}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <FileText className="h-3.5 w-3.5" />
                                                    {level._count.documents} doc{level._count.documents > 1 ? "s" : ""}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Brain className="h-3.5 w-3.5" />
                                                    {level._count.quizzes} quiz
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => startEdit(level)}
                                                    className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
                                                    title="Modifier"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(level.id)}
                                                    disabled={deleting === level.id}
                                                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
                                                    title="Supprimer"
                                                >
                                                    {deleting === level.id
                                                        ? <Loader2 className="h-4 w-4 animate-spin" />
                                                        : <Trash2 className="h-4 w-4" />
                                                    }
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
