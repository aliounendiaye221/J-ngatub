/**
 * POST /api/admin/quiz/generate
 * 
 * Génère un quiz complet avec l'IA à partir d'un document (sujet PDF),
 * et le sauvegarde directement en base de données.
 * 
 * Ce quiz sera utilisé par les élèves pour l'obtention de certificats.
 * Accessible : admin uniquement.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { generateAdminQuiz, isAIConfigured } from "@/lib/ai";
import { extractTextFromPDF, truncateForAI } from "@/lib/pdf-extract";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        if (!isAIConfigured()) {
            return NextResponse.json(
                { error: "L'IA n'est pas configurée. Vérifiez GROQ_API_KEY." },
                { status: 503 }
            );
        }

        const body = await req.json();
        const { documentId, numberOfQuestions = 10 } = body;

        if (!documentId) {
            return NextResponse.json(
                { error: "documentId requis" },
                { status: 400 }
            );
        }

        if (typeof numberOfQuestions !== "number" || numberOfQuestions < 5 || numberOfQuestions > 30) {
            return NextResponse.json(
                { error: "numberOfQuestions doit être entre 5 et 30" },
                { status: 400 }
            );
        }

        // Récupérer le document avec ses relations
        const document = await prisma.document.findUnique({
            where: { id: documentId },
            include: { level: true, subject: true },
        });

        if (!document) {
            return NextResponse.json(
                { error: "Document introuvable" },
                { status: 404 }
            );
        }

        // Extraire le texte du PDF
        let documentContent: string | null = null;
        if (document.pdfUrl) {
            const rawText = await extractTextFromPDF(document.pdfUrl);
            if (rawText) {
                documentContent = truncateForAI(rawText, 12000);
            }
        }

        // Générer le quiz avec l'IA
        const generatedQuiz = await generateAdminQuiz(
            {
                title: document.title,
                year: document.year,
                type: document.type,
                level: document.level.name,
                subject: document.subject.name,
            },
            numberOfQuestions,
            documentContent
        );

        // Sauvegarder le quiz en base de données
        const quiz = await prisma.quiz.create({
            data: {
                title: generatedQuiz.title,
                description: generatedQuiz.description,
                duration: generatedQuiz.duration,
                levelId: document.levelId,
                subjectId: document.subjectId,
                isActive: true,
                questions: {
                    create: generatedQuiz.questions.map((q, index) => ({
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

        return NextResponse.json({
            success: true,
            quiz: {
                id: quiz.id,
                title: quiz.title,
                description: quiz.description,
                duration: quiz.duration,
                level: quiz.level.name,
                subject: quiz.subject.name,
                questionsCount: quiz.questions.length,
            },
            message: `Quiz "${quiz.title}" créé avec ${quiz.questions.length} questions !`,
        }, { status: 201 });

    } catch (error: any) {
        console.error("[ADMIN_QUIZ_GENERATE]", error);
        return NextResponse.json(
            { error: error.message || "Erreur lors de la génération du quiz" },
            { status: 500 }
        );
    }
}
