/**
 * Service Wave Checkout pour Jàngatub.
 *
 * Intègre l'API Wave pour les paiements mobiles au Sénégal.
 * Documentation : https://docs.wave.com
 *
 * Flux :
 * 1. Créer une session checkout → obtenir wave_launch_url
 * 2. Rediriger l'utilisateur vers wave_launch_url (paiement via app Wave)
 * 3. Wave envoie un webhook à /api/wave/webhook avec le résultat
 * 4. On active l'abonnement premium si le paiement est réussi
 */

const WAVE_API_URL = "https://api.wave.com/v1";

// ─── Types ─────────────────────────────────────────────────────────────

export interface WaveCheckoutSession {
    id: string;
    checkout_status: "open" | "complete" | "expired";
    client_reference: string | null;
    currency: string;
    amount: string;
    payment_status: "succeeded" | "pending" | "failed" | "cancelled";
    wave_launch_url: string;
    when_created: string;
    when_completed: string | null;
    when_expires: string;
    business_name: string;
    last_payment_error: string | null;
    transaction_id: string | null;
}

export interface WaveWebhookPayload {
    id: string;
    type: "checkout.session.completed";
    data: WaveCheckoutSession;
}

// ─── Plans et tarifs ───────────────────────────────────────────────────

export const WAVE_PLANS = {
    PREMIUM_MONTHLY: {
        amount: "2500",
        label: "Jàngatub Premium Mensuel",
        durationDays: 30,
    },
    PREMIUM_ANNUAL: {
        amount: "20000",
        label: "Jàngatub Premium Annuel",
        durationDays: 365,
    },
} as const;

export type WavePlanId = keyof typeof WAVE_PLANS;

// ─── Fonctions API Wave ────────────────────────────────────────────────

/**
 * Crée une session de paiement Wave Checkout.
 *
 * @param plan - Le plan premium choisi (PREMIUM_MONTHLY ou PREMIUM_ANNUAL)
 * @param clientReference - Référence unique pour identifier la transaction (userId + plan + timestamp)
 * @returns La session Wave avec l'URL de redirection
 */
export async function createWaveCheckoutSession(
    plan: WavePlanId,
    clientReference: string
): Promise<WaveCheckoutSession> {
    const apiKey = process.env.WAVE_API_KEY;
    if (!apiKey) {
        throw new Error("WAVE_API_KEY non configurée");
    }

    const planConfig = WAVE_PLANS[plan];
    if (!planConfig) {
        throw new Error(`Plan inconnu : ${plan}`);
    }

    const successUrl = `${process.env.NEXTAUTH_URL}/pricing/success?session_id={checkout_session_id}`;
    const errorUrl = `${process.env.NEXTAUTH_URL}/pricing?error=payment_failed`;

    const response = await fetch(`${WAVE_API_URL}/checkout/sessions`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            amount: planConfig.amount,
            currency: "XOF",
            client_reference: clientReference,
            error_url: errorUrl,
            success_url: successUrl,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("[WAVE_CREATE_SESSION]", response.status, errorText);
        throw new Error(`Wave API error: ${response.status} — ${errorText}`);
    }

    const session: WaveCheckoutSession = await response.json();
    return session;
}

/**
 * Récupère les détails d'une session checkout existante.
 */
export async function getWaveCheckoutSession(
    sessionId: string
): Promise<WaveCheckoutSession> {
    const apiKey = process.env.WAVE_API_KEY;
    if (!apiKey) {
        throw new Error("WAVE_API_KEY non configurée");
    }

    const response = await fetch(`${WAVE_API_URL}/checkout/sessions/${sessionId}`, {
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Wave API error: ${response.status}`);
    }

    return response.json();
}

/**
 * Vérifie la signature du webhook Wave pour s'assurer de l'authenticité.
 * Wave envoie un header `Wave-Signature` avec un HMAC-SHA256.
 */
export function verifyWaveWebhookSignature(
    payload: string,
    signature: string
): boolean {
    const secret = process.env.WAVE_WEBHOOK_SECRET;
    if (!secret) {
        console.warn("[WAVE_WEBHOOK] WAVE_WEBHOOK_SECRET non configuré — vérification ignorée en dev");
        return true; // En dev, on accepte tout
    }

    // Vérification HMAC-SHA256
    try {
        const crypto = require("crypto");
        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(payload)
            .digest("hex");

        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );
    } catch {
        return false;
    }
}

/**
 * Vérifie si l'API Wave est configurée.
 */
export function isWaveConfigured(): boolean {
    return !!process.env.WAVE_API_KEY;
}
