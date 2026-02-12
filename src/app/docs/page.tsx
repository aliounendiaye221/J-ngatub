export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import DocumentCard from '@/components/ui/DocumentCard';
import DocumentFilters from '@/components/documents/DocumentFilters';
import { Prisma } from '@prisma/client';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sparkles, BookOpen } from 'lucide-react';

export default async function DocsPage({
    searchParams,
}: {
    searchParams: { q?: string; level?: string; subject?: string; year?: string };
}) {
    const { q, level, subject, year } = searchParams;

    // Build where clause
    const where: Prisma.DocumentWhereInput = {};

    if (q) {
        // SQLite ne supporte pas mode: 'insensitive', contains est insensible par défaut
        where.title = { contains: q };
    }

    if (level && level !== 'all') {
        where.level = { slug: level };
    }

    if (subject && subject !== 'all') {
        where.subject = { slug: subject };
    }

    if (year && year !== 'all') {
        where.year = parseInt(year);
    }

    const session = await getServerSession(authOptions);

    const [documents, levels, subjects, userFavorites] = await Promise.all([
        prisma.document.findMany({
            where,
            include: {
                level: true,
                subject: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        }),
        prisma.level.findMany({ orderBy: { name: 'asc' } }),
        prisma.subject.findMany({ orderBy: { name: 'asc' } }),
        session?.user ? prisma.favorite.findMany({
            where: { userId: session.user.id }
        }) : Promise.resolve([]),
    ]);

    const favoriteIds = new Set(userFavorites.map(f => f.documentId));

    return (
        <div className="min-h-screen bg-slate-50/50 pb-24">
            {/* Page Header */}
            <div className="bg-white border-b mb-12">
                <div className="container mx-auto px-6 py-16">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="space-y-4 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/10">
                                <Sparkles className="h-4 w-4" />
                                <span>Ressources Pédagogiques</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                                Bibliothèque Numérique <br />
                                <span className="premium-gradient-text">Jàngatub</span>
                            </h1>
                            <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                                Accédez à une collection complète de sujets d&apos;examen et de corrigés officiels pour booster vos révisions.
                            </p>
                        </div>
                        <div className="h-32 w-32 rounded-[2.5rem] bg-slate-100 flex items-center justify-center text-slate-300">
                            <BookOpen className="h-16 w-16" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 space-y-12">
                <DocumentFilters levels={levels} subjects={subjects} />

                <div className="flex items-center justify-between border-b pb-4">
                    <h2 className="font-black text-xl tracking-tight">
                        {documents.length} document{documents.length > 1 ? 's' : ''} trouvé{documents.length > 1 ? 's' : ''}
                    </h2>
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Trié par : Récent
                    </div>
                </div>

                {documents.length === 0 ? (
                    <div className="glass-card rounded-[3rem] p-20 text-center space-y-6 bg-white/50">
                        <div className="mx-auto h-20 w-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                            <BookOpen className="h-10 w-10" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-2xl font-black">Aucun document trouvé</p>
                            <p className="text-muted-foreground max-w-md mx-auto">Nous n&apos;avons pas de documents correspondant à vos filtres. Essayez d&apos;élargir votre recherche.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {documents.map((doc) => (
                            <DocumentCard
                                key={doc.id}
                                document={doc as any}
                                isFavorited={favoriteIds.has(doc.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
