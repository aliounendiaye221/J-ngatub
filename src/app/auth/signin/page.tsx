"use client";

import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { GraduationCap, LogIn, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";

function SignInContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const callbackUrl = searchParams.get("callbackUrl") || "/";
    const error = searchParams.get("error");
    const registered = searchParams.get("registered");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setFormError("Email ou mot de passe incorrect");
            } else {
                router.push(callbackUrl);
                router.refresh();
            }
        } catch {
            setFormError("Une erreur est survenue. Veuillez réessayer.");
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
                            Connectez-vous pour accéder à vos épreuves et favoris
                        </p>
                    </div>
                </div>

                {/* Success Message (after registration) */}
                {registered && (
                    <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm text-center">
                        Compte créé avec succès ! Connectez-vous maintenant.
                    </div>
                )}

                {/* Error Message */}
                {(error || formError) && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm text-center">
                        {formError || "Erreur de connexion. Veuillez réessayer."}
                    </div>
                )}

                {/* Sign In Card */}
                <div className="bg-white rounded-3xl border shadow-sm p-8 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
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
                                    placeholder="••••••••"
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
                                <LogIn className="h-5 w-5" />
                            )}
                            {loading ? "Connexion en cours..." : "Se connecter"}
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-4 text-muted-foreground font-bold tracking-widest">
                                Nouveau ?
                            </span>
                        </div>
                    </div>

                    <Link
                        href="/auth/register"
                        className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl
                            border-2 border-slate-200 hover:border-primary/30 hover:bg-primary/5
                            font-bold text-sm text-slate-700 transition-all"
                    >
                        Créer un compte gratuitement
                    </Link>

                    <p className="text-[11px] text-center text-muted-foreground leading-relaxed">
                        En vous connectant, vous acceptez nos conditions d&apos;utilisation.
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

export default function SignInPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
            }
        >
            <SignInContent />
        </Suspense>
    );
}
