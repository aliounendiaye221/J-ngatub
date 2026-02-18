/**
 * POST /api/ai/assist
 *
 * Assistant IA complet pour les documents : transcription lisible,
 * explication d'exercice, formules, démarche de résolution.
 * Utilise Groq (Llama 3.3 open-source).
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { aiAssistSchema } from "@/lib/validations";
import {
    transcribeSubject,
    explainExercise,
    provideFormulas,
    provideMethodology,
    fullAssist,
    isAIConfigured,
    type AIAssistAction,
} from "@/lib/ai";
import { extractTextFromPDF, truncateForAI } from "@/lib/pdf-extract";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        // Premium ou Admin requis
        if (!session.user.isPremium && session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Fonctionnalité réservée aux membres Premium" },
                { status: 403 }
            );
        }

        const body = await req.json();
        const validation = aiAssistSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Données invalides", details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const { documentId, action, exerciseText, exerciseNumber } = validation.data;

        const document = await prisma.document.findUnique({
            where: { id: documentId },
            include: { level: true, subject: true },
        });

        if (!document) {
            return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
        }

        // Extraire le texte du PDF pour que l'IA ait accès au contenu réel
        let documentContent: string | null = null;
        try {
            const rawText = await extractTextFromPDF(document.pdfUrl);
            if (rawText) {
                documentContent = truncateForAI(rawText);
            }
        } catch (e) {
            console.warn("[AI_ASSIST] Impossible d'extraire le texte du PDF:", e);
        }

        if (!isAIConfigured()) {
            return NextResponse.json(
                {
                    error: "L'IA n'est pas configurée",
                    result: generateFallback(action, document, exerciseText, exerciseNumber),
                    isAI: false,
                },
                { status: 200 }
            );
        }

        const doc = {
            title: document.title,
            year: document.year,
            type: document.type,
            level: document.level.name,
            subject: document.subject.name,
        };

        let result: string;

        try {
            switch (action) {
                case "transcribe":
                    result = await transcribeSubject(doc, exerciseText, documentContent);
                    break;
                case "explain_exercise":
                    result = await explainExercise(doc, exerciseText, exerciseNumber, documentContent);
                    break;
                case "formulas":
                    result = await provideFormulas(doc, exerciseText, exerciseNumber, documentContent);
                    break;
                case "methodology":
                    result = await provideMethodology(doc, exerciseText, exerciseNumber, documentContent);
                    break;
                case "full_assist":
                    result = await fullAssist(doc, exerciseText, exerciseNumber, documentContent);
                    break;
                default:
                    result = await fullAssist(doc, exerciseText, exerciseNumber, documentContent);
            }
        } catch (error) {
            console.error("[AI_ASSIST_ERROR]", error);
            result = generateFallback(action, document, exerciseText, exerciseNumber);
            return NextResponse.json({
                documentId: document.id,
                documentTitle: document.title,
                level: document.level.name,
                subject: document.subject.name,
                action,
                result,
                isAI: false,
            });
        }

        return NextResponse.json({
            documentId: document.id,
            documentTitle: document.title,
            level: document.level.name,
            subject: document.subject.name,
            action,
            result,
            isAI: true,
        });
    } catch (error) {
        console.error("[AI_ASSIST]", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

function generateFallback(
    action: string,
    document: any,
    exerciseText?: string,
    exerciseNumber?: string
): string {
    const actionLabels: Record<string, string> = {
        transcribe: "Transcription du sujet",
        explain_exercise: "Explication de l'exercice",
        formulas: "Formules et théorèmes",
        methodology: "Démarche de résolution",
        full_assist: "Assistance complète",
    };

    const label = actionLabels[action] || "Assistance IA";

    return `## ${label}

### 📚 Document
- **Titre** : ${document.title}
- **Matière** : ${document.subject.name}
- **Niveau** : ${document.level.name}
- **Année** : ${document.year}

${exerciseNumber ? `### 📝 ${exerciseNumber}\n` : ""}
${exerciseText ? `### Texte fourni\n${exerciseText}\n` : ""}

### ℹ️ Information
L'IA est temporairement indisponible pour fournir une ${label.toLowerCase()}.

**En attendant, voici quelques conseils :**
1. Relisez attentivement l'énoncé et identifiez les données.
2. Repérez les mots-clés qui indiquent la méthode à utiliser.
3. Consultez votre cours pour retrouver les formules utiles.
4. Procédez étape par étape sans sauter de calculs.
5. Vérifiez vos résultats en les réinjectant dans l'énoncé.

---
*💡 Réessayez dans quelques instants pour obtenir une réponse IA détaillée.*`;
}
