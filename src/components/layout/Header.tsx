"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Search, BookOpen, GraduationCap, Menu, User, LogOut, LogIn, Heart, ShieldCheck, LayoutDashboard, Brain, Download, Award, MessageSquare, Sparkles, X } from 'lucide-react';
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function Header() {
    const { data: session } = useSession();
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fermer le menu mobile quand on change de page
    useEffect(() => {
        setMobileOpen(false);
    }, []);

    /** Soumet la recherche vers /docs?q=... */
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/docs?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery("");
            setMobileOpen(false);
        }
    };

    return (
        <header className={cn(
            "sticky top-0 z-50 w-full transition-all duration-300 px-4 py-3 md:px-6 md:py-4",
            scrolled ? "bg-background/80 backdrop-blur-xl border-b shadow-sm" : "bg-transparent"
        )}>
            <div className="container mx-auto flex items-center justify-between glass-card md:rounded-full px-4 py-2 md:px-6">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative h-12 w-12 flex items-center justify-center overflow-hidden rounded-xl bg-white border shadow-sm group-hover:scale-105 transition-transform group-hover:border-primary/20">
                            <Image
                                src="/logo.png"
                                alt="Jàngatub Logo"
                                width={48}
                                height={48}
                                className="h-full w-full object-cover p-1"
                            />
                        </div>
                        <span className="font-black text-2xl tracking-tighter text-slate-900">
                            Jànga<span className="text-[#4F46E5]">tub</span>
                        </span>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-1">
                        {/* Liens publics */}
                        {[
                            { href: "/docs", label: "Bibliothèque", icon: BookOpen },
                            { href: "/bfem", label: "BFEM", icon: GraduationCap },
                            { href: "/bac", label: "BAC", icon: ShieldCheck },
                        ].map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full transition-all"
                            >
                                <link.icon className="h-4 w-4" />
                                {link.label}
                            </Link>
                        ))}

                        {/* Liens premium — visibles uniquement pour les abonnés */}
                        {session?.user?.isPremium && (
                            <>
                                <div className="h-5 w-px bg-border mx-1" />
                                {[
                                    { href: "/quiz", label: "Quiz", icon: Brain },
                                    { href: "/download", label: "Packs", icon: Download },
                                    { href: "/profile/dashboard", label: "Dashboard", icon: LayoutDashboard },
                                ].map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary/70 hover:text-primary hover:bg-primary/5 rounded-full transition-all"
                                    >
                                        <link.icon className="h-4 w-4" />
                                        {link.label}
                                    </Link>
                                ))}
                            </>
                        )}

                        {/* Lien Pricing pour non-premium */}
                        {session && !session.user?.isPremium && (
                            <Link
                                href="/pricing"
                                className="flex items-center gap-2 px-4 py-2 text-sm font-black text-amber-600 hover:bg-amber-50 rounded-full transition-all ml-1"
                            >
                                <Sparkles className="h-4 w-4" />
                                Premium
                            </Link>
                        )}
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    {/* Barre de recherche desktop */}
                    <form onSubmit={handleSearch} className="hidden md:flex relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher une épreuve..."
                            className="pl-10 h-10 w-48 lg:w-64 rounded-full border-none bg-muted/50 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all focus:w-80"
                        />
                    </form>

                    <div className="flex items-center gap-2 border-l pl-3 ml-2">
                        {session ? (
                            <>
                                <Link
                                    href="/favorites"
                                    className="p-2 rounded-full hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-all hidden sm:flex"
                                    title="Mes Favoris"
                                >
                                    <Heart className="h-5 w-5" />
                                </Link>

                                {session.user?.role === "ADMIN" && (
                                    <Link
                                        href="/admin"
                                        className="p-2 rounded-full hover:bg-blue-50 text-muted-foreground hover:text-blue-500 transition-all"
                                        title="Administration"
                                    >
                                        <LayoutDashboard className="h-5 w-5" />
                                    </Link>
                                )}

                                <Link
                                    href="/profile"
                                    className="flex items-center gap-2 p-1 pr-3 rounded-full bg-muted/50 hover:bg-muted transition-all border border-transparent hover:border-border"
                                >
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                        {session.user?.name?.[0].toUpperCase() || "U"}
                                    </div>
                                    <div className="hidden md:flex flex-col items-start leading-none">
                                        <span className="text-xs font-bold">{session.user?.name?.split(' ')[0]}</span>
                                        <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-black">
                                            {session.user?.isPremium ? "Premium" : "Gratuit"}
                                        </span>
                                    </div>
                                </Link>

                                <button
                                    onClick={() => signOut()}
                                    className="p-2 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all hidden sm:flex"
                                    title="Déconnexion"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => signIn()}
                                className="flex items-center gap-2 rounded-full bg-[#4F46E5] px-8 py-3 text-sm font-black text-white shadow-xl shadow-indigo-500/20 hover:bg-[#4338CA] hover:scale-105 active:scale-95 transition-all"
                            >
                                <LogIn className="h-4 w-4" />
                                <span className="hidden sm:inline">Connexion</span>
                            </button>
                        )}

                        {/* Bouton menu mobile */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="lg:hidden p-2 rounded-full hover:bg-muted transition-all"
                            aria-label="Menu"
                        >
                            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* ─── Menu mobile (slide-down) ─────────────────────────── */}
            {mobileOpen && (
                <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b shadow-xl z-40 animate-in slide-in-from-top-2 duration-200">
                    <div className="container mx-auto px-6 py-6 space-y-4">
                        {/* Recherche mobile */}
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Rechercher une épreuve..."
                                className="w-full pl-11 h-12 rounded-2xl border bg-slate-50 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </form>

                        {/* Liens publics */}
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4 pb-2">Navigation</p>
                            {[
                                { href: "/docs", label: "Bibliothèque", icon: BookOpen },
                                { href: "/bfem", label: "BFEM", icon: GraduationCap },
                                { href: "/bac", label: "BAC", icon: ShieldCheck },
                            ].map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-primary/5 hover:text-primary rounded-xl transition-all"
                                >
                                    <link.icon className="h-5 w-5" />
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* Liens premium */}
                        {session?.user?.isPremium && (
                            <div className="space-y-1 border-t pt-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary px-4 pb-2">Premium</p>
                                {[
                                    { href: "/quiz", label: "Quiz interactifs", icon: Brain },
                                    { href: "/download", label: "Packs téléchargement", icon: Download },
                                    { href: "/profile/dashboard", label: "Dashboard", icon: LayoutDashboard },
                                    { href: "/certificates", label: "Certificats", icon: Award },
                                    { href: "/support", label: "Support", icon: MessageSquare },
                                ].map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setMobileOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-primary/80 hover:bg-primary/5 hover:text-primary rounded-xl transition-all"
                                    >
                                        <link.icon className="h-5 w-5" />
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Lien Pricing pour non-premium */}
                        {session && !session.user?.isPremium && (
                            <div className="border-t pt-4">
                                <Link
                                    href="/pricing"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm font-black text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                                >
                                    <Sparkles className="h-5 w-5" />
                                    Passer Premium
                                </Link>
                            </div>
                        )}

                        {/* Actions utilisateur mobile */}
                        {session && (
                            <div className="border-t pt-4 flex gap-3">
                                <Link
                                    href="/favorites"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-500 font-bold text-sm"
                                >
                                    <Heart className="h-4 w-4" /> Favoris
                                </Link>
                                <button
                                    onClick={() => { signOut(); setMobileOpen(false); }}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm"
                                >
                                    <LogOut className="h-4 w-4" /> Déconnexion
                                </button>
                            </div>
                        )}

                        {!session && (
                            <div className="border-t pt-4">
                                <button
                                    onClick={() => { signIn(); setMobileOpen(false); }}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-black text-sm"
                                >
                                    <LogIn className="h-4 w-4" /> Se connecter
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
