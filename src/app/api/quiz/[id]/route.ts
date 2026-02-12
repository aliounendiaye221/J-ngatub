/**
 * GET /api/quiz/[id]
 * 
 * Récupère un quiz spécifique avec ses questions pour l'afficher.
 * Ne retourne PAS la bonne réponse avant soumission (sécurité).
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const quiz = await prisma.quiz.findUnique({
            where: { id: params.id, isActive: true },
            include: {
                level: true,
                subject: true,
                questions: {
                    orderBy: { order: "asc" },
                    select: {
                        id: true,
                        question: true,
                        options: true,
                        points: true,
                        order: true,
                        // NE PAS envoyer correctAnswer ni explanation avant soumission
                    },
                },
            },
        });

        if (!quiz) {
            return NextResponse.json({ error: "Quiz introuvable" }, { status: 404 });
        }

        // Parser les options JSON pour chaque question
        const questionsWithParsedOptions = quiz.questions.map((q: any) => ({
            ...q,
            options: JSON.parse(q.options),
        }));

        return NextResponse.json({
            ...quiz,
            questions: questionsWithParsedOptions,
        });
    } catch (error) {
        console.error("[QUIZ_GET_BY_ID]", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
