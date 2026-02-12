/**
 * Utilitaires pour la gestion du statut premium.
 * 
 * Centralise la vérification du statut premium de l'utilisateur,
 * utilisé par le middleware et les API routes premium.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

/**
 * Vérifie si l'utilisateur connecté est premium avec un abonnement actif.
 * 
 * @returns L'objet utilisateur avec son statut premium, ou null si non connecté.
 */
export async function checkPremiumStatus() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return { isAuthenticated: false, isPremium: false, user: null };
    }

    // Vérifier si l'utilisateur a un abonnement actif et non expiré
    const activeSubscription = await prisma.subscription.findFirst({
        where: {
            userId: session.user.id,
            status: "ACTIVE",
            OR: [
                { endAt: null },                     // Abonnement sans fin (admin)
                { endAt: { gte: new Date() } },      // Abonnement non expiré
            ],
        },
        orderBy: { createdAt: "desc" },
    });

    const isPremium = !!activeSubscription;

    // Mettre à jour le flag isPremium si désynchronisé
    if (session.user.isPremium !== isPremium) {
        await prisma.user.update({
            where: { id: session.user.id },
            data: { isPremium },
        });
    }

    return {
        isAuthenticated: true,
        isPremium,
        user: session.user,
        subscription: activeSubscription,
    };
}

/**
 * Liste des routes qui nécessitent un abonnement premium.
 * Utilisé par le middleware et la navigation conditionnelle.
 */
export const PREMIUM_ROUTES = [
    "/quiz",
    "/download",
    "/doc/*/explain",
    "/profile/dashboard",
    "/certificates",
    "/support",
] as const;

/**
 * Vérifie si un chemin correspond à une route premium.
 */
export function isPremiumRoute(pathname: string): boolean {
    return PREMIUM_ROUTES.some((route) => {
        // Transformer le pattern en regex (remplacer * par .+)
        const pattern = route.replace(/\*/g, ".+");
        return new RegExp(`^${pattern}`).test(pathname);
    });
}
