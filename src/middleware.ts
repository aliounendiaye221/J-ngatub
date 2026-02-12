/**
 * Middleware Next.js — Protège les routes premium.
 * 
 * Vérifie que l'utilisateur est connecté ET premium pour accéder
 * aux fonctionnalités réservées (quiz, téléchargements, dashboard, etc.).
 * 
 * Les routes publiques et les PDF restent accessibles à tous.
 */

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Routes qui nécessitent un abonnement premium
const PREMIUM_PATHS = [
    "/quiz",
    "/download",
    "/profile/dashboard",
    "/certificates",
    "/support",
];

// Routes qui nécessitent uniquement d'être connecté
const AUTH_PATHS = [
    "/favorites",
    "/profile",
];

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl;
        const token = req.nextauth.token;

        // Vérifier les routes premium
        const isPremiumRoute = PREMIUM_PATHS.some((path) => pathname.startsWith(path));

        if (isPremiumRoute && !token?.isPremium) {
            // Rediriger vers la page pricing si pas premium
            const url = req.nextUrl.clone();
            url.pathname = "/pricing";
            url.searchParams.set("reason", "premium_required");
            return NextResponse.redirect(url);
        }

        // Vérifier les routes admin
        if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
            const url = req.nextUrl.clone();
            url.pathname = "/";
            return NextResponse.redirect(url);
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const { pathname } = req.nextUrl;

                // Routes premium et auth nécessitent d'être connecté
                const needsAuth = [
                    ...PREMIUM_PATHS,
                    ...AUTH_PATHS,
                    "/admin",
                ].some((path) => pathname.startsWith(path));

                // Les routes API premium nécessitent aussi l'auth
                const isProtectedApi = pathname.startsWith("/api/quiz") ||
                    pathname.startsWith("/api/download") ||
                    pathname.startsWith("/api/ai") ||
                    pathname.startsWith("/api/certificate") ||
                    pathname.startsWith("/api/support");

                if (needsAuth || isProtectedApi) {
                    return !!token;
                }

                // Toutes les autres routes sont publiques
                return true;
            },
        },
    }
);

export const config = {
    matcher: [
        // Routes protégées par auth
        "/favorites/:path*",
        "/profile/:path*",
        "/admin/:path*",
        // Routes premium
        "/quiz/:path*",
        "/download/:path*",
        "/certificates/:path*",
        "/support/:path*",
        // API premium
        "/api/quiz/:path*",
        "/api/download/:path*",
        "/api/ai/:path*",
        "/api/certificate/:path*",
        "/api/support/:path*",
    ],
};
