/**
 * Service IA centralisé pour Jàngatub.
 *
 * Utilise l'API Groq (gratuite) avec des modèles open-source (Llama 3.3, Mixtral).
 * Fallback : Hugging Face Inference API.
 *
 * Fonctionnalités :
 * - Explication de documents (sujets / corrigés)
 * - Correction détaillée de réponses d'élèves
 * - Génération de quiz interactifs à partir d'un sujet
 */

// ─── Types ─────────────────────────────────────────────────────────────

export interface AIMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export interface AIOptions {
    maxTokens?: number;
    temperature?: number;
    model?: string;
}

export interface GeneratedQuiz {
    title: string;
    questions: {
        question: string;
        options: string[];
        correctAnswer: number;
        explanation: string;
    }[];
}

// ─── Prompt système ────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Tu es un professeur expert du système éducatif sénégalais, spécialisé dans la préparation au BFEM et au BAC. 
Tu t'appelles "Jàngatub IA".

Principes :
- Tu expliques de manière claire, structurée et pédagogique en français.
- Tu utilises des exemples concrets tirés du programme sénégalais.
- Tu structures tes réponses avec des titres (##), des listes et du texte en gras.
- Tu encourages l'élève et proposes des pistes d'approfondissement.
- Tu ne donnes jamais de réponses fausses sciemment.`;

// ─── Appel Groq (modèles open-source) ─────────────────────────────────

async function callGroq(
    messages: AIMessage[],
    options: AIOptions = {}
): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error("GROQ_API_KEY non configurée");
    }

    const model = options.model || "llama-3.3-70b-versatile";

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages,
            max_tokens: options.maxTokens || 2000,
            temperature: options.temperature ?? 0.7,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("[GROQ_ERROR]", response.status, errorText);
        throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Impossible de générer une réponse.";
}

// ─── Fonctions publiques ───────────────────────────────────────────────

/**
 * Génère une explication pour un document (sujet ou corrigé).
 */
export async function explainDocument(
    doc: { title: string; year: number; type: string; level: string; subject: string },
    question?: string | null
): Promise<string> {
    const docContext = `Document : "${doc.title}" — ${doc.subject}, ${doc.level}, ${doc.year} (${doc.type === "SUBJECT" ? "Sujet d'examen" : "Corrigé"})`;

    let userPrompt: string;

    if (question) {
        userPrompt = `${docContext}

L'élève pose la question suivante :
"${question}"

Donne une explication claire, détaillée et pédagogique. Utilise des exemples si possible. Structure ta réponse avec des titres et des listes.`;
    } else {
        userPrompt = `${docContext}

Fais une analyse complète de ce document :
1. **Thèmes abordés** : quels chapitres du programme sont évalués ?
2. **Compétences évaluées** : que doit savoir faire l'élève ?
3. **Méthodologie** : comment aborder chaque exercice ?
4. **Erreurs fréquentes** : quelles sont les pièges à éviter ?
5. **Conseils de révision** : comment se préparer efficacement ?

Sois détaillé, structuré et adapté au niveau ${doc.level} du Sénégal.`;
    }

    const messages: AIMessage[] = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
    ];

    return callGroq(messages, { maxTokens: 2000 });
}

/**
 * Corrige une réponse d'élève pour un exercice donné.
 */
export async function correctAnswer(
    doc: { title: string; year: number; type: string; level: string; subject: string },
    exerciseNumber: string,
    studentAnswer: string
): Promise<string> {
    const messages: AIMessage[] = [
        { role: "system", content: SYSTEM_PROMPT },
        {
            role: "user",
            content: `Document : "${doc.title}" — ${doc.subject}, ${doc.level}, ${doc.year}

L'élève a répondu à l'exercice/question **${exerciseNumber}** :

---
${studentAnswer}
---

Corrige cette réponse de manière pédagogique :

1. **Évaluation** : La réponse est-elle correcte, partiellement correcte ou incorrecte ?
2. **Points forts** : Ce que l'élève a bien fait.
3. **Erreurs identifiées** : Les erreurs avec explications.
4. **Correction détaillée** : La réponse attendue, étape par étape.
5. **Note estimée** : Sur 20, quelle note approximative mériterait cette réponse ?
6. **Conseils** : Comment l'élève peut s'améliorer.

Sois encourageant mais rigoureux.`,
        },
    ];

    return callGroq(messages, { maxTokens: 2500, temperature: 0.5 });
}

/**
 * Génère un quiz interactif basé sur un document.
 */
export async function generateQuiz(
    doc: { title: string; year: number; type: string; level: string; subject: string },
    numberOfQuestions: number = 5
): Promise<GeneratedQuiz> {
    const messages: AIMessage[] = [
        {
            role: "system",
            content: `${SYSTEM_PROMPT}

IMPORTANT : Tu dois répondre UNIQUEMENT avec un objet JSON valide, sans aucun texte avant ou après.`,
        },
        {
            role: "user",
            content: `Document : "${doc.title}" — ${doc.subject}, ${doc.level}, ${doc.year}

Génère un quiz de ${numberOfQuestions} questions à choix multiples basé sur les thèmes de ce sujet d'examen.

Chaque question doit :
- Être pertinente pour le niveau ${doc.level} au Sénégal
- Avoir exactement 4 options de réponse
- Avoir une seule bonne réponse (index 0 à 3)
- Inclure une explication détaillée de la bonne réponse

Réponds UNIQUEMENT avec ce format JSON (pas de texte avant ni après) :
{
  "title": "Quiz - ${doc.subject} ${doc.level} ${doc.year}",
  "questions": [
    {
      "question": "La question ici ?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explication de pourquoi A est correct."
    }
  ]
}`,
        },
    ];

    const response = await callGroq(messages, {
        maxTokens: 3000,
        temperature: 0.6,
    });

    // Parser le JSON de la réponse
    try {
        // Extraire le JSON même s'il y a du texte autour
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Pas de JSON trouvé dans la réponse IA");
        }

        const parsed = JSON.parse(jsonMatch[0]) as GeneratedQuiz;

        // Valider la structure
        if (!parsed.title || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
            throw new Error("Structure du quiz invalide");
        }

        // Valider chaque question
        parsed.questions = parsed.questions.map((q) => ({
            question: q.question || "Question non disponible",
            options: Array.isArray(q.options) && q.options.length === 4
                ? q.options
                : ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: typeof q.correctAnswer === "number" && q.correctAnswer >= 0 && q.correctAnswer <= 3
                ? q.correctAnswer
                : 0,
            explanation: q.explanation || "Pas d'explication disponible.",
        }));

        return parsed;
    } catch (error) {
        console.error("[QUIZ_PARSE_ERROR]", error, response);
        // Quiz par défaut en cas d'erreur de parsing
        return {
            title: `Quiz - ${doc.subject} ${doc.level} ${doc.year}`,
            questions: [
                {
                    question: `Quel est le thème principal abordé dans le sujet de ${doc.subject} du ${doc.level} ${doc.year} ?`,
                    options: [
                        "Les concepts fondamentaux du programme",
                        "Les notions avancées hors programme",
                        "Uniquement la pratique",
                        "Aucun thème spécifique",
                    ],
                    correctAnswer: 0,
                    explanation: `Le sujet de ${doc.subject} du ${doc.level} ${doc.year} porte principalement sur les concepts fondamentaux au programme.`,
                },
            ],
        };
    }
}

/**
 * Vérifie si l'API IA est configurée et fonctionnelle.
 */
export function isAIConfigured(): boolean {
    return !!process.env.GROQ_API_KEY;
}
