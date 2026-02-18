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
 * @param documentContent - Texte extrait du PDF (optionnel mais recommandé)
 */
export async function explainDocument(
    doc: { title: string; year: number; type: string; level: string; subject: string },
    question?: string | null,
    documentContent?: string | null
): Promise<string> {
    const docContext = `Document : "${doc.title}" — ${doc.subject}, ${doc.level}, ${doc.year} (${doc.type === "SUBJECT" ? "Sujet d'examen" : "Corrigé"})`;

    const contentBlock = documentContent
        ? `\n\nVoici le contenu COMPLET du document (extrait du PDF) :\n---DÉBUT DU DOCUMENT---\n${documentContent}\n---FIN DU DOCUMENT---\n\nBase-toi sur ce contenu RÉEL pour ton analyse. Ne devine pas, utilise le texte exact du document.`
        : "";

    let userPrompt: string;

    if (question) {
        userPrompt = `${docContext}${contentBlock}

L'élève pose la question suivante :
"${question}"

Donne une explication claire, détaillée et pédagogique en te basant sur le contenu réel du document. Utilise des exemples si possible. Structure ta réponse avec des titres et des listes.`;
    } else {
        userPrompt = `${docContext}${contentBlock}

Fais une analyse complète de ce document en te basant sur son contenu réel :
1. **Contenu du sujet** : quels exercices sont présents ? Décris-les brièvement.
2. **Thèmes abordés** : quels chapitres du programme sont évalués ?
3. **Compétences évaluées** : que doit savoir faire l'élève ?
4. **Méthodologie** : comment aborder chaque exercice ?
5. **Erreurs fréquentes** : quelles sont les pièges à éviter ?
6. **Conseils de révision** : comment se préparer efficacement ?

Sois détaillé, structuré et adapté au niveau ${doc.level} du Sénégal.`;
    }

    const messages: AIMessage[] = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
    ];

    return callGroq(messages, { maxTokens: 3000 });
}

/**
 * Corrige une réponse d'élève pour un exercice donné.
 * @param documentContent - Texte extrait du PDF pour une correction basée sur le vrai sujet
 */
export async function correctAnswer(
    doc: { title: string; year: number; type: string; level: string; subject: string },
    exerciseNumber: string,
    studentAnswer: string,
    documentContent?: string | null
): Promise<string> {
    const contentBlock = documentContent
        ? `\n\nVoici le contenu COMPLET du sujet d'examen (extrait du PDF) :\n---DÉBUT DU DOCUMENT---\n${documentContent}\n---FIN DU DOCUMENT---\n\nUtilise ce contenu réel pour identifier l'exercice et corriger précisément la réponse de l'élève.`
        : "";

    const messages: AIMessage[] = [
        { role: "system", content: SYSTEM_PROMPT },
        {
            role: "user",
            content: `Document : "${doc.title}" — ${doc.subject}, ${doc.level}, ${doc.year}${contentBlock}

L'élève a répondu à l'exercice/question **${exerciseNumber}** :

---
${studentAnswer}
---

Corrige cette réponse de manière pédagogique en te basant sur le contenu réel du sujet :

1. **Évaluation** : La réponse est-elle correcte, partiellement correcte ou incorrecte ?
2. **Points forts** : Ce que l'élève a bien fait.
3. **Erreurs identifiées** : Les erreurs avec explications.
4. **Correction détaillée** : La réponse attendue, étape par étape.
5. **Note estimée** : Sur 20, quelle note approximative mériterait cette réponse ?
6. **Conseils** : Comment l'élève peut s'améliorer.

Sois encourageant mais rigoureux.`,
        },
    ];

    return callGroq(messages, { maxTokens: 3000, temperature: 0.5 });
}

/**
 * Génère un quiz interactif basé sur un document.
 */
