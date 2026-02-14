/**
 * POST /api/wave/checkout
 *
 * Crée une session de paiement Wave pour un abonnement Premium.
 * Retourne l'URL de redirection vers le paiement Wave.
 *
 * Body : { plan: "PREMIUM_MONTHLY" | "PREMIUM_ANNUAL" }
 * Response : { checkoutUrl: string, sessionId: string }
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createWaveCheckoutSession, isWaveConfigured, type WavePlanId, WAVE_PLANS } from "@/lib/wave";

const checkoutSchema = z.object({
    plan: z.enum(["PREMIUM_MONTHLY", "PREMIUM_ANNUAL"]),
});

export async function POST(req: Request) {
    try {
        // Vérifier l'authentification
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: "Vous devez être connecté pour souscrire" },
                { status: 401 }
            );
        }

        // Vérifier si déjà premium
        if (session.user.isPremium) {
            return NextResponse.json(
                { error: "Vous êtes déjà abonné Premium" },
                { status: 400 }
            );
        }

        // Vérifier si Wave est configuré
        if (!isWaveConfigured()) {
            return NextResponse.json(
                { error: "Le paiement Wave n'est pas encore configuré" },
                { status: 503 }
            );
        }

        // Valider le body
        const body = await req.json();
        const validation = checkoutSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Plan invalide", details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const { plan } = validation.data;

        // Créer une référence unique : userId_plan_timestamp
        const clientReference = `${session.user.id}_${plan}_${Date.now()}`;

        // Créer la session Wave Checkout
        const waveSession = await createWaveCheckoutSession(
            plan as WavePlanId,
            clientReference
        );

        // Sauvegarder la session en attente dans la base
        // On crée un abonnement PENDING qu'on activera via webhook
        await prisma.subscription.create({
            data: {
                userId: session.user.id,
                plan,
                provider: "WAVE",
                txRef: waveSession.id, // ID de la session Wave
                status: "PENDING",
                startAt: new Date(),
                endAt: new Date(Date.now() + WAVE_PLANS[plan as WavePlanId].durationDays * 24 * 60 * 60 * 1000),
            },
        });

        return NextResponse.json({
            checkoutUrl: waveSession.wave_launch_url,
            sessionId: waveSession.id,
            plan,
            amount: WAVE_PLANS[plan as WavePlanId].amount,
        });
    } catch (error) {
        console.error("[WAVE_CHECKOUT]", error);
        return NextResponse.json(
            { error: "Erreur lors de la création du paiement. Veuillez réessayer." },
            { status: 500 }
        );
    }
}
