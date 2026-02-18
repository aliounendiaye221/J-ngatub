/**
 * POST /api/ai/explain
 *
 * Génère une explication IA pour un document (sujet ou corrigé).
 * Utilise Groq (Llama 3.3 open-source) — gratuit et ultra-rapide.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { aiExplainSchema } from "@/lib/validations";
import { explainDocument, isAIConfigured } from "@/lib/ai";
import { extractTextFromPDF, truncateForAI } from "@/lib/pdf-extract";

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
        const validation = aiExplainSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Données invalides", details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const { documentId, question } = validation.data;

        const document = await prisma.document.findUnique({
            where: { id: documentId },
            include: { level: true, subject: true },
        });

        if (!document) {
            return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
        }

        // Extraire le texte du PDF pour le donner à l'IA
        let documentContent: string | null = null;
        try {
            const rawText = await extractTextFromPDF(document.pdfUrl);
            if (rawText) {
                documentContent = truncateForAI(rawText);
            }
        } catch (e) {
            console.warn("[AI_EXPLAIN] Impossible d'extraire le texte du PDF:", e);
        }

        let explanation: string;
        let isAI = false;

        if (isAIConfigured()) {
            try {
                explanation = await explainDocument(
                    {
                        title: document.title,
                        year: document.year,
                        type: document.type,
                        level: document.level.name,
                        subject: document.subject.name,
                    },
                    question,
                    documentContent
                );
                isAI = true;
            } catch (error) {
                console.error("[AI_EXPLAIN_ERROR]", error);
                explanation = generateFallback(document, question);
            }
        } else {
            explanation = generateFallback(document, question);
        }

        return NextResponse.json({
            documentId: document.id,
            documentTitle: document.title,
            level: document.level.name,
            subject: document.subject.name,
            question: question || "Explication générale",
            explanation,
            isAI,
        });
    } catch (error) {
        console.error("[AI_EXPLAIN]", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

function generateFallback(document: any, question?: string | null): string {
    return `## Analyse de "${document.title}"

### 📚 Informations
- **Matière** : ${document.subject.name}
- **Niveau** : ${document.level.name}
- **Année** : ${document.year}
- **Type** : ${document.type === "SUBJECT" ? "Sujet d'examen" : "Corrigé détaillé"}

${question ? `### ❓ Votre question\n"${question}"\n\nCette question concerne un concept clé en ${document.subject.name}. Pour une explication IA détaillée, veuillez configurer la clé Groq.\n\n` : ""}

### 🎯 Conseils de méthodologie
1. Lisez attentivement l'énoncé avant de commencer.
2. Identifiez les mots-clés de chaque question.
3. Gérez votre temps proportionnellement aux points.
4. Rédigez proprement et structurez vos réponses.
5. Vérifiez vos calculs et relisez-vous.

---
*💡 Configurez GROQ_API_KEY pour des explications IA détaillées avec Llama 3.3.*`;
}
