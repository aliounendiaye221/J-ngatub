import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { documentSchema } from "@/lib/validations";

/**
 * GET /api/admin/documents
 * Liste les documents ou renvoie les métadonnées (levels/subjects).
 * ?meta=levels → renvoie tous les niveaux
 * ?meta=subjects → renvoie toutes les matières
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const meta = searchParams.get("meta");

        // Retourner les niveaux
        if (meta === "levels") {
            const levels = await prisma.level.findMany({ orderBy: { name: "asc" } });
            return NextResponse.json(levels);
        }

        // Retourner les matières
        if (meta === "subjects") {
            const subjects = await prisma.subject.findMany({ orderBy: { name: "asc" } });
            return NextResponse.json(subjects);
        }

        // Sinon, liste des documents
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const skip = (page - 1) * limit;

        const [documents, total] = await Promise.all([
            prisma.document.findMany({
                include: { level: true, subject: true },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.document.count(),
        ]);

        return NextResponse.json({
            documents,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error("[ADMIN_DOCUMENTS_GET]", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}

/**
 * POST /api/admin/documents — Créer un document
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const body = await req.json();
        const validation = documentSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Données invalides", details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const document = await prisma.document.create({
            data: validation.data,
            include: { level: true, subject: true },
        });

        return NextResponse.json(document, { status: 201 });
    } catch (error) {
        console.error("[ADMIN_DOCUMENTS_POST]", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}

/**
 * PUT /api/admin/documents — Modifier un document
 * Body: { id, ...fields }
 */
export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const body = await req.json();
        const { id, ...data } = body;

        if (!id) {
            return NextResponse.json({ error: "ID du document requis" }, { status: 400 });
        }

        const validation = documentSchema.partial().safeParse(data);
        if (!validation.success) {
            return NextResponse.json(
                { error: "Données invalides", details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const document = await prisma.document.update({
            where: { id },
            data: validation.data,
            include: { level: true, subject: true },
        });

        return NextResponse.json(document);
    } catch (error) {
        console.error("[ADMIN_DOCUMENTS_PUT]", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}

/**
 * DELETE /api/admin/documents — Supprimer un document
 * Body: { id }
 */
export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const body = await req.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: "ID du document requis" }, { status: 400 });
        }

        await prisma.document.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[ADMIN_DOCUMENTS_DELETE]", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}
