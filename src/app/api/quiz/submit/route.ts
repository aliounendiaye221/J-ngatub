/**
 * POST /api/quiz/submit
 * 
 * Soumet les réponses d'un quiz et enregistre le score.
 * Accessible aux utilisateurs premium uniquement (protégé par middleware).
 * 
 * Body : { quizId: string, answers: number[] }
 * Retourne le score, le détail par question et si un badge a été gagné.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { quizSubmitSchema } from "@/lib/validations";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        // Valider le body
        const body = await req.json();
        const validation = quizSubmitSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Données invalides", details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const { quizId, answers } = validation.data;

        // Récupérer le quiz avec ses questions
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: { orderBy: { order: "asc" } },
                level: true,
                subject: true,
            },
        });

        if (!quiz) {
            return NextResponse.json({ error: "Quiz introuvable" }, { status: 404 });
        }

        // Vérifier que le nombre de réponses correspond
        if (answers.length !== quiz.questions.length) {
            return NextResponse.json(
                { error: `${quiz.questions.length} réponses attendues, ${answers.length} reçues` },
                { status: 400 }
            );
        }

        // Calculer le score
        let score = 0;
        const totalPoints = quiz.questions.reduce((sum: number, q: any) => sum + q.points, 0);

        const results = quiz.questions.map((question: any, index: number) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            if (isCorrect) score += question.points;

            return {
                questionId: question.id,
                question: question.question,
                options: JSON.parse(question.options),
                userAnswer,
                correctAnswer: question.correctAnswer,
                isCorrect,
                explanation: question.explanation,
                points: isCorrect ? question.points : 0,
            };
        });

        // Enregistrer la tentative
        const attempt = await prisma.quizAttempt.create({
            data: {
                userId: session.user.id,
                quizId,
                score,
                totalPoints,
                answers: JSON.stringify(answers),
            },
        });

        // Vérifier si un badge doit être attribué
        const percentage = (score / totalPoints) * 100;
        let badgeEarned = null;

        if (percentage === 100) {
            // Badge "Score parfait"
            badgeEarned = await awardBadgeIfNew(session.user.id, "perfect_score");
        } else if (percentage >= 80) {
            // Badge "Excellent"
            badgeEarned = await awardBadgeIfNew(session.user.id, "excellent");
        }

        // Vérifier badge "Premier quiz"
        const attemptCount = await prisma.quizAttempt.count({
            where: { userId: session.user.id },
        });
        if (attemptCount === 1) {
            const firstBadge = await awardBadgeIfNew(session.user.id, "first_quiz");
            if (!badgeEarned) badgeEarned = firstBadge;
        }

        return NextResponse.json({
            attemptId: attempt.id,
            quizTitle: quiz.title,
            level: quiz.level.name,
            subject: quiz.subject.name,
            score,
            totalPoints,
            percentage: Math.round(percentage),
            results,
            badgeEarned,
        });
    } catch (error) {
        console.error("[QUIZ_SUBMIT]", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

/**
 * Attribue un badge à l'utilisateur s'il ne l'a pas encore.
 * Retourne le badge si nouvellement attribué, null sinon.
 */
async function awardBadgeIfNew(userId: string, badgeName: string) {
    try {
        const badge = await prisma.badge.findUnique({ where: { name: badgeName } });
        if (!badge) return null;

        // Vérifier si le badge est déjà attribué
        const existing = await prisma.userBadge.findUnique({
            where: { userId_badgeId: { userId, badgeId: badge.id } },
        });

        if (existing) return null;

        // Attribuer le badge
        await prisma.userBadge.create({
            data: { userId, badgeId: badge.id },
        });

        return { name: badge.name, description: badge.description, icon: badge.icon };
    } catch {
        return null;
    }
}
