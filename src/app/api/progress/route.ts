/**
 * GET /api/progress
 * 
 * Récupère les données de progression de l'utilisateur connecté :
 * - Scores quiz par matière
 * - Historique des tentatives
 * - Statistiques globales
 * - Badges obtenus
 * - Documents favoris
 * 
 * Premium uniquement.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Force le rendu dynamique (cette route utilise headers via getServerSession)
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        // Récupérer toutes les données en parallèle
        const [attempts, badges, favoritesCount, user] = await Promise.all([
            // Tentatives de quiz avec infos du quiz
            prisma.quizAttempt.findMany({
                where: { userId: session.user.id },
                include: {
                    quiz: {
                        include: {
                            level: true,
                            subject: true,
                        },
                    },
                },
                orderBy: { completedAt: "desc" },
            }),
            // Badges de l'utilisateur
            prisma.userBadge.findMany({
                where: { userId: session.user.id },
                include: { badge: true },
                orderBy: { earnedAt: "desc" },
            }),
            // Nombre de favoris
            prisma.favorite.count({
                where: { userId: session.user.id },
            }),
            // Infos utilisateur
            prisma.user.findUnique({
                where: { id: session.user.id },
                include: {
                    subscriptions: {
                        where: { status: "ACTIVE" },
                        orderBy: { createdAt: "desc" },
                        take: 1,
                    },
                },
            }),
        ]);

        // ─── Statistiques globales ──────────────────────────────────
        const totalAttempts = attempts.length;
        const totalScore = attempts.reduce((sum: number, a: any) => sum + a.score, 0);
        const totalPossible = attempts.reduce((sum: number, a: any) => sum + a.totalPoints, 0);
        const averagePercentage = totalPossible > 0
            ? Math.round((totalScore / totalPossible) * 100)
            : 0;

        // ─── Scores par matière ─────────────────────────────────────
        const subjectStats: Record<string, {
            name: string;
            totalAttempts: number;
            totalScore: number;
            totalPossible: number;
            bestPercentage: number;
            averagePercentage: number;
        }> = {};

        attempts.forEach((a: any) => {
            const subjectName = a.quiz.subject.name;
            if (!subjectStats[subjectName]) {
                subjectStats[subjectName] = {
                    name: subjectName,
                    totalAttempts: 0,
                    totalScore: 0,
                    totalPossible: 0,
                    bestPercentage: 0,
                    averagePercentage: 0,
                };
            }

            const stats = subjectStats[subjectName];
            stats.totalAttempts++;
            stats.totalScore += a.score;
            stats.totalPossible += a.totalPoints;

            const pct = Math.round((a.score / a.totalPoints) * 100);
            if (pct > stats.bestPercentage) stats.bestPercentage = pct;
        });

        // Calculer la moyenne par matière
        Object.values(subjectStats).forEach((stats) => {
            stats.averagePercentage = stats.totalPossible > 0
                ? Math.round((stats.totalScore / stats.totalPossible) * 100)
                : 0;
        });

        // ─── Historique récent (10 dernières tentatives) ────────────
        const recentAttempts = attempts.slice(0, 10).map((a: any) => ({
            id: a.id,
            quizTitle: a.quiz.title,
            subject: a.quiz.subject.name,
            level: a.quiz.level.name,
            score: a.score,
            totalPoints: a.totalPoints,
            percentage: Math.round((a.score / a.totalPoints) * 100),
            completedAt: a.completedAt,
        }));

        // ─── Matières faibles (< 50% de moyenne) ───────────────────
        const weakSubjects = Object.values(subjectStats)
            .filter((s) => s.averagePercentage < 50 && s.totalAttempts >= 1)
            .sort((a, b) => a.averagePercentage - b.averagePercentage);

        // ─── Matières fortes (>= 80%) ──────────────────────────────
        const strongSubjects = Object.values(subjectStats)
            .filter((s) => s.averagePercentage >= 80 && s.totalAttempts >= 1)
            .sort((a, b) => b.averagePercentage - a.averagePercentage);

        return NextResponse.json({
            stats: {
                totalAttempts,
                averagePercentage,
                totalScore,
                totalPossible,
                favoritesCount,
                badgeCount: badges.length,
            },
            subjectStats: Object.values(subjectStats),
            recentAttempts,
            weakSubjects,
            strongSubjects,
            badges: badges.map((b: any) => ({
                name: b.badge.name,
                description: b.badge.description,
                icon: b.badge.icon,
                earnedAt: b.earnedAt,
            })),
            subscription: user?.subscriptions[0] || null,
        });
    } catch (error) {
        console.error("[PROGRESS_GET]", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