export async function generateQuiz(
    doc: { title: string; year: number; type: string; level: string; subject: string },
    numberOfQuestions: number = 5,
    documentContent?: string | null
): Promise<GeneratedQuiz> {
    const hasContent = !!documentContent;
    const contentBlock = documentContent
        ? `\n\nVoici le contenu COMPLET du sujet d'examen (extrait du PDF) :\n---DÉBUT DU DOCUMENT---\n${documentContent}\n---FIN DU DOCUMENT---`
        : "";

    const messages: AIMessage[] = [
        {
            role: "system",
            content: `${SYSTEM_PROMPT}

IMPORTANT : Tu dois répondre UNIQUEMENT avec un objet JSON valide, sans aucun texte avant ou après.`,
        },
        {
            role: "user",
            content: `Document : "${doc.title}" — ${doc.subject}, ${doc.level}, ${doc.year}${contentBlock}

Génère un quiz de ${numberOfQuestions} questions à choix multiples.

${hasContent ? `RÈGLES CRITIQUES :
- Chaque question doit être DIRECTEMENT tirée du contenu réel du sujet ci-dessus.
- Reprends les exercices, les données, les énoncés exacts du document.
- Pose des questions sur les calculs, formules, et raisonnements demandés dans le sujet.
- Inclus des questions de compréhension de l'énoncé (ex: "Dans l'exercice 2, quelle grandeur est demandée ?").
- Inclus des questions sur les formules à utiliser pour résoudre les exercices du sujet.
- Inclus des questions sur les résultats attendus pour certains calculs du sujet.
- Ne pose JAMAIS de questions générales qui ne sont pas liées au contenu spécifique de ce document.` : `Génère des questions basées sur les thèmes typiques de ${doc.subject} au ${doc.level} pour la session ${doc.year}.`}

Chaque question doit :
- Être pertinente pour le niveau ${doc.level} au Sénégal
- Avoir exactement 4 options de réponse
- Avoir une seule bonne réponse (index 0 à 3)
- Inclure une explication détaillée de la bonne réponse
- Varier les types : compréhension, calcul, application de formule, piège classique

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
        maxTokens: 4000,
        temperature: 0.5,
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

// ─── Nouvelles fonctionnalités IA avancées ─────────────────────────────

export type AIAssistAction = "transcribe" | "explain_exercise" | "formulas" | "methodology" | "full_assist";

export interface AIAssistRequest {
    action: AIAssistAction;
    doc: { title: string; year: number; type: string; level: string; subject: string };
    exerciseText?: string;       // Texte de l'exercice copié/collé par l'élève
    exerciseNumber?: string;     // Ex: "Exercice 2", "Question 3a"
}

/**
 * Recopie / transcrit le sujet de façon lisible et structurée.
 * L'IA reconstruit le contenu typique d'un examen à partir des métadonnées,
 * ou reformule le texte fourni par l'élève.
 */
export async function transcribeSubject(
    doc: AIAssistRequest["doc"],
    exerciseText?: string,
    documentContent?: string | null
): Promise<string> {
    const docContext = `Document : "${doc.title}" — ${doc.subject}, ${doc.level}, ${doc.year} (${doc.type === "SUBJECT" ? "Sujet d'examen" : "Corrigé"})`;

    const contentBlock = documentContent
        ? `\n\nVoici le contenu COMPLET du document (extrait du PDF) :\n---DÉBUT DU DOCUMENT---\n${documentContent}\n---FIN DU DOCUMENT---`
        : "";

    let userPrompt: string;

    if (exerciseText) {
        userPrompt = `${docContext}${contentBlock}

L'élève a copié/photographié le texte suivant d'un sujet d'examen. Il est peut-être mal formaté, illisible ou incomplet.

Texte brut de l'élève :
---
${exerciseText}
---

Ta mission :
1. **Recopie le sujet de façon propre et lisible** en corrigeant la mise en forme.
2. **Numérote** clairement chaque exercice, partie et sous-question.
3. **Reformule** les consignes ambiguës pour les rendre claires.
4. **Identifie** les données, les inconnues et ce qui est demandé pour chaque question.
5. Si des éléments semblent manquants (figures, tableaux), **indique-le** clairement.

Utilise un format Markdown propre avec des titres, des listes et du texte en gras.`;
    } else if (documentContent) {
        userPrompt = `${docContext}${contentBlock}

À partir du contenu RÉEL du document ci-dessus :
1. **Recopie le sujet intégralement** de façon propre, lisible et bien structurée.
2. **Numérote** clairement chaque exercice, partie et sous-question.
3. **Reformule** les consignes pour les rendre parfaitement claires.
4. **Identifie** les données et ce qui est demandé pour chaque question.
5. Si des éléments sont illisibles ou manquants, **indique-le** clairement.

Utilise un format Markdown propre avec des titres, des listes et du texte en gras.`;
    } else {
        userPrompt = `${docContext}

L'élève souhaite une version lisible et bien structurée de ce type de sujet d'examen.

Basé sur ta connaissance des examens du ${doc.level} au Sénégal en ${doc.subject} (session ${doc.year}), propose :
1. **La structure typique** de ce type de sujet (nombre d'exercices, barème, durée).
2. **Les thèmes probables** abordés dans chaque exercice.
3. **Le type de questions** attendues (calcul, raisonnement, application, etc.).
4. **Les données typiques** qu'on retrouve dans ce genre de sujet.

Présente cela comme un guide de lecture du sujet, bien structuré en Markdown.`;
    }

    const messages: AIMessage[] = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
    ];

    return callGroq(messages, { maxTokens: 4000, temperature: 0.3 });
}

/**
 * Explique un exercice clairement : ce qu'on demande, les concepts, les pièges.
 */
export async function explainExercise(
    doc: AIAssistRequest["doc"],
    exerciseText?: string,
    exerciseNumber?: string,
    documentContent?: string | null
): Promise<string> {
    const docContext = `Document : "${doc.title}" — ${doc.subject}, ${doc.level}, ${doc.year}`;
    const exNum = exerciseNumber || "l'exercice";

    const contentBlock = documentContent
        ? `\n\nVoici le contenu COMPLET du sujet (extrait du PDF) :\n---DÉBUT DU DOCUMENT---\n${documentContent}\n---FIN DU DOCUMENT---\n\nBase-toi sur le contenu réel ci-dessus.`
        : "";

    let userPrompt: string;

    if (exerciseText) {
        userPrompt = `${docContext}${contentBlock}

Voici le texte de ${exNum} recopié par l'élève :
---
${exerciseText}
---

Explique cet exercice de manière claire et pédagogique :

## 📖 Compréhension de l'énoncé
- Reformule ce que l'exercice demande en langage simple.
- Identifie les **données** fournies et les **inconnues** à trouver.
- Précise le **type de problème** (application directe, problème ouvert, démonstration, etc.)

## 🧠 Concepts et notions nécessaires
- Liste les **chapitres du cours** concernés.
- Rappelle les **définitions clés** nécessaires.
- Explique les **liens** entre les différentes notions.

## ⚠️ Pièges et erreurs fréquentes
- Identifie les **pièges** classiques dans ce type d'exercice.
- Indique les **erreurs** que les élèves font souvent.
- Donne des **astuces** pour les éviter.

## 💡 Indices pour commencer
- Donne 2-3 **pistes** sans donner la réponse directement.
- Suggère par quelle question commencer.

Sois encourageant et adapté au niveau ${doc.level}.`;
    } else {
        userPrompt = `${docContext}${contentBlock}

L'élève souhaite comprendre comment aborder ${exNum} de ce sujet.

${documentContent ? "En te basant sur le contenu réel du document ci-dessus, e" : "E"}xplique :
1. **Comment lire et comprendre l'énoncé** de ce sujet en ${doc.subject} au ${doc.level}.
2. **Les exercices présents** : décris chaque exercice et ce qu'il demande.
3. **Les concepts clés** nécessaires pour chaque exercice.
4. **Les pièges classiques** à éviter.
5. **Les réflexes à avoir** face à chaque type de question.

Sois détaillé, structuré et pédagogique.`;
    }

    const messages: AIMessage[] = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
    ];

    return callGroq(messages, { maxTokens: 3000, temperature: 0.5 });
}

/**
 * Donne les formules et théorèmes nécessaires pour résoudre un exercice.
 */
export async function provideFormulas(
    doc: AIAssistRequest["doc"],
    exerciseText?: string,
    exerciseNumber?: string,
    documentContent?: string | null
): Promise<string> {
    const docContext = `Document : "${doc.title}" — ${doc.subject}, ${doc.level}, ${doc.year}`;
    const exNum = exerciseNumber || "ce sujet";

    const contentBlock = documentContent
        ? `\n\nVoici le contenu COMPLET du sujet (extrait du PDF) :\n---DÉBUT DU DOCUMENT---\n${documentContent}\n---FIN DU DOCUMENT---\n\nBase-toi sur le contenu réel ci-dessus pour identifier les formules nécessaires.`
        : "";

    let userPrompt: string;

    if (exerciseText) {
        userPrompt = `${docContext}${contentBlock}

Voici le texte de ${exNum} :
---
${exerciseText}
---

Donne TOUTES les formules, théorèmes et propriétés nécessaires pour résoudre cet exercice :

## 📐 Formules nécessaires
Pour chaque formule :
- **Nom** de la formule / du théorème
- **Énoncé** complet et précis
- **Conditions d'application** (quand l'utiliser)
- **Variables** : que représente chaque lettre

## 📚 Théorèmes et propriétés
- Liste les théorèmes pertinents avec leur énoncé.
- Précise les **hypothèses** nécessaires pour les appliquer.

## 🔗 Liens entre les formules
- Explique dans quel **ordre** utiliser ces formules.
- Montre comment elles **s'enchaînent** dans la résolution.

## 📝 Mémo rapide
Résume toutes les formules dans un tableau ou une liste concise pour révision rapide.

Sois exhaustif et précis. Utilise la notation mathématique standard.`;
    } else {
        userPrompt = `${docContext}${contentBlock}

L'élève prépare l'examen de ${doc.subject} au ${doc.level} (session ${doc.year}).

${documentContent ? "En te basant sur le contenu réel du document, d" : "D"}onne-lui toutes les **formules nécessaires** :

## 📐 Formules nécessaires pour ce sujet
- Classe les formules par exercice/thème présent dans le sujet.
- Pour chaque formule : nom, énoncé, conditions d'utilisation.
- Inclus les théorèmes importants.

## 🎯 Formules les plus importantes
- Identifie les formules clés pour chaque exercice du sujet.
- Pour chacune, donne un exemple d'application.

## 💡 Astuces de mémorisation
- Propose des moyens mnémotechniques.
- Des schémas mentaux pour retenir les formules.

Sois complet et adapté au programme du ${doc.level} au Sénégal.`;
    }

    const messages: AIMessage[] = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
    ];

    return callGroq(messages, { maxTokens: 3000, temperature: 0.3 });
}

/**
 * Donne une démarche / méthodologie de résolution étape par étape.
 */
export async function provideMethodology(
    doc: AIAssistRequest["doc"],
    exerciseText?: string,
    exerciseNumber?: string,
    documentContent?: string | null
): Promise<string> {
    const docContext = `Document : "${doc.title}" — ${doc.subject}, ${doc.level}, ${doc.year}`;
    const exNum = exerciseNumber || "cet exercice";

    const contentBlock = documentContent
        ? `\n\nVoici le contenu COMPLET du sujet (extrait du PDF) :\n---DÉBUT DU DOCUMENT---\n${documentContent}\n---FIN DU DOCUMENT---\n\nBase-toi sur le contenu réel ci-dessus pour ta méthodologie.`
        : "";

    let userPrompt: string;

    if (exerciseText) {
        userPrompt = `${docContext}${contentBlock}

Voici le texte de ${exNum} :
---
${exerciseText}
---

Donne une **démarche de résolution complète**, étape par étape :

## 🗺️ Plan de résolution

Pour chaque question/partie de l'exercice, donne :

### Étape 1 : Analyse de l'énoncé
- Ce qui est donné (données)
- Ce qui est demandé (inconnues)
- Le type de raisonnement à adopter

### Étape 2 : Choix de la méthode
- Quelle formule ou quel théorème utiliser
- Pourquoi cette méthode est la bonne
- Les alternatives possibles

### Étape 3 : Mise en œuvre
- Les calculs à effectuer **dans l'ordre**
- Les étapes intermédiaires à ne pas oublier
- La rédaction attendue (comment présenter sa réponse)

### Étape 4 : Vérification
- Comment vérifier son résultat
- Les ordres de grandeur attendus
- Les erreurs à vérifier

## ✅ Checklist de rédaction
- Les points essentiels à ne pas oublier dans la copie
- La présentation attendue par les correcteurs
- Les mots-clés à utiliser

## ⏱️ Gestion du temps
- Temps approximatif à consacrer à cet exercice
- Quelle partie traiter en priorité

**IMPORTANT** : Guide l'élève sans donner directement les réponses. L'objectif est qu'il comprenne la démarche pour pouvoir la reproduire seul.`;
    } else {
        userPrompt = `${docContext}${contentBlock}

L'élève veut connaître la **méthodologie** pour aborder ${exNum} en ${doc.subject} au ${doc.level}.

${documentContent ? "En te basant sur le contenu réel du document ci-dessus, d" : "D"}onne une démarche pour chaque exercice du sujet :

## 🗺️ Méthodologie — ${doc.subject} ${doc.level}

### Pour chaque exercice du sujet
1. **Lire** : comprendre ce qui est demandé
2. **Identifier** : repérer les données et les formules nécessaires
3. **Planifier** : choisir la méthode de résolution
4. **Résoudre** : appliquer la méthode étape par étape
5. **Vérifier** : contrôler les résultats
6. **Rédiger** : présenter proprement sa réponse

### Gestion du temps
- Temps conseillé pour chaque exercice
- Par quoi commencer

### Conseils de rédaction pour le ${doc.level}
- Les attentes des correcteurs
- La présentation type d'une copie
- Les erreurs de rédaction fréquentes

Sois concret et basé sur le contenu réel du sujet.`;
    }

    const messages: AIMessage[] = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
    ];

    return callGroq(messages, { maxTokens: 3000, temperature: 0.4 });
}

