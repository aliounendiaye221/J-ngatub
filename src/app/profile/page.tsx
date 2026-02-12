import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { User, Mail, Shield, Crown, Calendar, Sparkles, Heart, ArrowRight, Brain, Download as DownloadIcon, Award, MessageSquare, LayoutDashboard, BarChart3 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            subscriptions: {
                where: { status: "ACTIVE" },
                orderBy: { createdAt: "desc" },
                take: 1
            },
            _count: {
                select: { favorites: true }
            }
        }
    });

    if (!user) redirect("/");

    return (
        <div className="min-h-screen bg-slate-50/50 pb-24">
            <div className="bg-white border-b mb-12">
                <div className="container mx-auto px-6 py-16">
                    <div className="flex flex-col md:flex-row md:items-center gap-8">
                        <div className="h-24 w-24 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                            <User className="h-12 w-12" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <h1 className="text-4xl font-black tracking-tight tracking-tighter">Mon Espace</h1>
                                {user.isPremium && (
                                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-600 text-[10px] font-black uppercase tracking-widest border border-amber-200 flex items-center gap-1">
                                        <Crown className="h-3 w-3" /> Premium
                                    </span>
                                )}
                            </div>
                            <p className="text-muted-foreground font-medium">Bienvenue sur votre tableau de bord personnel Jàngatub.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Sidebar */}
                    <div className="space-y-8">
                        <div className="glass-card p-8 rounded-[2rem] bg-white space-y-8">
                            <div className="space-y-6">
                                <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground">Informations</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-3 border-b border-dashed">
                                        <span className="text-sm font-bold text-muted-foreground">Nom complet</span>
                                        <span className="text-sm font-black">{user.name || "N/A"}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b border-dashed">
                                        <span className="text-sm font-bold text-muted-foreground">Email</span>
                                        <span className="text-sm font-black truncate max-w-[150px]">{user.email}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-3">
                                        <span className="text-sm font-bold text-muted-foreground">Rôle système</span>
                                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-[10px] font-black text-slate-600 uppercase">
                                            {user.role}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href="/favorites"
                                className="group flex items-center justify-between p-5 rounded-2xl bg-[#4F46E5] text-white shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <Heart className="h-5 w-5 fill-white/20" />
                                    <span className="font-bold">Mes Favoris</span>
                                </div>
                                <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-black">
                                    {user._count.favorites}
                                </div>
                            </Link>
                        </div>

                        {/* Raccourcis Premium */}
                        {user.isPremium && (
                            <div className="glass-card p-8 rounded-[2rem] bg-white space-y-4">
                                <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground">Modules Premium</h3>
                                <div className="space-y-2">
                                    {[
                                        { href: "/profile/dashboard", label: "Dashboard", icon: BarChart3, color: "bg-blue-50 text-blue-600" },
                                        { href: "/quiz", label: "Quiz interactifs", icon: Brain, color: "bg-purple-50 text-purple-600" },
                                        { href: "/download", label: "Packs téléchargement", icon: DownloadIcon, color: "bg-green-50 text-green-600" },
                                        { href: "/certificates", label: "Badges & Certificats", icon: Award, color: "bg-amber-50 text-amber-600" },
                                        { href: "/support", label: "Support prioritaire", icon: MessageSquare, color: "bg-rose-50 text-rose-600" },
                                    ].map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all group"
                                        >
                                            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", link.color)}>
                                                <link.icon className="h-5 w-5" />
                                            </div>
                                            <span className="text-sm font-bold group-hover:text-primary transition-colors">{link.label}</span>
                                            <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Subscription Card */}
                        <div className={cn(
                            "glass-card p-10 rounded-[3rem] relative overflow-hidden",
                            user.isPremium ? "bg-white" : "premium-gradient-bg text-white"
                        )}>
                            {user.isPremium ? (
                                <div className="space-y-8 relative z-10">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-black">Abonnement Actif</h3>
                                            <p className="text-muted-foreground font-medium">Vous profitez de l&apos;intégralité de la plateforme.</p>
                                        </div>
                                        <div className="h-16 w-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-inner">
                                            <Crown className="h-8 w-8" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                        <div className="p-6 rounded-2xl border bg-slate-50">
                                            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">PROCHAINE ÉCHÉANCE</p>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-primary" />
                                                <p className="font-black text-lg">
                                                    {user.subscriptions[0]?.endAt ? new Date(user.subscriptions[0].endAt).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' }) : "Illimité"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="p-6 rounded-2xl border bg-slate-50">
                                            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">TYPE D&apos;OFFRE</p>
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="h-4 w-4 text-primary" />
                                                <p className="font-black text-lg">{user.subscriptions[0]?.plan === 'PREMIUM_ANNUAL' ? 'Annuel' : 'Mensuel'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8 relative z-10">
                                    <div className="space-y-4">
                                        <h3 className="text-4xl font-black italic">Libérez votre potentiel</h3>
                                        <p className="text-white/80 font-medium max-w-md">
                                            Accédez aux corrigés détaillés et aux explications exclusives pour chaque épreuve dès maintenant.
                                        </p>
                                    </div>
                                    <Link
                                        href="/pricing"
                                        className="inline-flex items-center gap-3 px-8 py-4 bg-white text-primary rounded-2xl font-black shadow-2xl hover:scale-105 active:scale-95 transition-all group"
                                    >
                                        Passer au Premium
                                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <Sparkles className="h-48 w-48" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Recent Activity / Settings */}
                        <div className="glass-card p-10 rounded-[3rem] bg-white space-y-8">
                            <h3 className="text-xl font-black tracking-tight">Paramètres de sécurité</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Adresse de connexion</label>
                                    <div className="h-12 w-full rounded-2xl border bg-muted/30 px-4 flex items-center text-sm font-bold text-slate-500">
                                        {user.email}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Méthode d&apos;accès</label>
                                    <div className="h-12 w-full rounded-2xl border bg-muted/30 px-4 flex items-center text-sm font-bold text-slate-500">
                                        OAuth (Social / Magic Link)
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed italic border-l-4 border-primary/20 pl-4 py-2">
                                Pour des raisons de sécurité, les mises à jour de profil et de mot de passe sont directement gérées par votre fournisseur d&apos;identité (Google ou Magic Link).
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
