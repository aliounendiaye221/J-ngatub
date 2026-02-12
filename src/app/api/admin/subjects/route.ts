import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const subjectSchema = z.object({
    name: z.string().min(2, "Nom trop court").max(100, "Nom trop long"),
    slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, "Slug invalide (lettres minuscules, chiffres, tirets)"),
});

const updateSubjectSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(2).max(100).optional(),
    slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, "Slug invalide").optional(),
});

/**
 * GET /api/admin/subjects
 * Liste toutes les matières avec le nombre de documents associés
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const subjects = await prisma.subject.findMany({
            orderBy: { name: "asc" },
            include: {
                _count: {
                    select: { documents: true, quizzes: true },
                },
            },
        });

        return NextResponse.json(subjects);
    } catch (error) {
        console.error("[SUBJECTS_GET]", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

/**
 * POST /api/admin/subjects
 * Crée une nouvelle matière
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const body = await req.json();
        const validation = subjectSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.errors[0].message },
                { status: 400 }
            );
        }

        const { name, slug } = validation.data;

        // Vérifier l'unicité du slug
        const existing = await prisma.subject.findUnique({ where: { slug } });
        if (existing) {
            return NextResponse.json(
                { error: "Une matière avec ce slug existe déjà" },
                { status: 409 }
            );
        }

        const subject = await prisma.subject.create({
            data: { name, slug },
        });

        return NextResponse.json(subject, { status: 201 });
    } catch (error) {
        console.error("[SUBJECTS_POST]", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

/**
 * PUT /api/admin/subjects
 * Met à jour une matière existante
 */
export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const body = await req.json();
        const validation = updateSubjectSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.errors[0].message },
                { status: 400 }
            );
        }

        const { id, ...data } = validation.data;

        // Si slug modifié, vérifier l'unicité
        if (data.slug) {
            const existing = await prisma.subject.findFirst({
                where: { slug: data.slug, NOT: { id } },
            });
            if (existing) {
                return NextResponse.json(
                    { error: "Ce slug est déjà utilisé" },
                    { status: 409 }
                );
            }
        }

        const subject = await prisma.subject.update({
            where: { id },
            data,
        });

        return NextResponse.json(subject);
    } catch (error) {
        console.error("[SUBJECTS_PUT]", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

/**
 * DELETE /api/admin/subjects
 * Supprime une matière (uniquement si aucun document/quiz rattaché)
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

        // Vérifier les dépendances
        const [docCount, quizCount] = await Promise.all([
            prisma.document.count({ where: { subjectId: id } }),
            prisma.quiz.count({ where: { subjectId: id } }),
        ]);

        if (docCount > 0 || quizCount > 0) {
            return NextResponse.json(
                { error: `Impossible de supprimer : ${docCount} document(s) et ${quizCount} quiz rattaché(s). Supprimez-les d'abord.` },
                { status: 400 }
            );
        }

        await prisma.subject.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[SUBJECTS_DELETE]", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
