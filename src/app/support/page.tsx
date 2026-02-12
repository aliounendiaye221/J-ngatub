/**
 * Page /support — Support prioritaire premium.
 * 
 * Permet aux utilisateurs premium de créer des tickets de support,
 * de suivre l'avancement et de consulter les réponses admin.
 * Protégée par middleware.
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    MessageSquare, ArrowLeft, Send, Clock, CheckCircle2,
    AlertCircle, Loader2, Sparkles, ChevronDown, ChevronUp,
    HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Ticket {
    id: string;
    subject: string;
    message: string;
    priority: string;
    status: string;
    response: string | null;
    createdAt: string;
    respondedAt: string | null;
}

const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
    LOW: { label: "Basse", color: "bg-slate-100 text-slate-600" },
    NORMAL: { label: "Normale", color: "bg-blue-100 text-blue-600" },
    HIGH: { label: "Haute", color: "bg-orange-100 text-orange-600" },
    URGENT: { label: "Urgente", color: "bg-red-100 text-red-600" },
};

const STATUS_LABELS: Record<string, { label: string; icon: typeof Clock; color: string }> = {
    OPEN: { label: "Ouvert", icon: Clock, color: "text-blue-500" },
    IN_PROGRESS: { label: "En cours", icon: Loader2, color: "text-amber-500" },
    RESOLVED: { label: "Résolu", icon: CheckCircle2, color: "text-green-500" },
    CLOSED: { label: "Fermé", icon: AlertCircle, color: "text-slate-400" },
};

export default function SupportPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [expandedTicket, setExpandedTicket] = useState<string | null>(null);

    // Formulaire
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [priority, setPriority] = useState("NORMAL");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        try {
            const res = await fetch("/api/support");
            if (res.ok) {
                const data = await res.json();
                setTickets(data.tickets);
            }
        } catch (error) {
            console.error("Erreur:", error);
        } finally {
            setLoading(false);
        }
    };

    /** Soumettre un nouveau ticket */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (subject.length < 5 || message.length < 20) return;

        setSubmitting(true);
        try {
            const res = await fetch("/api/support", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subject, message, priority }),
            });

            if (res.ok) {
                setSubject("");
                setMessage("");
                setPriority("NORMAL");
                setShowForm(false);
                await loadTickets();
            } else {
                const err = await res.json();
                alert(err.error);
            }
        } catch (error) {
            console.error("Erreur:", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pb-24">
            {/* En-tête */}
            <div className="bg-white border-b mb-12">
                <div className="container mx-auto px-6 py-12">
                    <Link
                        href="/profile"
                        className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-6"
                    >
                        <ArrowLeft className="h-4 w-4" /> Profil
                    </Link>
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20">
                            <MessageSquare className="h-4 w-4" />
                            <span>Premium</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight">
                            Support <span className="premium-gradient-text">Prioritaire</span>
                        </h1>
                        <p className="text-muted-foreground">
                            Obtenez de l&apos;aide rapidement — temps de réponse sous 24h.
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 max-w-3xl space-y-8">
                {/* Bouton nouveau ticket */}
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="w-full h-14 rounded-2xl bg-primary text-white font-black text-sm hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
                    >
                        <Send className="h-5 w-5" /> Nouveau ticket
                    </button>
                )}

                {/* Formulaire de création */}
                {showForm && (
                    <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] border p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black">Nouveau ticket</h2>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="text-sm text-muted-foreground hover:text-primary"
                            >
                                Annuler
                            </button>
                        </div>

                        {/* Sujet */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold">Sujet</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Ex: Problème avec un quiz..."
                                className="w-full h-12 px-4 rounded-xl border bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                required
                                minLength={5}
                                maxLength={200}
                            />
                        </div>

                        {/* Priorité */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold">Priorité</label>
                            <div className="flex gap-2 flex-wrap">
                                {Object.entries(PRIORITY_LABELS).map(([key, { label, color }]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setPriority(key)}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-sm font-bold transition-all border",
                                            priority === key
                                                ? `${color} border-current ring-2 ring-current/20`
                                                : "bg-slate-50 text-muted-foreground border-transparent hover:bg-slate-100"
                                        )}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold">
                                Message <span className="text-xs text-muted-foreground">(min. 20 caractères)</span>
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Décrivez votre problème en détail..."
                                rows={6}
                                className="w-full px-4 py-3 rounded-xl border bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                required
                                minLength={20}
                                maxLength={5000}
                            />
                            <p className="text-xs text-muted-foreground text-right">
                                {message.length} / 5000
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || subject.length < 5 || message.length < 20}
                            className="w-full h-12 rounded-xl bg-primary text-white font-black text-sm hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {submitting ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Envoi...</>
                            ) : (
                                <><Send className="h-4 w-4" /> Envoyer le ticket</>
                            )}
                        </button>
                    </form>
                )}

                {/* Liste des tickets */}
                <section className="space-y-4">
                    <h2 className="text-xl font-black flex items-center gap-2">
                        <HelpCircle className="h-5 w-5" /> Mes tickets ({tickets.length})
                    </h2>

                    {tickets.length === 0 ? (
                        <div className="bg-white rounded-[2rem] border p-12 text-center">
                            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="font-bold text-lg">Aucun ticket</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Créez votre premier ticket si vous avez besoin d&apos;aide.
                            </p>
                        </div>
                    ) : (
                        tickets.map((ticket) => {
                            const statusInfo = STATUS_LABELS[ticket.status] || STATUS_LABELS.OPEN;
                            const priorityInfo = PRIORITY_LABELS[ticket.priority] || PRIORITY_LABELS.NORMAL;
                            const StatusIcon = statusInfo.icon;
                            const isExpanded = expandedTicket === ticket.id;

                            return (
                                <div key={ticket.id} className="bg-white rounded-[2rem] border shadow-sm overflow-hidden">
                                    {/* Header du ticket */}
                                    <button
                                        onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
                                        className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            <StatusIcon className={cn("h-5 w-5 flex-shrink-0", statusInfo.color)} />
                                            <div className="min-w-0">
                                                <p className="font-black text-sm truncate">{ticket.subject}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {new Date(ticket.createdAt).toLocaleDateString("fr-FR")}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <span className={cn("px-3 py-1 rounded-lg text-xs font-bold", priorityInfo.color)}>
                                                {priorityInfo.label}
                                            </span>
                                            <span className={cn("text-xs font-bold", statusInfo.color)}>
                                                {statusInfo.label}
                                            </span>
                                            {isExpanded ? (
                                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </div>
                                    </button>

                                    {/* Corps du ticket (expandable) */}
                                    {isExpanded && (
                                        <div className="px-6 pb-6 border-t space-y-4">
                                            {/* Message de l'utilisateur */}
                                            <div className="pt-4">
                                                <p className="text-xs font-bold text-muted-foreground mb-2">Votre message :</p>
                                                <p className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 p-4 rounded-xl">
                                                    {ticket.message}
                                                </p>
                                            </div>

                                            {/* Réponse admin */}
                                            {ticket.response ? (
                                                <div>
                                                    <p className="text-xs font-bold text-green-600 mb-2">
                                                        Réponse de l&apos;équipe ({ticket.respondedAt && new Date(ticket.respondedAt).toLocaleDateString("fr-FR")}) :
                                                    </p>
                                                    <p className="text-sm text-slate-700 whitespace-pre-wrap bg-green-50 p-4 rounded-xl border border-green-200">
                                                        {ticket.response}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-4 rounded-xl">
                                                    <Clock className="h-4 w-4" />
                                                    <span className="font-bold">En attente de réponse — temps moyen : 24h</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </section>
            </div>
        </div>
    );
}
