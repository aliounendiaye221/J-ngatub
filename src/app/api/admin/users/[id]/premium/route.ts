import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const body = await req.json();
        const { isPremium } = body;
        const userId = params.id;

        // Désactiver toutes les souscriptions ACTIVE existantes avant de modifier
        await prisma.subscription.updateMany({
            where: { userId, status: "ACTIVE" },
            data: { status: isPremium ? "ACTIVE" : "CANCELLED" },
        });

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { isPremium },
        });

        // Si on active le premium, créer une seule nouvelle souscription
        if (isPremium) {
            // D'abord annuler les anciennes
            await prisma.subscription.updateMany({
                where: { userId, status: "ACTIVE" },
                data: { status: "CANCELLED" },
            });

            await prisma.subscription.create({
                data: {
                    userId,
                    plan: "ADMIN_ACTIVATE",
                    status: "ACTIVE",
                    startAt: new Date(),
                    // Pas de endAt pour une activation admin manuelle
                },
            });
        }

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("[ADMIN_USER_PREMIUM_PATCH]", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}
