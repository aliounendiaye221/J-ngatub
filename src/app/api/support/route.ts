/**
 * API route /api/support — Gestion des tickets de support.
 * 
 * GET  : Liste les tickets de l'utilisateur connecté (ou tous pour admin).
 * POST : Crée un nouveau ticket de support.
 * PATCH: Admin répond / change le statut d'un ticket.
 * 
 * Premium uniquement (protégé par middleware).
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supportTicketSchema, supportReplySchema } from "@/lib/validations";

// ─── GET : Lister les tickets ──────────────────────────────────────

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const isAdmin = (session.user as any).role === "ADMIN";

        // Admin voit tous les tickets, utilisateur voit les siens
        const tickets = await prisma.supportTicket.findMany({
            where: isAdmin ? {} : { userId: session.user.id },
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { name: true, email: true } },
            },
        });

        return NextResponse.json({ tickets });
    } catch (error) {
        console.error("[SUPPORT GET]", error);
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        );
    }
}

// ─── POST : Créer un ticket ────────────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const body = await req.json();
        const parsed = supportTicketSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Données invalides", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { subject, message, priority } = parsed.data;

        // Vérifier que l'utilisateur est premium
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { isPremium: true },
        });

        if (!user?.isPremium) {
            return NextResponse.json(
                { error: "Fonctionnalité réservée aux membres Premium" },
                { status: 403 }
            );
        }

        // Créer le ticket
        const ticket = await prisma.supportTicket.create({
            data: {
                userId: session.user.id,
                subject,
                message,
                priority,
                status: "OPEN",
            },
        });

        return NextResponse.json({ ticket }, { status: 201 });
    } catch (error) {
        console.error("[SUPPORT POST]", error);
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        );
    }
}

// ─── PATCH : Répondre / Mettre à jour un ticket (Admin) ────────────

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const isAdmin = (session.user as any).role === "ADMIN";
        if (!isAdmin) {
            return NextResponse.json(
                { error: "Réservé aux administrateurs" },
                { status: 403 }
            );
        }

        const body = await req.json();
        const parsed = supportReplySchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Données invalides", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { ticketId, response, status } = parsed.data;

        // Mettre à jour le ticket avec la réponse admin
        const ticket = await prisma.supportTicket.update({
            where: { id: ticketId },
            data: {
                response,
                ...(status && { status }),
                respondedAt: new Date(),
            },
        });

        return NextResponse.json({ ticket });
    } catch (error) {
        console.error("[SUPPORT PATCH]", error);
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        );
    }
}
