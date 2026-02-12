export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import DocumentCard from '@/components/ui/DocumentCard';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GraduationCap, Sparkles } from 'lucide-react';

export default async function BfemPage() {
    const session = await getServerSession(authOptions);

    const [bfemDocs, userFavorites] = await Promise.all([
        prisma.document.findMany({
            where: {
                level: { slug: 'bfem' }
            },
            include: {
                level: true,
                subject: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        }),
        session?.user ? prisma.favorite.findMany({
            where: { userId: session.user.id }
        }) : Promise.resolve([]),
    ]);

    const favoriteIds = new Set(userFavorites.map(f => f.documentId));

    return (
        <div className="min-h-screen bg-slate-50/50 pb-24">
            <div className="bg-white border-b mb-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="container mx-auto px-6 py-20 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="space-y-4 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-black uppercase tracking-widest border border-blue-200">
                                <GraduationCap className="h-4 w-4" />
                                <span>Diplôme d&apos;État</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                                Espace <span className="premium-gradient-text">BFEM</span> <br />
                                Sénégal
                            </h1>
                            <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                                Préparez votre Brevet de Fin d&apos;Études Moyennes avec notre sélection exclusive d&apos;annales et de corrigés officiels.
                            </p>
                        </div>
                        <div className="hidden lg:flex h-40 w-40 rounded-[3rem] bg-blue-50 items-center justify-center text-blue-200">
                            <GraduationCap className="h-20 w-20" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 space-y-12">
                <div className="flex items-center justify-between border-b pb-4">
                    <h2 className="font-black text-xl tracking-tight">Liste des ressources BFEM</h2>
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        {bfemDocs.length} Documents Disponibles
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {bfemDocs.map((doc) => (
                        <DocumentCard
                            key={doc.id}
                            document={doc as any}
                            isFavorited={favoriteIds.has(doc.id)}
                        />
                    ))}
                </div>

                {bfemDocs.length === 0 && (
                    <div className="glass-card rounded-[3rem] p-20 text-center space-y-4 bg-white/50">
                        <p className="text-2xl font-black">Bientôt disponible</p>
                        <p className="text-muted-foreground">Les documents BFEM sont en cours de chargement dans la bibliothèque.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
