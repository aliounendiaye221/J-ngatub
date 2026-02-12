import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
    Users,
    FileText,
    TrendingUp,
    Clock,
    Plus,
    ArrowRight,
    ShieldCheck,
    Sparkles,
    LayoutDashboard,
    Search,
    Brain,
    MessageSquare,
    BookOpen,
    GraduationCap
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function AdminDashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/");
    }

    const [
        userCount,
        documentCount,
        premiumCount,
        subjectCount,
        levelCount,
        recentDocs,
        recentUsers
    ] = await Promise.all([
        prisma.user.count(),
        prisma.document.count(),
        prisma.user.count({ where: { isPremium: true } }),
        prisma.subject.count(),
        prisma.level.count(),
        prisma.document.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: { level: true, subject: true }
        }),
        prisma.user.findMany({
            take: 5,
            orderBy: { createdAt: "desc" }
        })
    ]);

    const stats = [
        { label: "Total Éleves", value: userCount, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Base Documentaire", value: documentCount, icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
        { label: "Contributeurs Premium", value: premiumCount, icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50" },
        { label: "Matières", value: subjectCount, icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Niveaux", value: levelCount, icon: GraduationCap, color: "text-rose-600", bg: "bg-rose-50" },
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 pb-24">
            <div className="bg-white border-b mb-12">
                <div className="container mx-auto px-6 py-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest w-fit">
                                <ShieldCheck className="h-3 w-3" /> Espace Sécurisé
                            </div>
                            <h1 className="text-4xl font-black tracking-tighter">Console <span className="premium-gradient-text text-primary">Admin</span></h1>
                            <p className="text-muted-foreground font-medium">Gestion centrale de la plateforme Jàngatub.</p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                href="/admin/documents/new"
                                className="h-14 px-8 rounded-2xl bg-primary text-white font-black text-sm uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                <Plus className="h-5 w-5" /> Nouveau Document
                            </Link>
                            <Link
                                href="/admin/quiz"
                                className="h-14 px-8 rounded-2xl border-2 border-primary text-primary font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-primary/5 active:scale-95 transition-all"
                            >
                                <Brain className="h-5 w-5" /> Quiz
                            </Link>
                            <Link
                                href="/admin/subjects"
                                className="h-14 px-8 rounded-2xl border-2 border-emerald-500 text-emerald-600 font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-emerald-50 active:scale-95 transition-all"
                            >
                                <BookOpen className="h-5 w-5" /> Matières
                            </Link>
                            <Link
                                href="/admin/levels"
                                className="h-14 px-8 rounded-2xl border-2 border-rose-500 text-rose-600 font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-rose-50 active:scale-95 transition-all"
                            >
                                <GraduationCap className="h-5 w-5" /> Niveaux
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 space-y-12">
                {/* Modern Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
                    {stats.map((item) => (
                        <div key={item.label} className="glass-card p-8 rounded-[2.5rem] bg-white border flex flex-col gap-6 group hover:border-primary/20 transition-all">
                            <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner", item.bg, item.color)}>
                                <item.icon className="h-8 w-8" strokeWidth={1.5} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{item.label}</p>
                                <p className="text-4xl font-black tracking-tighter">{item.value.toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Recent Documents Redesign */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                <FileText className="h-6 w-6 text-primary" /> Documents Récents
                            </h2>
                            <Link href="/admin/documents" className="text-xs font-black uppercase tracking-widest text-primary hover:underline">Voir la banque</Link>
                        </div>

                        <div className="glass-card rounded-[2.5rem] bg-white border overflow-hidden">
                            <div className="divide-y divide-slate-50">
                                {recentDocs.map((doc) => (
                                    <div key={doc.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 truncate max-w-[200px]">{doc.title}</span>
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{doc.level.name} • {doc.subject.name}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {doc.isPremium && <Sparkles className="h-4 w-4 text-amber-500" />}
                                            <Link href={`/doc/${doc.id}`} className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"><ArrowRight className="h-4 w-4" /></Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* New Functionality: Users Overview */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                <Users className="h-6 w-6 text-primary" /> Communauté
                            </h2>
                            <Link href="/admin/users" className="text-xs font-black uppercase tracking-widest text-primary hover:underline">Gérer les membres</Link>
                        </div>

                        <div className="glass-card rounded-[2.5rem] bg-white border overflow-hidden">
                            <div className="divide-y divide-slate-50">
                                {recentUsers.map((user) => (
                                    <div key={user.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold uppercase text-xs">
                                                {user.name?.[0] || 'U'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900">{user.name || "Nouveau Membre"}</span>
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{user.email}</span>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                            user.isPremium ? "bg-amber-100 text-amber-700 border border-amber-300" : "bg-slate-100 text-slate-500 border border-slate-300"
                                        )}>
                                            {user.isPremium ? 'Premium' : 'Free'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
