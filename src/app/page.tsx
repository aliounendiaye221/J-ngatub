export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import DocumentCard from '@/components/ui/DocumentCard';
import { GraduationCap, BookOpen, CheckCircle2, ArrowRight, Sparkles, Zap, ShieldCheck, Search } from 'lucide-react';
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
        <div className="flex flex-col gap-24 pb-24 overflow-hidden">
            {/* New Hero Section */}
            <section className="relative min-h-[90vh] flex items-center pt-20">
                {/* Background Blobs */}
                <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold animate-in fade-in slide-in-from-left-4 duration-700">
                                <Sparkles className="h-4 w-4" />
                                <span>Plateforme N°1 pour le BFEM & BAC</span>
                            </div>

                            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.1] animate-in fade-in slide-in-from-left-8 duration-700 delay-100">
                                Libérez votre <br />
                                <span className="premium-gradient-text">Potentiel Académique</span>
                            </h1>

                            <p className="text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 animate-in fade-in slide-in-from-left-12 duration-700 delay-200">
                                Accédez à la plus grande bibliothèque d&apos;épreuves et corrigés du Sénégal.
                                Une préparation d&apos;excellence pour des résultats exceptionnels.
                            </p>

                            <div className="flex flex-wrap justify-center lg:justify-start gap-5 pt-4 animate-in fade-in slide-in-from-left-16 duration-700 delay-300">
                                <Link
                                    href="/docs"
                                    className="px-10 py-5 bg-[#4F46E5] text-white rounded-2xl font-black text-lg shadow-2xl shadow-indigo-500/30 hover:bg-[#4338CA] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group"
                                >
                                    Explorer le catalogue
                                    <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    href="/pricing"
                                    className="px-10 py-5 bg-white border-2 border-slate-200 text-slate-900 rounded-2xl font-black text-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                                >
                                    Devenir Premium
                                </Link>
                            </div>

                            <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 opacity-60">
                                <div className="text-center lg:text-left">
                                    <p className="text-2xl font-black">2026</p>
                                    <p className="text-xs uppercase tracking-widest font-bold">Standard</p>
                                </div>
                                <div className="w-px h-8 bg-border" />
                                <div className="text-center lg:text-left">
                                    <p className="text-2xl font-black">10K+</p>
                                    <p className="text-xs uppercase tracking-widest font-bold">Élèves</p>
                                </div>
                                <div className="w-px h-8 bg-border" />
                                <div className="text-center lg:text-left">
                                    <p className="text-2xl font-black">500+</p>
                                    <p className="text-xs uppercase tracking-widest font-bold">Sujets</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative animate-in zoom-in duration-1000">
                            <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/20 border-8 border-white group">
                                <Image
                                    src="/hero-abstract.png"
                                    alt="Premium Design"
                                    width={800}
                                    height={800}
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
                            </div>
                            {/* Floating Stats Card */}
                            <div className="absolute -bottom-10 -left-10 glass-card p-6 rounded-3xl space-y-3 z-20 animate-bounce transition-all [animation-duration:5s]">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                                        <CheckCircle2 className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold">Corrigés vérifiés</p>
                                        <p className="text-xs text-muted-foreground">Par des professeurs de rang A</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="container mx-auto px-6">
                <div className="text-center space-y-4 mb-16">
                    <h2 className="text-4xl font-black tracking-tight">Pourquoi choisir Jàngatub ?</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">Tout ce dont vous avez besoin pour maximiser votre réussite scolaire est ici.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            title: "Bibliothèque Massive",
                            desc: "Sujets d'examens nationaux des 10 dernières années classés par année et matière.",
                            icon: BookOpen,
                            color: "bg-blue-500"
                        },
                        {
                            title: "Excellence Académique",
                            desc: "Des corrigés ultra-détaillés conçus pour vous aider à comprendre chaque étape de la résolution.",
                            icon: Zap,
                            color: "bg-amber-500"
                        },
                        {
                            title: "Support Total",
                            desc: "Couverture exhaustive de toutes les séries du BAC et des options du BFEM.",
                            icon: ShieldCheck,
                            color: "bg-indigo-500"
                        }
                    ].map((feature, i) => (
                        <div key={i} className="glass-card hover-lift p-8 rounded-[2rem] space-y-6">
                            <div className={`h-14 w-14 rounded-2xl ${feature.color} flex items-center justify-center text-white shadow-lg`}>
                                <feature.icon className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-bold">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Recent Documents with Premium Grid */}
            <section className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                    <div className="space-y-2 text-center md:text-left">
                        <h2 className="text-4xl font-black tracking-tight">Derniers ajouts</h2>
                        <p className="text-muted-foreground">Restez à jour avec les documents les plus récents.</p>
                    </div>
                    <Link
                        href="/docs"
                        className="group flex items-center gap-2 px-6 py-3 rounded-full bg-muted font-bold hover:bg-primary hover:text-white transition-all"
                    >
                        Accéder à toute la banque
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {recentDocuments.map((doc) => (
                        <DocumentCard
                            key={doc.id}
                            document={doc as any}
                            isFavorited={favoriteIds.has(doc.id)}
                        />
                    ))}
                </div>
            </section>

            {/* Premium CTA with Modern Style */}
            <section className="container mx-auto px-6">
                <div className="relative rounded-[3rem] overflow-hidden premium-gradient-bg p-8 md:p-20 text-center text-white shadow-2xl shadow-primary/30">
                    <div className="absolute top-0 right-0 p-12 opacity-10">
                        <Sparkles className="h-64 w-64 rotate-12" />
                    </div>

                    <div className="relative z-10 max-w-3xl mx-auto space-y-10 text-white">
                        <h2 className="text-4xl md:text-7xl font-black leading-tight italic tracking-tighter">Envie d&apos;aller plus loin dans vos révisions ?</h2>
                        <p className="text-xl md:text-2xl text-white/90 font-medium">
                            Rejoignez le club Premium : quiz interactifs, dashboard de progression, explications IA et certificats de réussite.
                        </p>
                        <div className="flex flex-wrap justify-center gap-6 pt-4">
                            <Link
                                href="/pricing"
                                className="px-12 py-6 bg-white text-[#4F46E5] rounded-[2rem] font-black text-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
                            >
                                Passer au Premium
                            </Link>
                            <Link
                                href="/api/auth/signin"
                                className="px-12 py-6 bg-slate-900/50 backdrop-blur-md border-2 border-white/30 text-white rounded-[2rem] font-black text-2xl hover:bg-slate-900/80 transition-all"
                            >
                                Créer un compte
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
