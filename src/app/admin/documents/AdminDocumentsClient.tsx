"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Edit, Check, X, Loader2 } from "lucide-react";

interface Document {
    id: string;
    title: string;
    year: number;
    type: string;
    pdfUrl: string;
    isPremium: boolean;
    level: { name: string };
    subject: { name: string };
}

export default function AdminDocumentsClient({ documents }: { documents: Document[] }) {
    const router = useRouter();
    const [deleting, setDeleting] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editYear, setEditYear] = useState(0);
    const [saving, setSaving] = useState(false);

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer ce document ? Cette action est irréversible.")) return;
        setDeleting(id);
        try {
            const res = await fetch("/api/admin/documents", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            if (res.ok) {
                router.refresh();
            } else {
                alert("Erreur lors de la suppression");
            }
        } catch {
            alert("Erreur de connexion");
        } finally {
            setDeleting(null);
        }
    };

    const startEdit = (doc: Document) => {
        setEditingId(doc.id);
        setEditTitle(doc.title);
        setEditYear(doc.year);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditTitle("");
        setEditYear(0);
    };

    const handleSave = async (id: string) => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/documents", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, title: editTitle, year: editYear }),
            });
            if (res.ok) {
                setEditingId(null);
                router.refresh();
            } else {
                alert("Erreur lors de la sauvegarde");
            }
        } catch {
            alert("Erreur de connexion");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-muted/20 text-muted-foreground uppercase text-[10px] font-bold tracking-widest">
                        <tr>
                            <th className="p-4">Titre</th>
                            <th className="p-4">Niveau</th>
                            <th className="p-4">Matière</th>
                            <th className="p-4">Année</th>
                            <th className="p-4 text-center">Premium</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                        {documents.map((doc) => (
                            <tr key={doc.id} className="hover:bg-muted/5 transition-colors">
                                <td className="p-4">
                                    {editingId === doc.id ? (
                                        <input
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            className="w-full px-2 py-1 border rounded-lg text-sm"
                                        />
                                    ) : (
                                        <>
                                            <div className="font-semibold">{doc.title}</div>
                                            <div className="text-[10px] text-muted-foreground truncate max-w-[200px]">{doc.pdfUrl}</div>
                                        </>
                                    )}
                                </td>
                                <td className="p-4">
                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">{doc.level.name}</span>
                                </td>
                                <td className="p-4">
                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">{doc.subject.name}</span>
                                </td>
                                <td className="p-4 font-medium">
                                    {editingId === doc.id ? (
                                        <input
                                            type="number"
                                            value={editYear}
                                            onChange={(e) => setEditYear(Number(e.target.value))}
                                            className="w-20 px-2 py-1 border rounded-lg text-sm"
                                        />
                                    ) : (
                                        doc.year
                                    )}
                                </td>
                                <td className="p-4">
                                    <div className="flex justify-center">
                                        {doc.isPremium ? (
                                            <Check className="h-5 w-5 text-green-600 bg-green-100 p-1 rounded-full" />
                                        ) : (
                                            <X className="h-5 w-5 text-slate-400 bg-slate-100 p-1 rounded-full" />
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {editingId === doc.id ? (
                                            <>
                                                <button
                                                    onClick={() => handleSave(doc.id)}
                                                    disabled={saving}
                                                    className="p-2 rounded-lg hover:bg-green-50 text-green-600 border border-transparent hover:border-green-100 transition-all disabled:opacity-50"
                                                >
                                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="p-2 rounded-lg hover:bg-slate-50 text-slate-600 border border-transparent hover:border-slate-100 transition-all"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => startEdit(doc)}
                                                    className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 border border-transparent hover:border-blue-100 transition-all"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(doc.id)}
                                                    disabled={deleting === doc.id}
                                                    className="p-2 rounded-lg hover:bg-red-50 text-red-600 border border-transparent hover:border-red-100 transition-all disabled:opacity-50"
                                                >
                                                    {deleting === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {documents.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground italic">
                        Aucun document trouvé.
                    </div>
                )}
            </div>
        </div>
    );
}
