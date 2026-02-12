"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Save, Upload, AlertCircle, CheckCircle2, Loader2, ImagePlus } from "lucide-react";
import Link from "next/link";

interface NewDocumentFormProps {
    levels: { id: string; name: string }[];
    subjects: { id: string; name: string }[];
}

export default function NewDocumentForm({ levels, subjects }: NewDocumentFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [pdfUrl, setPdfUrl] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    /** Upload d'image de couverture vers Cloudinary */
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!allowedTypes.includes(file.type)) {
            setError("Format d'image non supporté. Utilisez JPG, PNG, WebP ou GIF.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("L'image dépasse 5 MB");
            return;
        }

        setUploadingImage(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", "image");

            const res = await fetch("/api/admin/upload", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setImageUrl(data.url);
            } else {
                const err = await res.json();
                setError(err.error || "Erreur lors de l'upload de l'image");
            }
        } catch {
            setError("Erreur de connexion au serveur");
        } finally {
            setUploadingImage(false);
        }
    };

    /** Upload du PDF vers Cloudinary */
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            setError("Seuls les fichiers PDF sont acceptés");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError("Le fichier dépasse 10 MB");
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/admin/upload", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setPdfUrl(data.url);
            } else {
                const err = await res.json();
                setError(err.error || "Erreur lors de l'upload");
            }
        } catch {
            setError("Erreur de connexion au serveur");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const finalPdfUrl = pdfUrl || (formData.get("pdfUrl") as string);

        if (!finalPdfUrl) {
            setError("Veuillez uploader un PDF ou saisir une URL");
            setLoading(false);
            return;
        }

        const data = {
            title: formData.get("title"),
            year: parseInt(formData.get("year") as string),
            levelId: formData.get("levelId"),
            subjectId: formData.get("subjectId"),
            type: formData.get("type"),
            isPremium: formData.get("isPremium") === "true",
            pdfUrl: finalPdfUrl,
            imageUrl: imageUrl || null,
        };

        try {
            const response = await fetch("/api/admin/documents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => router.push("/admin/documents"), 2000);
            } else {
                const errorData = await response.json();
                setError(errorData.error || "Une erreur est survenue");
            }
        } catch {
            setError("Erreur de connexion au serveur");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Link href="/admin/documents" className="text-sm text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors">
                <ArrowLeft className="h-4 w-4" /> Retour à la liste
            </Link>

            <div className="bg-card rounded-3xl border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-8 border-b bg-muted/10">
                    <h1 className="text-2xl font-extrabold tracking-tight">Ajouter un Document</h1>
                    <p className="text-sm text-muted-foreground mt-1">Remplissez les informations ci-dessous pour publier une nouvelle épreuve.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 flex items-center gap-3 text-sm">
                            <AlertCircle className="h-5 w-5" /> {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-4 rounded-xl bg-green-50 border border-green-100 text-green-700 flex items-center gap-3 text-sm">
                            <CheckCircle2 className="h-5 w-5" /> Document créé avec succès ! Redirection...
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-bold tracking-tight uppercase text-muted-foreground">Titre du document</label>
                            <input
                                required
                                name="title"
                                className="w-full h-12 rounded-xl border bg-transparent px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="Ex: Mathématiques BAC S2 2024"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold tracking-tight uppercase text-muted-foreground">Niveau</label>
                            <select
                                required
                                name="levelId"
                                className="w-full h-12 rounded-xl border bg-transparent px-4 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">Sélectionner un niveau</option>
                                {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold tracking-tight uppercase text-muted-foreground">Matière</label>
                            <select
                                required
                                name="subjectId"
                                className="w-full h-12 rounded-xl border bg-transparent px-4 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">Sélectionner une matière</option>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold tracking-tight uppercase text-muted-foreground">Année</label>
                            <input
                                required
                                name="year"
                                type="number"
                                defaultValue={new Date().getFullYear()}
                                className="w-full h-12 rounded-xl border bg-transparent px-4 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold tracking-tight uppercase text-muted-foreground">Type</label>
                            <select
                                required
                                name="type"
                                className="w-full h-12 rounded-xl border bg-transparent px-4 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="SUBJECT">Sujet</option>
                                <option value="CORRECTION">Corrigé</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold tracking-tight uppercase text-muted-foreground">Image de couverture</label>
                            <div className="space-y-3">
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="image-upload"
                                        disabled={uploadingImage}
                                    />
                                    <label
                                        htmlFor="image-upload"
                                        className="w-full h-12 rounded-xl border-2 border-dashed border-slate-200 hover:border-primary/30 bg-transparent flex items-center justify-center gap-2 cursor-pointer text-sm font-bold text-muted-foreground hover:text-primary transition-all"
                                    >
                                        {uploadingImage ? (
                                            <><Loader2 className="h-4 w-4 animate-spin" /> Upload en cours...</>
                                        ) : imageUrl ? (
                                            <><CheckCircle2 className="h-4 w-4 text-green-500" /> Image uploadée</>
                                        ) : (
                                            <><ImagePlus className="h-5 w-5" /> Choisir une image (JPG, PNG, max 5 MB)</>
                                        )}
                                    </label>
                                </div>
                                {imageUrl && (
                                    <div className="relative rounded-xl overflow-hidden border h-32">
                                        <Image src={imageUrl} alt="Aperçu" fill className="object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setImageUrl("")}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold hover:bg-red-600"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold tracking-tight uppercase text-muted-foreground">Fichier PDF</label>
                            <div className="space-y-3">
                                {/* Upload direct */}
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="pdf-upload"
                                        disabled={uploading}
                                    />
                                    <label
                                        htmlFor="pdf-upload"
                                        className="w-full h-12 rounded-xl border-2 border-dashed border-slate-200 hover:border-primary/30 bg-transparent flex items-center justify-center gap-2 cursor-pointer text-sm font-bold text-muted-foreground hover:text-primary transition-all"
                                    >
                                        {uploading ? (
                                            <><Loader2 className="h-4 w-4 animate-spin" /> Upload en cours...</>
                                        ) : pdfUrl ? (
                                            <><CheckCircle2 className="h-4 w-4 text-green-500" /> PDF uploadé avec succès</>
                                        ) : (
                                            <><Upload className="h-5 w-5" /> Choisir un fichier PDF (max 10 MB)</>
                                        )}
                                    </label>
                                </div>

                                {/* OU URL manuelle */}
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <div className="flex-1 h-px bg-border" />
                                    <span className="font-bold uppercase tracking-widest">ou URL directe</span>
                                    <div className="flex-1 h-px bg-border" />
                                </div>
                                <input
                                    name="pdfUrl"
                                    value={pdfUrl}
                                    onChange={(e) => setPdfUrl(e.target.value)}
                                    className="w-full h-12 rounded-xl border bg-transparent px-4 py-2 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    placeholder="https://res.cloudinary.com/..."
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold tracking-tight uppercase text-muted-foreground">Confidentialité</label>
                            <div className="flex bg-muted/30 p-1 rounded-xl">
                                <label className="flex-1">
                                    <input type="radio" name="isPremium" value="false" defaultChecked className="hidden peer" />
                                    <div className="text-center py-2 rounded-lg cursor-pointer peer-checked:bg-white peer-checked:shadow-sm text-sm font-bold text-muted-foreground peer-checked:text-primary transition-all">Gratuit</div>
                                </label>
                                <label className="flex-1">
                                    <input type="radio" name="isPremium" value="true" className="hidden peer" />
                                    <div className="text-center py-2 rounded-lg cursor-pointer peer-checked:bg-white peer-checked:shadow-sm text-sm font-bold text-muted-foreground peer-checked:text-amber-600 transition-all text-amber-600/50">Premium</div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full h-14 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                        >
                            <Save className="h-5 w-5" /> {loading ? "Création en cours..." : "Publier le document"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
