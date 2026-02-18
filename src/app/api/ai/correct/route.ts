/**
 * POST /api/ai/correct
 *
 * Corrige la réponse d'un élève à un exercice d'un document.
 * Utilise Groq (Llama 3.3) pour fournir une correction pédagogique.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { correctAnswer, isAIConfigured } from "@/lib/ai";
import { extractTextFromPDF, truncateForAI } from "@/lib/pdf-extract";

const correctSchema = z.object({
    documentId: z.string().min(1, "ID du document requis"),
    exerciseNumber: z.string().min(1, "Numéro d'exercice requis"),
    studentAnswer: z.string().min(5, "Réponse trop courte (5 car. minimum)").max(5000),
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        if (!session.user.isPremium && session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Fonctionnalité réservée aux membres Premium" },
                { status: 403 }
            );
        }

        const body = await req.json();
        const validation = correctSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Données invalides", details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const { documentId, exerciseNumber, studentAnswer } = validation.data;

        const document = await prisma.document.findUnique({
            where: { id: documentId },
            include: { level: true, subject: true },
        });

        if (!document) {
            return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
        }

        // Extraire le texte du PDF pour que l'IA ait accès au sujet réel
        let documentContent: string | null = null;
        try {
            const rawText = await extractTextFromPDF(document.pdfUrl);
            if (rawText) {
                documentContent = truncateForAI(rawText);
            }
        } catch (e) {
            console.warn("[AI_CORRECT] Impossible d'extraire le texte du PDF:", e);
        }

        let correction: string;
        let isAI = false;

        if (isAIConfigured()) {
            try {
                correction = await correctAnswer(
                    {
                        title: document.title,
                        year: document.year,
                        type: document.type,
                        level: document.level.name,
                        subject: document.subject.name,
                    },
                    exerciseNumber,
                    studentAnswer,
                    documentContent
                );
                isAI = true;
            } catch (error) {
                console.error("[AI_CORRECT_ERROR]", error);
                correction = `## Correction de l'exercice ${exerciseNumber}

Votre réponse a été reçue. L'IA est temporairement indisponible pour la corriger.

### Votre réponse :
${studentAnswer}

### Conseil :
Comparez votre réponse avec le corrigé officiel disponible dans la bibliothèque.

---
*💡 Réessayez dans quelques instants pour obtenir une correction IA détaillée.*`;
            }
        } else {
            correction = `## Correction de l'exercice ${exerciseNumber}

### Votre réponse :
${studentAnswer}

### 📝 Analyse automatique
L'analyse IA n'est pas encore configurée. Voici quelques points de vérification :

1. **Structure** : Votre réponse est-elle bien structurée ?
2. **Justification** : Avez-vous justifié chaque étape ?
3. **Calculs** : Vos calculs sont-ils vérifiés ?
4. **Unités** : Les unités sont-elles correctes ?

---
*💡 Configurez GROQ_API_KEY pour des corrections IA personnalisées.*`;
        }

        return NextResponse.json({
            documentId: document.id,
            documentTitle: document.title,
            exerciseNumber,
            correction,
            isAI,
        });
    } catch (error) {
        console.error("[AI_CORRECT]", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
