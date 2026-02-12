import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
// Icônes utilisées dans la page de détail du document
import {
    ArrowLeft,
    Calendar,
    FileText,
    Share2,
    Download,
    MessageCircle,
    Sparkles,
    ShieldCheck,
    CheckCircle2,
    ArrowRight,
    Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function DocumentDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const document = await prisma.document.findUnique({
        where: { id: params.id },
        include: {
            level: true,
            subject: true,
        },
    });

    if (!document) {
        notFound();
    }

    const shareOnWhatsApp = () => {
        const text = `Consultez ce document sur Jàngatub : ${document.title}`;
        const url = `https://jangatub.sn/doc/${document.id}`;
        return `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-24">
            {/* Header Hero for Document */}
            <div className="bg-white border-b relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-1/2" />
                <div className="container mx-auto px-6 py-12 relative z-10">
                    <Link
                        href="/docs"
                        className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-8 group"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Retour à la bibliothèque
                    </Link>

                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                        <div className="max-w-3xl space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10">
                                    {document.level.name}
                                </span>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-sm font-bold text-muted-foreground">{document.subject.name}</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                                {document.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-6 pt-2">
                                <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    <span>Année Session : {document.year}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                                    <ShieldCheck className="h-4 w-4 text-primary" />
                                    <span>Contenu Certifié Jàngatub</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <a
                                href={shareOnWhatsApp()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-14 px-6 rounded-2xl bg-green-500 text-white font-bold flex items-center gap-3 shadow-lg shadow-green-500/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                <MessageCircle className="h-5 w-5" />
                                <span className="hidden md:inline">Partager</span>
                            </a>
                            <button className="h-14 w-14 rounded-2xl border bg-white flex items-center justify-center hover:bg-muted transition-all active:scale-95">
                                <Share2 className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 mt-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content: Document Viewer */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="glass-card rounded-[2.5rem] overflow-hidden bg-white shadow-2xl shadow-primary/5 min-h-[800px] flex flex-col items-center justify-center relative border-8 border-white">
                            {/* Tous les PDF sont désormais en accès libre */}
                                <>
                                    <iframe
                                        src={`${document.pdfUrl}#toolbar=0`}
                                        className="h-full w-full absolute inset-0 border-0"
                                        title={document.title}
                                    />
                                    <div className="absolute top-6 right-6 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border shadow-sm text-xs font-black uppercase tracking-widest">
                                        Accès Gratuit
                                    </div>
                                </>
                        </div>
                    </div>

                    {/* Sidebar: Details & Actions */}
                    <div className="space-y-8">
                        <div className="glass-card p-8 rounded-[2rem] space-y-8 border-white/50 bg-white/50 animate-in slide-in-from-right-4 duration-700">
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                    Actions Rapides
                                </h3>
                                <a
                                    href={document.pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                    className="w-full h-14 rounded-2xl border-2 border-slate-200 text-slate-900 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-95 group"
                                >
                                    <Download className="h-5 w-5 group-hover:translate-y-0.5 transition-transform" />
                                    Télécharger le PDF
                                </a>
                                <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-black">Disponible pour impression</p>

                                {/* Bouton Explication IA — premium */}
                                <Link
                                    href={`/doc/${document.id}/explain`}
                                    className="w-full h-14 rounded-2xl bg-primary text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
                                >
                                    <Brain className="h-5 w-5" />
                                    Expliquer avec l&apos;IA
                                </Link>
                                <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-black">
                                    Premium — IA éducative
                                </p>
                            </div>

                            <div className="h-px bg-border" />

                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-900">Conseils Jàngatub</h3>
                                <div className="space-y-4">
                                    {[
                                        "Lisez attentivement l'énoncé en entier.",
                                        "Répartissez votre temps par question.",
                                        "Soignez la présentation de votre copie."
                                    ].map((tip, i) => (
                                        <div key={i} className="flex gap-3 text-sm text-muted-foreground items-start">
                                            <div className="mt-1">
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            </div>
                                            <p className="font-medium leading-relaxed">{tip}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Series/Level Card */}
                        <div className="premium-gradient-bg p-8 rounded-[2rem] text-white space-y-4 animate-in slide-in-from-right-8 duration-700">
                            <h4 className="text-lg font-bold">Preparation {document.level.name}</h4>
                            <p className="text-white/80 text-sm leading-relaxed">
                                Découvrez notre pack complet de révision pour le {document.level.name} incluant toutes les matières de spécialité.
                            </p>
                            <Link
                                href="/docs"
                                className="inline-flex items-center gap-2 font-bold text-white hover:underline underline-offset-4"
                            >
                                Voir les autres épreuves
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
