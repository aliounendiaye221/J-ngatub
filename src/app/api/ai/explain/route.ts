/**
 * POST /api/ai/explain
 * 
 * Génère une explication IA pour un document (sujet ou corrigé).
 * Premium uniquement (protégé par middleware).
 * 
 * Utilise l'API OpenAI si OPENAI_API_KEY est définie, sinon retourne
 * une explication mock pour le développement / Vercel Free Tier.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { aiExplainSchema } from "@/lib/validations";

export async function POST(req: Request) {
    try {
        // Vérifier l'authentification
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        // Vérifier le statut premium
        if (!session.user.isPremium) {
            return NextResponse.json(
                { error: "Fonctionnalité réservée aux membres Premium" },
                { status: 403 }
            );
        }

        // Valider le body
        const body = await req.json();
        const validation = aiExplainSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Données invalides", details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const { documentId, question } = validation.data;

        // Récupérer le document
        const document = await prisma.document.findUnique({
            where: { id: documentId },
            include: { level: true, subject: true },
        });

        if (!document) {
            return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
        }

        // Construire le prompt
        const prompt = buildPrompt(document, question);

        // Utiliser OpenAI si la clé est configurée, sinon mock
        let explanation: string;

        if (process.env.OPENAI_API_KEY) {
            explanation = await callOpenAI(prompt);
        } else {
            explanation = generateMockExplanation(document, question);
        }

        return NextResponse.json({
            documentId: document.id,
            documentTitle: document.title,
            level: document.level.name,
            subject: document.subject.name,
            question: question || "Explication générale",
            explanation,
            isAI: !!process.env.OPENAI_API_KEY,
        });
    } catch (error) {
        console.error("[AI_EXPLAIN]", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

/**
 * Construit le prompt pour l'API OpenAI.
 */
function buildPrompt(document: any, question?: string | null): string {
    const base = `Tu es un professeur expert au Sénégal, spécialisé en ${document.subject.name} pour le niveau ${document.level.name}.

Document : "${document.title}" (${document.year}, ${document.type === "SUBJECT" ? "Sujet d'examen" : "Corrigé"})

`;

    if (question) {
        return base + `L'élève pose la question suivante concernant ce document :\n"${question}"\n\nDonne une explication claire, détaillée et pédagogique en français. Utilise des exemples concrets si possible.`;
    }

    return base + `Donne une explication générale de ce ${document.type === "SUBJECT" ? "sujet d'examen" : "corrigé"} :\n- Les thèmes abordés\n- Les compétences évaluées\n- Les conseils de méthodologie pour bien répondre\n- Les erreurs fréquentes à éviter\n\nSois clair, détaillé et pédagogique en français.`;
}

/**
 * Appelle l'API OpenAI pour générer une explication.
 */
async function callOpenAI(prompt: string): Promise<string> {
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "Tu es un tuteur pédagogique expert du système éducatif sénégalais. Tu expliques de manière claire, structurée et accessible aux élèves de BFEM et BAC.",
                    },
                    { role: "user", content: prompt },
                ],
                max_tokens: 1500,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || "Impossible de générer une explication.";
    } catch (error) {
        console.error("[OPENAI_ERROR]", error);
        return "L'IA est temporairement indisponible. Veuillez réessayer plus tard.";
    }
}

/**
 * Génère une explication mock pour le développement sans clé OpenAI.
 */
function generateMockExplanation(document: any, question?: string | null): string {
    const tips = [
        "Lisez attentivement l'énoncé avant de commencer.",
        "Identifiez les mots-clés de chaque question.",
        "Gérez votre temps en allouant un temps proportionnel aux points de chaque exercice.",
        "Rédigez proprement et structurez vos réponses.",
        "Vérifiez vos calculs et relisez-vous avant de rendre votre copie.",
    ];

    return `## Analyse de "${document.title}"

### 📚 Informations
- **Matière** : ${document.subject.name}
- **Niveau** : ${document.level.name}  
- **Année** : ${document.year}
- **Type** : ${document.type === "SUBJECT" ? "Sujet d'examen" : "Corrigé détaillé"}

${question ? `### ❓ Votre question\n"${question}"\n\n### 💡 Réponse\nCette question porte sur un concept clé en ${document.subject.name}. Pour y répondre correctement, il faut maîtriser les notions fondamentales du programme de ${document.level.name}.\n\n` : ""}

### 🎯 Conseils de méthodologie

${tips.map((t, i) => `${i + 1}. ${t}`).join("\n")}

### ⚠️ Erreurs fréquentes à éviter
- Ne pas lire toutes les questions avant de commencer
- Oublier de justifier ses réponses
- Négliger la présentation de la copie
- Ne pas vérifier les unités dans les calculs

### 📝 Compétences évaluées
Ce ${document.type === "SUBJECT" ? "sujet" : "corrigé"} évalue votre capacité à :
- Analyser un problème et identifier la méthode appropriée
- Appliquer les formules et théorèmes du cours
- Rédiger une réponse structurée et argumentée
- Faire preuve d'esprit critique et de rigueur

---
*💡 Cette explication est générée automatiquement. Pour des explications IA plus détaillées, configurez votre clé OpenAI.*`;
}
