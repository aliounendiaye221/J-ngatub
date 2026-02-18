import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import SmartReader from '@/components/ui/SmartReader';
import ActionRow from './ActionRow';
import {
    ArrowLeft, Calendar, Sparkles, ShieldCheck,
    Brain, BookOpen, Clock, Zap
} from 'lucide-react';

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
        <div className="min-h-screen bg-[#F8FAFC] pb-24">
            {/* 2026 Header with blurred backdrop */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-white/20 px-6 py-4">
                <div className="container mx-auto flex items-center justify-between">
                    <Link
                        href="/docs"
                        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Retour</span>
                    </Link>
                    <h1 className="text-sm font-black text-slate-900 truncate max-w-[200px] sm:max-w-md">
                        {document.title}
                    </h1>
                    <div className="flex gap-2">
                        <span className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                            {document.subject.name}
                        </span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Main Content: Smart Reader (Takes 9 cols) */}
                    <div className="lg:col-span-9 space-y-6">
                        {/* Immersive Reader Component */}
                        <SmartReader
                            documentId={document.id}
                            pdfUrl={document.pdfUrl}
                            title={document.title}
                            initialMode="classic" // Defaulting to classic since we don't have OCR yet, but UI is ready
                        />

                        {/* Document Meta (under reader) */}
                        <div className="flex flex-wrap gap-6 p-6 rounded-3xl bg-white border shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Session</p>
                                    <p className="font-bold text-slate-900">{document.year}</p>
                                </div>
                            </div>
                            <div className="h-10 w-px bg-slate-100" />
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-green-50 text-green-600">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Statut</p>
                                    <p className="font-bold text-slate-900">Vérifié</p>
                                </div>
                            </div>
                            <div className="h-10 w-px bg-slate-100" />
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                                    <BookOpen className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Matière</p>
                                    <p className="font-bold text-slate-900">{document.subject.name}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Smart Tools (Takes 3 cols) */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* AI Assistant Card */}
                        <div className="rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-20"><Sparkles className="h-24 w-24" /></div>
                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                                        <Brain className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="font-black text-sm tracking-wide">Janga AI</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Besoin d&apos;aide ?</h3>
                                    <p className="text-indigo-100 text-sm leading-relaxed">
                                        Notre IA peut vous expliquer les parties difficiles de ce sujet ou générer une correction détaillée.
                                    </p>
                                </div>
                                <Link
                                    href={`/doc/${document.id}/explain?tab=assist`}
                                    className="block w-full py-4 rounded-xl bg-white text-indigo-600 font-bold text-sm text-center shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Lancer l&apos;assistant
                                </Link>
                            </div>
                        </div>

                        {/* Quiz IA Card */}
                        <div className="rounded-[2.5rem] bg-gradient-to-br from-purple-600 to-pink-600 p-6 text-white shadow-xl shadow-purple-500/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-20"><Zap className="h-24 w-24" /></div>
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                                        <Zap className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="font-black text-sm tracking-wide">Quiz IA</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-1">Testez vos connaissances</h3>
                                    <p className="text-purple-100 text-sm leading-relaxed">
                                        L&apos;IA génère un quiz directement à partir du contenu de ce sujet.
                                    </p>
                                </div>
                                <Link
                                    href={`/doc/${document.id}/explain?tab=quiz`}
                                    className="block w-full py-3.5 rounded-xl bg-white text-purple-600 font-bold text-sm text-center shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Générer un Quiz
                                </Link>
                            </div>
                        </div>

                        {/* Action List */}
                        <div className="bg-white rounded-[2rem] border shadow-sm p-2">
                            <ActionRow
                                iconName="Download"
                                label="Télécharger PDF"
                                href={document.pdfUrl}
                                external
                            />
                            <ActionRow
                                iconName="Share2"
                                label="Partager"
                                color="text-blue-500"
                                bg="bg-blue-50"
                            />
                            <ActionRow
                                iconName="AlertTriangle"
                                label="Signaler une erreur"
                                color="text-red-500"
                                bg="bg-red-50"
                            />
                        </div>

                        {/* Timer / Practice Mode */}
                        <div className="bg-white rounded-[2rem] border shadow-sm p-6 space-y-4">
                            <div className="flex items-center gap-2 font-black text-slate-900">
                                <Clock className="h-5 w-5 text-orange-500" />
                                Mode Entraînement
                            </div>
                            <p className="text-xs text-muted-foreground">Chronométrez-vous pour simuler les conditions d&apos;examen.</p>
                            <button className="w-full py-3 rounded-xl border-2 border-slate-100 font-bold text-sm hover:border-orange-500 hover:text-orange-500 transition-all">
                                Démarrer (2h)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


