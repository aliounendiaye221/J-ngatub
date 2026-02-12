/**
 * POST /api/download/pack
 * 
 * Génère un lien de téléchargement groupé pour un pack de documents.
 * Filtre par niveau, matière et/ou année.
 * Réservé aux utilisateurs premium (protégé par middleware).
 * 
 * Note : Sur Vercel Free Tier, on retourne la liste des URLs individuelles
 * plutôt que de générer un zip (pas de fs en serverless).
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { downloadPackSchema } from "@/lib/validations";

export async function POST(req: Request) {
    try {
        // Vérifier l'authentification
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        // Vérifier le statut premium
        if (!session.user.isPremium) {
            return NextResponse.json(
                { error: "Fonctionnalité réservée aux membres Premium" },
                { status: 403 }
            );
        }

        // Valider le body
        const body = await req.json();
        const validation = downloadPackSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Données invalides", details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const { levelSlug, subjectSlug, year } = validation.data;

        // Construire le filtre
        const where: any = {
            level: { slug: levelSlug },
        };
        if (subjectSlug) where.subject = { slug: subjectSlug };
        if (year) where.year = year;

        // Récupérer les documents correspondants
        const documents = await prisma.document.findMany({
            where,
            include: {
                level: true,
                subject: true,
            },
            orderBy: [
                { subject: { name: "asc" } },
                { year: "desc" },
                { type: "asc" },
            ],
        });

        if (documents.length === 0) {
            return NextResponse.json(
                { error: "Aucun document trouvé pour ces critères" },
                { status: 404 }
            );
        }

        // Retourner la liste des documents avec leurs URLs (compatible Vercel Free Tier)
        const pack = {
            packName: `Pack ${documents[0].level.name}${subjectSlug ? ` - ${documents[0].subject.name}` : ""}${year ? ` ${year}` : ""}`,
            totalDocuments: documents.length,
            documents: documents.map((doc) => ({
                id: doc.id,
                title: doc.title,
                type: doc.type,
                year: doc.year,
                subject: doc.subject.name,
                pdfUrl: doc.pdfUrl,
            })),
        };

        return NextResponse.json(pack);
    } catch (error) {
        console.error("[DOWNLOAD_PACK]", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
