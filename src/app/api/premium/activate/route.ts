import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * POST /api/premium/activate
 *
 * Active l'abonnement premium pour l'utilisateur connecté.
 * Nécessite une preuve de paiement (paymentRef + provider).
 *
 * Fournisseurs supportés : WAVE, ORANGE_MONEY
 * Le flux attendu :
 * 1. L'utilisateur initie le paiement sur Wave/Orange Money
 * 2. Le paiement est vérifié côté serveur (webhook ou vérification manuelle)
 * 3. Cette route est appelée avec la référence de transaction
 */

const activateSchema = z.object({
    plan: z.enum(["PREMIUM_MONTHLY", "PREMIUM_ANNUAL"]),
    provider: z.enum(["WAVE", "ORANGE_MONEY"]),
    paymentRef: z.string().min(1, "Référence de paiement requise"),
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: "Vous devez être connecté" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const validation = activateSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Données invalides", details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const { plan, provider, paymentRef } = validation.data;

        // Vérifier que la référence de paiement n'a pas déjà été utilisée
        const existingTx = await prisma.subscription.findFirst({
            where: { txRef: paymentRef },
        });

        if (existingTx) {
            return NextResponse.json(
                { error: "Cette référence de paiement a déjà été utilisée" },
                { status: 409 }
            );
        }

        // TODO: Vérifier le paiement auprès du fournisseur
        // Pour Wave : appel API Wave pour vérifier la transaction
        // Pour Orange Money : appel API Orange Money pour vérifier
        // Exemple :
        // const isValid = await verifyPayment(provider, paymentRef);
        // if (!isValid) {
        //     return NextResponse.json({ error: "Paiement non vérifié" }, { status: 402 });
        // }

        // Durée de l'abonnement selon le plan
        const durationDays = plan === "PREMIUM_ANNUAL" ? 365 : 30;
        const endAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

        // Annuler les anciennes souscriptions actives
        await prisma.subscription.updateMany({
            where: { userId: session.user.id, status: "ACTIVE" },
            data: { status: "CANCELLED" },
        });

        // Transaction : activer le premium + créer la souscription
        await prisma.$transaction([
            prisma.user.update({
                where: { id: session.user.id },
                data: { isPremium: true },
            }),
            prisma.subscription.create({
                data: {
                    userId: session.user.id,
                    plan,
                    provider,
                    txRef: paymentRef,
                    status: "ACTIVE",
                    startAt: new Date(),
                    endAt,
                },
            }),
        ]);

        return NextResponse.json({
            success: true,
            message: "Abonnement premium activé avec succès",
            plan,
            endAt: endAt.toISOString(),
        });
    } catch (error) {
        console.error("[PREMIUM_ACTIVATE]", error);
        return NextResponse.json(
            { error: "Erreur interne du serveur" },
            { status: 500 }
        );
    }
}
