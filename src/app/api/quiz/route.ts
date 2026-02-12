/**
 * GET /api/quiz
 * Liste les quiz disponibles, filtrés par niveau et matière.
 * 
 * POST /api/quiz
 * Crée un nouveau quiz (admin uniquement).
 * 
 * Accessible : GET = premium uniquement, POST = admin uniquement.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { quizCreateSchema } from "@/lib/validations";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        // Extraire les paramètres de filtrage
        const { searchParams } = new URL(req.url);
        const levelSlug = searchParams.get("level");
        const subjectSlug = searchParams.get("subject");

        // Construire le filtre Prisma
        const where: any = { isActive: true };
        if (levelSlug) where.level = { slug: levelSlug };
        if (subjectSlug) where.subject = { slug: subjectSlug };

        const quizzes = await prisma.quiz.findMany({
            where,
            include: {
                level: true,
                subject: true,
                _count: { select: { questions: true, attempts: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        // Récupérer les tentatives de l'utilisateur pour chaque quiz
        const userAttempts = await prisma.quizAttempt.findMany({
            where: { userId: session.user.id },
            orderBy: { completedAt: "desc" },
        });

        // Enrichir les quiz avec le meilleur score de l'utilisateur
        const enrichedQuizzes = quizzes.map((quiz: any) => {
            const attempts = userAttempts.filter((a: any) => a.quizId === quiz.id);
            const bestAttempt = attempts.length > 0
                ? attempts.reduce((best: any, a: any) => (a.score > best.score ? a : best))
                : null;

            return {
                ...quiz,
                userBestScore: bestAttempt?.score ?? null,
                userTotalPoints: bestAttempt?.totalPoints ?? null,
                userAttemptCount: attempts.length,
            };
        });

        return NextResponse.json(enrichedQuizzes);
    } catch (error) {
        console.error("[QUIZ_GET]", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const body = await req.json();
        const validation = quizCreateSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Données invalides", details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const { title, description, duration, levelId, subjectId, questions } = validation.data;

        // Créer le quiz avec ses questions en une seule transaction
        const quiz = await prisma.quiz.create({
            data: {
                title,
                description,
                duration,
                levelId,
                subjectId,
                questions: {
                    create: questions.map((q, index) => ({
                        question: q.question,
                        options: JSON.stringify(q.options),
                        correctAnswer: q.correctAnswer,
                        explanation: q.explanation,
                        points: q.points,
                        order: index,
                    })),
                },
            },
            include: {
                questions: true,
                level: true,
                subject: true,
            },
        });

        return NextResponse.json(quiz, { status: 201 });
    } catch (error) {
        console.error("[QUIZ_POST]", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
