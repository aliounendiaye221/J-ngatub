/**
 * POST /api/ai/generate-quiz
 *
 * Génère un quiz interactif basé sur un document (sujet d'examen).
 * Utilise Groq (Llama 3.3) pour créer des QCM pertinents.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { generateQuiz, isAIConfigured } from "@/lib/ai";
import { extractTextFromPDF, truncateForAI } from "@/lib/pdf-extract";

const generateQuizSchema = z.object({
    documentId: z.string().min(1, "ID du document requis"),
    numberOfQuestions: z.number().int().min(3).max(15).default(5),
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        // Quiz IA est accessible à tous les utilisateurs connectés

        const body = await req.json();
        const validation = generateQuizSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Données invalides", details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const { documentId, numberOfQuestions } = validation.data;

        const document = await prisma.document.findUnique({
            where: { id: documentId },
            include: { level: true, subject: true },
        });

        if (!document) {
            return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
        }

        if (!isAIConfigured()) {
            return NextResponse.json(
                { error: "L'IA n'est pas configurée. Configurez GROQ_API_KEY." },
                { status: 503 }
            );
        }

        // Extraire le texte du PDF pour générer un quiz basé sur le vrai contenu
        let documentContent: string | null = null;
        try {
            const rawText = await extractTextFromPDF(document.pdfUrl);
            if (rawText) {
                documentContent = truncateForAI(rawText, 10000);
            }
        } catch (e) {
            console.warn("[AI_QUIZ] Impossible d'extraire le texte du PDF:", e);
        }

        try {
            const quiz = await generateQuiz(
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

            return NextResponse.json({
                documentId: document.id,
                documentTitle: document.title,
                level: document.level.name,
                subject: document.subject.name,
                quiz,
                isAI: true,
            });
        } catch (error) {
            console.error("[AI_QUIZ_ERROR]", error);
            return NextResponse.json(
                { error: "Erreur lors de la génération du quiz. Réessayez." },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("[AI_GENERATE_QUIZ]", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
