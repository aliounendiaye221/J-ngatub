/**
 * POST /api/wave/webhook
 *
 * Webhook appelé par Wave lorsqu'un paiement est complété.
 * Active automatiquement l'abonnement Premium si le paiement réussit.
 *
 * Sécurité :
 * - Vérifie la signature Wave (HMAC-SHA256) si WAVE_WEBHOOK_SECRET est configuré
 * - Vérifie que la session existe et est en attente (PENDING)
 * - Empêche la double activation
 */

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyWaveWebhookSignature, getWaveCheckoutSession } from "@/lib/wave";
import type { WaveWebhookPayload } from "@/lib/wave";
import { WAVE_PLANS, type WavePlanId } from "@/lib/wave";

export async function POST(req: Request) {
    try {
        const rawBody = await req.text();
        const signature = req.headers.get("wave-signature") || "";

        // Vérifier la signature du webhook
        if (process.env.WAVE_WEBHOOK_SECRET) {
            const isValid = verifyWaveWebhookSignature(rawBody, signature);
            if (!isValid) {
                console.error("[WAVE_WEBHOOK] Signature invalide");
                return NextResponse.json(
                    { error: "Signature invalide" },
                    { status: 401 }
                );
            }
        }

        const payload: WaveWebhookPayload = JSON.parse(rawBody);

        // On ne traite que les événements de session complétée
        if (payload.type !== "checkout.session.completed") {
            return NextResponse.json({ received: true, ignored: true });
        }

        const waveSession = payload.data;
        const sessionId = waveSession.id;

        console.log("[WAVE_WEBHOOK] Session reçue:", sessionId, "status:", waveSession.payment_status);

        // Vérifier que le paiement est réussi
        if (waveSession.payment_status !== "succeeded") {
            console.log("[WAVE_WEBHOOK] Paiement non réussi:", waveSession.payment_status);

            // Marquer l'abonnement comme échoué
            await prisma.subscription.updateMany({
                where: { txRef: sessionId, status: "PENDING" },
                data: { status: "CANCELLED" },
            });

            return NextResponse.json({ received: true, activated: false });
        }

        // Double-vérification : récupérer la session directement depuis Wave
        let verifiedSession;
        try {
            verifiedSession = await getWaveCheckoutSession(sessionId);
            if (verifiedSession.payment_status !== "succeeded") {
                console.error("[WAVE_WEBHOOK] Vérification échouée — statut Wave:", verifiedSession.payment_status);
                return NextResponse.json({ error: "Paiement non vérifié" }, { status: 400 });
            }
        } catch (err) {
            console.error("[WAVE_WEBHOOK] Erreur vérification Wave:", err);
            // Continuer quand même si la vérification échoue (le webhook est déjà signé)
        }

        // Chercher l'abonnement PENDING correspondant
        const pendingSubscription = await prisma.subscription.findFirst({
            where: {
                txRef: sessionId,
                status: "PENDING",
                provider: "WAVE",
            },
            include: { user: true },
        });

        if (!pendingSubscription) {
            // Vérifier s'il est déjà activé (idempotence)
            const existingActive = await prisma.subscription.findFirst({
                where: { txRef: sessionId, status: "ACTIVE" },
            });

            if (existingActive) {
                console.log("[WAVE_WEBHOOK] Déjà activé — idempotent");
                return NextResponse.json({ received: true, activated: true, idempotent: true });
            }

            console.error("[WAVE_WEBHOOK] Abonnement PENDING introuvable pour session:", sessionId);
            return NextResponse.json(
                { error: "Abonnement introuvable" },
                { status: 404 }
            );
        }

        const userId = pendingSubscription.userId;
        const plan = pendingSubscription.plan as WavePlanId;
        const durationDays = WAVE_PLANS[plan]?.durationDays ?? 30;
        const endAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

        // Transaction : activer le premium
        await prisma.$transaction([
            // Annuler les anciennes souscriptions actives
            prisma.subscription.updateMany({
                where: {
                    userId,
                    status: "ACTIVE",
                    id: { not: pendingSubscription.id },
                },
                data: { status: "CANCELLED" },
            }),
            // Activer la nouvelle souscription
            prisma.subscription.update({
                where: { id: pendingSubscription.id },
                data: {
                    status: "ACTIVE",
                    startAt: new Date(),
                    endAt,
                },
            }),
            // Mettre à jour l'utilisateur
            prisma.user.update({
                where: { id: userId },
                data: { isPremium: true },
            }),
        ]);

        console.log("[WAVE_WEBHOOK] Premium activé pour user:", userId, "plan:", plan);

        return NextResponse.json({
            received: true,
            activated: true,
            userId,
            plan,
            endAt: endAt.toISOString(),
        });
    } catch (error) {
        console.error("[WAVE_WEBHOOK] Erreur:", error);
        return NextResponse.json(
            { error: "Erreur interne du webhook" },
            { status: 500 }
        );
    }
}
