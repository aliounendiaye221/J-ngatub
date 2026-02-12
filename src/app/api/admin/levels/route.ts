import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const levelSchema = z.object({
    name: z.string().min(2, "Nom trop court").max(100, "Nom trop long"),
    slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, "Slug invalide (lettres minuscules, chiffres, tirets)"),
});

const updateLevelSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(2).max(100).optional(),
    slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, "Slug invalide").optional(),
});

/**
 * GET /api/admin/levels
 * Liste tous les niveaux avec le nombre de documents et quiz associés
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const levels = await prisma.level.findMany({
            orderBy: { name: "asc" },
            include: {
                _count: {
                    select: { documents: true, quizzes: true },
                },
            },
        });

        return NextResponse.json(levels);
    } catch (error) {
        console.error("[LEVELS_GET]", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

/**
 * POST /api/admin/levels
 * Crée un nouveau niveau
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const body = await req.json();
        const validation = levelSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.errors[0].message },
                { status: 400 }
            );
        }

        const { name, slug } = validation.data;

        const existing = await prisma.level.findUnique({ where: { slug } });
        if (existing) {
            return NextResponse.json(
                { error: "Un niveau avec ce slug existe déjà" },
                { status: 409 }
            );
        }

        const level = await prisma.level.create({
            data: { name, slug },
        });

        return NextResponse.json(level, { status: 201 });
    } catch (error) {
        console.error("[LEVELS_POST]", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

/**
 * PUT /api/admin/levels
 * Met à jour un niveau existant
 */
export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const body = await req.json();
        const validation = updateLevelSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.errors[0].message },
                { status: 400 }
            );
        }

        const { id, ...data } = validation.data;

        if (data.slug) {
            const existing = await prisma.level.findFirst({
                where: { slug: data.slug, NOT: { id } },
            });
            if (existing) {
                return NextResponse.json(
                    { error: "Ce slug est déjà utilisé" },
                    { status: 409 }
                );
            }
        }

        const level = await prisma.level.update({
            where: { id },
            data,
        });

        return NextResponse.json(level);
    } catch (error) {
        console.error("[LEVELS_PUT]", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

/**
 * DELETE /api/admin/levels
 * Supprime un niveau (uniquement si aucun document/quiz rattaché)
 */
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id } = await req.json();
        if (!id) {
            return NextResponse.json({ error: "ID requis" }, { status: 400 });
        }

        const [docCount, quizCount] = await Promise.all([
            prisma.document.count({ where: { levelId: id } }),
            prisma.quiz.count({ where: { levelId: id } }),
        ]);

        if (docCount > 0 || quizCount > 0) {
            return NextResponse.json(
                { error: `Impossible de supprimer : ${docCount} document(s) et ${quizCount} quiz rattaché(s). Supprimez-les d'abord.` },
                { status: 400 }
            );
        }

        await prisma.level.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[LEVELS_DELETE]", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
