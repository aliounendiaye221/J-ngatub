export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import DocumentCard from '@/components/ui/DocumentCard';
import LiveActivity from '@/components/ui/LiveActivity';
import { GraduationCap, BookOpen, CheckCircle2, ArrowRight, Sparkles, Zap, ShieldCheck, Search, Trophy, Users, BarChart } from 'lucide-react';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Image from 'next/image';

export default async function HomePage() {
    const session = await getServerSession(authOptions);

    const [recentDocuments, userFavorites] = await Promise.all([
        prisma.document.findMany({
            take: 6,
            orderBy: { createdAt: 'desc' },
            include: {
                level: true,
                subject: true,
            },
        }),
        session?.user ? prisma.favorite.findMany({
            where: { userId: session.user.id }
        }) : Promise.resolve([]),
    ]);

    const favoriteIds = new Set(userFavorites.map(f => f.documentId));

    return (
        <div className="flex flex-col gap-0 pb-24 overflow-hidden bg-background">
            <LiveActivity />

            {/* 2026 Immersive Hero Section */}
            <section className="relative min-h-[90vh] flex flex-col justify-center items-center pt-20 px-6 overflow-hidden">
                {/* Dynamic Background */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background z-0"></div>
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>

                <div className="relative z-10 text-center space-y-8 max-w-5xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-sm font-medium animate-in fade-in zoom-in duration-700">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 font-bold">
                            Nouveau : Mode Challenge Disponible
                        </span>
                    </div>

                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.9] animate-in slide-in-from-bottom-8 fade-in duration-1000">
                        Maîtrisez <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                            L&apos;Excellence.
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-200">
                        La plateforme éducative qui transforme votre révision en addiction positive.
                        Rejoignez l&apos;élite des élèves du Sénégal.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-300">
                        <Link
                            href="/docs"
                            className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_0_60px_-10px_rgba(79,70,229,0.7)] hover:scale-105 transition-all flex items-center justify-center gap-3"
                        >
                            <BookOpen className="h-5 w-5" />
                            Commencer maintenant
                        </Link>
                        <Link
                            href="/pricing"
                            className="w-full sm:w-auto px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 text-foreground rounded-2xl font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                        >
                            <Sparkles className="h-5 w-5 text-amber-400" />
                            Voir le Premium
                        </Link>
                    </div>

                    {/* Social Proof Avatars */}
                    <div className="pt-12 flex items-center justify-center gap-4 animate-in fade-in duration-1000 delay-500">
                        <div className="flex -space-x-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-10 w-10 rounded-full border-2 border-background bg-slate-200" style={{ backgroundImage: `url(https://i.pravatar.cc/100?img=${i + 10})`, backgroundSize: 'cover' }} />
                            ))}
                        </div>
                        <div className="text-left">
                            <div className="flex text-amber-400">
                                {[1, 2, 3, 4, 5].map(i => <span key={i}>★</span>)}
                            </div>
                            <p className="text-xs font-bold text-muted-foreground">Approuvé par <span className="text-foreground">15,000+ élèves</span></p>
                        </div>
                    </div>
                </div>

                {/* Floating Mockups / Elements */}
                <div className="absolute top-1/2 right-10 hidden xl:block animate-float">
                    <div className="glass-card p-4 rounded-3xl w-64 transform rotate-6 border-l-4 border-l-green-400">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-muted-foreground">STATS</span>
                            <BarChart className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="text-3xl font-black">98%</div>
                        <div className="text-xs text-muted-foreground">Taux de réussite au BAC</div>
                    </div>
                </div>
            </section>

            {/* Scrolling Marquee / Ticker */}
            <div className="w-full bg-primary/5 border-y border-primary/10 overflow-hidden py-4">
                <div className="flex gap-12 whitespace-nowrap animate-marquee">
                    {/* Placeholder for marquee content - simpler to just static list for now or CSS anim */}
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <div key={i} className="flex items-center gap-2 text-primary/70 font-bold opacity-70">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>NOUVEAUX SUJETS 2025 DISPONIBLES</span>
                            <span className="mx-4 text-primary/20">•</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bento Grid Features - 2026 Trend */}
            <section className="container mx-auto px-6 py-32">
                <div className="mb-20 text-center space-y-4">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight">Plus qu&apos;une banque d&apos;épreuves.</h2>
                    <p className="text-muted-foreground text-xl max-w-2xl mx-auto">Un écosystème complet conçu pour votre réussite.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 h-auto md:h-[800px]">
                    {/* Large Feature 1 */}
                    <div className="md:col-span-2 md:row-span-1 glass-card p-10 rounded-[2.5rem] relative overflow-hidden group hover:border-primary/30 transition-all cursor-pointer">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all" />
                        <div className="relative z-10">
                            <div className="h-12 w-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/30">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <h3 className="text-3xl font-bold mb-4">Bibliothèque Massive</h3>
                            <p className="text-muted-foreground text-lg max-w-md">Accédez à des milliers de sujets, corrigés et résumés de cours. Tout est classé, tagué et searchable.</p>
                        </div>
                        <div className="absolute bottom-0 right-0 p-8 opacity-50 group-hover:scale-105 transition-transform duration-500">
                            {/* Abstract graphic or image here */}
                            <div className="w-48 h-32 bg-slate-200/50 rounded-tl-3xl border-t border-l border-white/50 backdrop-blur-md"></div>
                        </div>
                    </div>

                    {/* Tall Feature 2 (Mobile App / Dark Mode) */}
                    <div className="md:col-span-1 md:row-span-2 bg-slate-900 text-white p-10 rounded-[2.5rem] relative overflow-hidden flex flex-col justify-between group">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-0"></div>
                        <div className="relative z-10">
                            <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white mb-6 border border-white/20">
                                <Trophy className="h-6 w-6" />
                            </div>
                            <h3 className="text-3xl font-bold mb-4">Mode Compétition</h3>
                            <p className="text-white/70">Défiez vos amis, gagnez des points XP et grimpez dans le classement national.</p>
                        </div>

                        {/* Mockup UI */}
                        <div className="relative z-10 mt-10 mx-auto w-full max-w-[200px] h-[300px] bg-slate-800 rounded-t-3xl border-t-4 border-x-4 border-slate-700 p-4 shadow-2xl transform translate-y-10 group-hover:translate-y-4 transition-transform duration-500">
                            <div className="space-y-3">
                                <div className="h-2 w-12 bg-slate-600 rounded-full mx-auto mb-6"></div>
                                <div className="h-12 bg-indigo-500/20 rounded-xl border border-indigo-500/30 flex items-center px-3 gap-3">
                                    <div className="h-6 w-6 rounded-full bg-indigo-500"></div>
                                    <div className="h-2 w-16 bg-slate-600 rounded"></div>
                                </div>
                                <div className="h-12 bg-slate-700/50 rounded-xl flex items-center px-3 gap-3">
                                    <div className="h-6 w-6 rounded-full bg-slate-600"></div>
                                    <div className="h-2 w-16 bg-slate-600 rounded"></div>
                                </div>
                                <div className="h-12 bg-slate-700/50 rounded-xl flex items-center px-3 gap-3">
                                    <div className="h-6 w-6 rounded-full bg-slate-600"></div>
                                    <div className="h-2 w-16 bg-slate-600 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Medium Feature 3 */}
                    <div className="glass-card p-10 rounded-[2.5rem] relative overflow-hidden group hover:border-emerald-500/30">
                        <div className="relative z-10">
                            <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white mb-6 shadow-lg shadow-emerald-500/30">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Corrigés Certifiés</h3>
                            <p className="text-muted-foreground">Vérifiés par des professeurs d&apos;excellence.</p>
                        </div>
                    </div>

                    {/* Medium Feature 4 */}
                    <div className="glass-card p-10 rounded-[2.5rem] relative overflow-hidden group hover:border-purple-500/30">
                        <div className="relative z-10">
                            <div className="h-12 w-12 rounded-2xl bg-purple-500 flex items-center justify-center text-white mb-6 shadow-lg shadow-purple-500/30">
                                <Zap className="h-6 w-6" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Quiz IA</h3>
                            <p className="text-muted-foreground">Générez des quiz illimités pour tester vos connaissances.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Document Grid (Retained functionality but cleaner) */}
            <section className="container mx-auto px-6 py-12">
                <div className="flex items-end justify-between mb-12">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Dernières pépites</h2>
                        <p className="text-muted-foreground mt-2">Fraîchement ajoutés à la base de données.</p>
                    </div>
                    <Link href="/docs" className="hidden sm:flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all">
                        Tout voir <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recentDocuments.map((doc) => (
                        <DocumentCard
                            key={doc.id}
                            document={doc as any}
                            isFavorited={favoriteIds.has(doc.id)}
                        />
                    ))}
                </div>

                <div className="mt-8 text-center sm:hidden">
                    <Link href="/docs" className="btn-primary w-full">Tout voir</Link>
                </div>
            </section>

            {/* Premium CTA 2026 */}
            <section className="container mx-auto px-6 py-24 mb-12">
                <div className="rounded-[3rem] bg-slate-900 border border-slate-800 p-8 md:p-24 text-center relative overflow-hidden">
                    {/* Background Noise/Grid */}
                    <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10"></div>

                    <div className="relative z-10 max-w-4xl mx-auto space-y-8">
                        <span className="inline-block px-4 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-widest mb-4">
                            Premium Access
                        </span>
                        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
                            Ne révisez plus seul. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Révisez mieux.</span>
                        </h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            Débloquez les quiz illimités, le tableau de bord analytics, et rejoignez la communauté privée des meilleurs élèves.
                        </p>

                        <div className="pt-8">
                            <Link
                                href="/pricing"
                                className="inline-flex items-center gap-3 px-10 py-5 bg-white text-slate-900 rounded-full font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_-10px_rgba(255,255,255,0.3)]"
                            >
                                <Sparkles className="h-5 w-5 text-indigo-600" />
                                Devenir Membre Premium
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