/**
 * Assistant complet : combine transcription + explication + formules + démarche.
 */
export async function fullAssist(
    doc: AIAssistRequest["doc"],
    exerciseText?: string,
    exerciseNumber?: string,
    documentContent?: string | null
): Promise<string> {
    const docContext = `Document : "${doc.title}" — ${doc.subject}, ${doc.level}, ${doc.year}`;
    const exNum = exerciseNumber || "cet exercice";

    const contentBlock = documentContent
        ? `\n\nVoici le contenu COMPLET du sujet (extrait du PDF) :\n---DÉBUT DU DOCUMENT---\n${documentContent}\n---FIN DU DOCUMENT---`
        : "";

    const userPrompt = exerciseText
        ? `${docContext}${contentBlock}

Voici le texte de ${exNum} recopié par l'élève :
---
${exerciseText}
---

Tu es l'assistant IA de Jàngatub. Fais une **analyse complète** de cet exercice en 4 parties :

## 📝 1. Sujet reformulé
Recopie le sujet proprement, de façon lisible et bien structurée. Numérote chaque question clairement.

## 📖 2. Explication de l'exercice
- Explique ce que chaque question demande en langage simple.
- Identifie les données et les inconnues.
- Explique les concepts du cours nécessaires.
- Signale les pièges classiques.

## 📐 3. Formules et théorèmes utiles
- Liste toutes les formules nécessaires avec leur nom et énoncé.
- Précise quand et comment les utiliser.
- Donne le lien entre les formules.

## 🗺️ 4. Démarche de résolution
Pour chaque question :
- La méthode à utiliser
- Les étapes dans l'ordre
- Les calculs intermédiaires à prévoir
- Comment vérifier sa réponse
- La rédaction attendue

**Guide l'élève sans donner les réponses finales.** L'objectif est qu'il comprenne et puisse résoudre seul.

Sois exhaustif, pédagogique et encourageant. Adapte-toi au niveau ${doc.level} du Sénégal.`
        : `${docContext}${contentBlock}

L'élève souhaite une assistance complète pour aborder ce sujet de ${doc.subject} au ${doc.level}.

${documentContent ? "En te basant sur le contenu RÉEL du document ci-dessus, f" : "F"}ais une analyse pédagogique complète :

## 📝 1. Contenu du sujet
- ${documentContent ? "Recopie chaque exercice du sujet de façon lisible et structurée." : "Décris la structure typique de ce type d'examen."}
- Nombre d'exercices, barème, durée.
- Thèmes abordés dans chaque exercice.

## 📖 2. Explication de chaque exercice
- Pour chaque exercice : ce qu'il demande, les concepts nécessaires, les pièges.
- Les définitions et propriétés incontournables.
- Les liens entre les différents chapitres.

## 📐 3. Formules et théorèmes nécessaires
- Les formules nécessaires pour chaque exercice du sujet.
- Classées par exercice avec conditions d'application.

## 🗺️ 4. Démarche de résolution
- Pour chaque exercice : les étapes dans l'ordre.
- Comment gérer son temps.
- Les réflexes de rédaction pour gagner des points.
- Les erreurs classiques à éviter.

Sois complet, structuré et adapté au système éducatif sénégalais.`;

    const messages: AIMessage[] = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
    ];

    return callGroq(messages, { maxTokens: 4000, temperature: 0.4 });
}

