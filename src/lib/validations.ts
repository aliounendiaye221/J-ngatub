/**
 * Schémas de validation Zod pour l'ensemble du projet Jàngatub.
 * 
 * Centralise toutes les validations pour les API routes :
 * quiz, paiement, support, certificats, etc.
 */

import { z } from "zod";

// ─── Quiz ──────────────────────────────────────────────────────────────

/** Validation pour la soumission d'un quiz */
export const quizSubmitSchema = z.object({
    quizId: z.string().min(1, "ID du quiz requis"),
    answers: z.array(z.number().int().min(0).max(3)),
});

/** Validation pour la création d'un quiz (admin) */
export const quizCreateSchema = z.object({
    title: z.string().min(3, "Titre trop court").max(200),
    description: z.string().optional(),
    duration: z.number().int().min(5).max(180).default(30),
    levelId: z.string().min(1),
    subjectId: z.string().min(1),
    questions: z.array(z.object({
        question: z.string().min(5, "Question trop courte"),
        options: z.array(z.string().min(1)).length(4, "4 options requises"),
        correctAnswer: z.number().int().min(0).max(3),
        explanation: z.string().optional(),
        points: z.number().int().min(1).default(1),
    })).min(1, "Au moins 1 question requise"),
});

// ─── Premium / Paiement ────────────────────────────────────────────────

/** Validation pour l'activation premium */
export const activateSchema = z.object({
    plan: z.enum(["PREMIUM_MONTHLY", "PREMIUM_ANNUAL"]),
    // TODO: Ajouter quand le paiement réel est intégré
    // paymentToken: z.string().min(1),
    // provider: z.enum(["WAVE", "ORANGE_MONEY", "STRIPE"]),
});

// ─── Support ───────────────────────────────────────────────────────────

/** Validation pour la création d'un ticket de support */
export const supportTicketSchema = z.object({
    subject: z.string().min(5, "Sujet trop court").max(200),
    message: z.string().min(20, "Message trop court (20 caractères minimum)").max(5000),
    priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
});

/** Validation pour la réponse admin à un ticket */
export const supportReplySchema = z.object({
    ticketId: z.string().min(1),
    response: z.string().min(1, "Réponse requise").max(5000),
    status: z.enum(["IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
});

// ─── Explications IA ───────────────────────────────────────────────────

/** Validation pour une demande d'explication IA */
export const aiExplainSchema = z.object({
    documentId: z.string().min(1, "ID du document requis"),
    question: z.string().min(10, "Question trop courte").max(1000).optional(),
    context: z.string().max(2000).optional(),
});

// ─── Téléchargement Pack ───────────────────────────────────────────────

/** Validation pour le téléchargement d'un pack */
export const downloadPackSchema = z.object({
    levelSlug: z.string().min(1, "Niveau requis"),
    subjectSlug: z.string().optional(),
    year: z.number().int().optional(),
});

// ─── Document Admin ────────────────────────────────────────────────────

/** Validation pour la création/modification d'un document */
export const documentSchema = z.object({
    title: z.string().min(3).max(300),
    year: z.number().int().min(1990).max(2030),
    levelId: z.string().min(1),
    subjectId: z.string().min(1),
    type: z.enum(["SUBJECT", "CORRECTION"]),
    pdfUrl: z.string().url("URL invalide"),
    imageUrl: z.string().url("URL image invalide").optional().nullable(),
    isPremium: z.boolean().default(false),
});

// ─── Types inférés ─────────────────────────────────────────────────────

export type QuizSubmitInput = z.infer<typeof quizSubmitSchema>;
export type QuizCreateInput = z.infer<typeof quizCreateSchema>;
export type SupportTicketInput = z.infer<typeof supportTicketSchema>;
export type AiExplainInput = z.infer<typeof aiExplainSchema>;
export type DownloadPackInput = z.infer<typeof downloadPackSchema>;
