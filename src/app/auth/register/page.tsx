"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, UserPlus, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validation côté client
        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas");
            return;
        }

        if (password.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Erreur lors de la création du compte");
                return;
            }

            // Rediriger vers la page de connexion avec message de succès
            router.push("/auth/signin?registered=true");
        } catch {
            setError("Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50/50 px-4">
            <div className="w-full max-w-md space-y-8">
                {/* Logo & Branding */}
                <div className="text-center space-y-4">
                    <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <GraduationCap className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">
                            Jànga<span className="text-primary">tub</span>
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Créez votre compte pour accéder à toutes les épreuves
                        </p>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm text-center">
                        {error}
                    </div>
                )}

                {/* Register Card */}
                <div className="bg-white rounded-3xl border shadow-sm p-8 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name */}
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-semibold text-slate-700">
                                Nom complet
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Prénom Nom"
                                required
                                minLength={2}
                                className="w-full h-12 rounded-xl border-2 border-slate-200 px-4 text-sm
                                    focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
                                    transition-all placeholder:text-slate-400"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-semibold text-slate-700">
                                Adresse email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="votre@email.com"
                                required
                                className="w-full h-12 rounded-xl border-2 border-slate-200 px-4 text-sm
                                    focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
                                    transition-all placeholder:text-slate-400"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minimum 6 caractères"
                                    required
                                    minLength={6}
                                    className="w-full h-12 rounded-xl border-2 border-slate-200 px-4 pr-12 text-sm
                                        focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
                                        transition-all placeholder:text-slate-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">
                                Confirmer le mot de passe
                            </label>
                            <input
                                id="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Retapez votre mot de passe"
                                required
                                minLength={6}
                                className="w-full h-12 rounded-xl border-2 border-slate-200 px-4 text-sm
                                    focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
                                    transition-all placeholder:text-slate-400"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 h-14 rounded-2xl
                                bg-primary hover:bg-primary/90 text-white font-bold text-sm
                                transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <UserPlus className="h-5 w-5" />
                            )}
                            {loading ? "Création en cours..." : "Créer mon compte"}
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-4 text-muted-foreground font-bold tracking-widest">
                                Déjà inscrit ?
                            </span>
                        </div>
                    </div>

                    <Link
                        href="/auth/signin"
                        className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl
                            border-2 border-slate-200 hover:border-primary/30 hover:bg-primary/5
                            font-bold text-sm text-slate-700 transition-all"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Se connecter
                    </Link>

                    <p className="text-[11px] text-center text-muted-foreground leading-relaxed">
                        En créant un compte, vous acceptez nos conditions d&apos;utilisation.
                        Vos données sont protégées et ne seront jamais partagées.
                    </p>
                </div>

                <p className="text-center text-xs text-muted-foreground">
                    © 2026 Jàngatub — Plateforme éducative du Sénégal
                </p>
            </div>
        </div>
    );
}