/**
 * Génère un quiz complet (admin) à partir d'un document PDF, prêt à être sauvegardé en base.
 * Retourne le titre, la description, la durée suggérée et les questions avec points.
 */
export async function generateAdminQuiz(
    doc: { title: string; year: number; type: string; level: string; subject: string },
    numberOfQuestions: number = 10,
    documentContent?: string | null
): Promise<{
    title: string;
    description: string;
    duration: number;
    questions: {
        question: string;
        options: string[];
        correctAnswer: number;
        explanation: string;
        points: number;
    }[];
}> {
    const hasContent = !!documentContent;
    const contentBlock = documentContent
        ? `\n\nVoici le contenu COMPLET du sujet d'examen (extrait du PDF) :\n---DÉBUT DU DOCUMENT---\n${documentContent}\n---FIN DU DOCUMENT---`
        : "";

    const messages: AIMessage[] = [
        {
            role: "system",
            content: `${SYSTEM_PROMPT}

IMPORTANT : Tu dois répondre UNIQUEMENT avec un objet JSON valide, sans aucun texte avant ou après.
Ce quiz sera utilisé pour l'obtention de CERTIFICATS. Il doit être rigoureux, précis et couvrir l'ensemble du sujet.`,
        },
        {
            role: "user",
            content: `Document : "${doc.title}" — ${doc.subject}, ${doc.level}, ${doc.year}${contentBlock}

Génère un quiz officiel de ${numberOfQuestions} questions à choix multiples pour l'obtention de certificat.

${hasContent ? `RÈGLES CRITIQUES :
- Chaque question DOIT être DIRECTEMENT tirée du contenu réel du sujet PDF ci-dessus.
- Reprends les exercices, les données numériques, les énoncés EXACTS du document.
- Pose des questions sur les calculs, formules, et raisonnements demandés dans le sujet.
- Inclus des questions de compréhension de l'énoncé (ex: "Dans l'exercice 2, quelle grandeur est demandée ?").
- Inclus des questions sur les formules nécessaires pour résoudre les exercices du sujet.
- Inclus des questions sur les résultats attendus pour certains calculs du sujet.
- Varie les niveaux de difficulté : 30% facile, 40% moyen, 30% difficile.
- Ne pose JAMAIS de questions générales qui ne sont pas liées au contenu spécifique de ce document.` : `Génère des questions basées sur les thèmes typiques de ${doc.subject} au ${doc.level} pour la session ${doc.year}.
Couvre les différents chapitres du programme de manière équilibrée.`}

Chaque question doit :
- Être pertinente pour le niveau ${doc.level} au Sénégal
- Avoir exactement 4 options de réponse
- Avoir une seule bonne réponse (index 0 à 3)
- Inclure une explication détaillée de la bonne réponse
- Avoir un nombre de points (1 pour facile, 2 pour moyen, 3 pour difficile)

Calcule une durée appropriée en minutes (2 minutes par question facile, 3 pour moyenne, 4 pour difficile).

Réponds UNIQUEMENT avec ce format JSON :
{
  "title": "${doc.subject} - ${doc.level} ${doc.year}",
  "description": "Quiz officiel basé sur le sujet de ${doc.subject} ${doc.level} ${doc.year}. ${numberOfQuestions} questions pour tester vos connaissances.",
  "duration": 30,
  "questions": [
    {
      "question": "La question ici ?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explication détaillée de la réponse.",
      "points": 1
    }
  ]
}`,
        },
    ];

    const response = await callGroq(messages, {
        maxTokens: 6000,
        temperature: 0.4,
    });

    try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Pas de JSON trouvé dans la réponse IA");
        }

        const parsed = JSON.parse(jsonMatch[0]);

        if (!parsed.title || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
            throw new Error("Structure du quiz invalide");
        }

        // Valider et nettoyer chaque question
        parsed.questions = parsed.questions.map((q: any) => ({
            question: q.question || "Question non disponible",
            options: Array.isArray(q.options) && q.options.length === 4
                ? q.options
                : ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: typeof q.correctAnswer === "number" && q.correctAnswer >= 0 && q.correctAnswer <= 3
                ? q.correctAnswer
                : 0,
            explanation: q.explanation || "Pas d'explication disponible.",
            points: typeof q.points === "number" && q.points >= 1 && q.points <= 3
                ? q.points
                : 1,
        }));

        return {
            title: parsed.title || `${doc.subject} - ${doc.level} ${doc.year}`,
            description: parsed.description || `Quiz basé sur ${doc.title}`,
            duration: typeof parsed.duration === "number" ? parsed.duration : 30,
            questions: parsed.questions,
        };
    } catch (error) {
        console.error("[ADMIN_QUIZ_PARSE_ERROR]", error, response);
        throw new Error("Impossible de générer le quiz. L'IA n'a pas retourné un format valide.");
    }
}

/**
 * Vérifie si l'API IA est configurée et fonctionnelle.
 */
export function isAIConfigured(): boolean {
    return !!process.env.GROQ_API_KEY;
}
