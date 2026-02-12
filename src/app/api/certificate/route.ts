/**
 * GET /api/certificate
 * Liste les certificats de l'utilisateur connecté.
 * 
 * POST /api/certificate
 * Génère un nouveau certificat si l'utilisateur remplit les conditions.
 * 
 * Conditions pour générer un certificat :
 * - Être premium
 * - Avoir complété au moins 5 quiz d'un même niveau
 * - Avoir un score moyen >= 70% pour ce niveau
 * 
 * Le certificat est généré comme un HTML/PDF simplifié (compatible Vercel Free Tier).
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        // Récupérer les certificats de l'utilisateur
        const certificates = await prisma.certificate.findMany({
            where: { userId: session.user.id },
            orderBy: { issuedAt: "desc" },
        });

        // Récupérer les badges de l'utilisateur
        const badges = await prisma.userBadge.findMany({
            where: { userId: session.user.id },
            include: { badge: true },
            orderBy: { earnedAt: "desc" },
        });

        // Vérifier les certificats disponibles (non encore générés)
        const levels = await prisma.level.findMany();
        const availableCertificates = [];

        for (const level of levels) {
            // Compter les quiz complétés pour ce niveau
            const attempts = await prisma.quizAttempt.findMany({
                where: {
                    userId: session.user.id,
                    quiz: { levelId: level.id },
                },
            });

            if (attempts.length >= 5) {
                const totalScore = attempts.reduce((s: number, a: any) => s + a.score, 0);
                const totalPossible = attempts.reduce((s: number, a: any) => s + a.totalPoints, 0);
                const avgPercentage = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;

                if (avgPercentage >= 70) {
                    // Vérifier si le certificat existe déjà
                    const existing = certificates.find((c: any) =>
                        c.title.includes(level.name)
                    );

                    if (!existing) {
                        availableCertificates.push({
                            levelId: level.id,
                            levelName: level.name,
                            quizCount: attempts.length,
                            averageScore: avgPercentage,
                        });
                    }
                }
            }
        }

        return NextResponse.json({
            certificates,
            badges: badges.map((b: any) => ({
                id: b.id,
                name: b.badge.name,
                description: b.badge.description,
                icon: b.badge.icon,
                earnedAt: b.earnedAt,
            })),
            availableCertificates,
        });
    } catch (error) {
        console.error("[CERTIFICATE_GET]", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        if (!session.user.isPremium) {
            return NextResponse.json(
                { error: "Fonctionnalité réservée aux membres Premium" },
                { status: 403 }
            );
        }

        const { levelId } = await req.json();
        if (!levelId) {
            return NextResponse.json({ error: "ID du niveau requis" }, { status: 400 });
        }

        const level = await prisma.level.findUnique({ where: { id: levelId } });
        if (!level) {
            return NextResponse.json({ error: "Niveau introuvable" }, { status: 404 });
        }

        // Vérifier les conditions
        const attempts = await prisma.quizAttempt.findMany({
            where: {
                userId: session.user.id,
                quiz: { levelId },
            },
        });

        if (attempts.length < 5) {
            return NextResponse.json(
                { error: `Il faut au moins 5 quiz complétés (actuel: ${attempts.length})` },
                { status: 400 }
            );
        }

        const totalScore = attempts.reduce((s: number, a: any) => s + a.score, 0);
        const totalPossible = attempts.reduce((s: number, a: any) => s + a.totalPoints, 0);
        const avgPercentage = Math.round((totalScore / totalPossible) * 100);

        if (avgPercentage < 70) {
            return NextResponse.json(
                { error: `Score moyen insuffisant : ${avgPercentage}% (minimum 70%)` },
                { status: 400 }
            );
        }

        // Créer le certificat
        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        const certificate = await prisma.certificate.create({
            data: {
                userId: session.user.id,
                title: `Certificat de réussite — ${level.name}`,
                // Le PDF est généré côté client car Vercel Free Tier n'a pas puppeteer
                pdfUrl: null,
            },
        });

        return NextResponse.json({
            certificate,
            userName: user?.name || "Élève Jàngatub",
            levelName: level.name,
            averageScore: avgPercentage,
            quizCount: attempts.length,
        }, { status: 201 });
    } catch (error) {
        console.error("[CERTIFICATE_POST]", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
