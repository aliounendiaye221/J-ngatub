"use client";

import { Check, Crown, Zap, ShieldCheck, Sparkles, AlertCircle, BarChart3, Headphones, Loader2, Smartphone, Copy, X, Brain, Award } from "lucide-react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Plans tarifaires disponibles sur Jàngatub.
 */
const plans = [
    {
        id: "FREE",
        name: "Gratuit",
        price: "0",
        description: "Accès complet aux PDF",
        features: [
            "Tous les sujets d'examens",
            "Tous les corrigés détaillés",
            "Navigation par matière et niveau",
            "Filtres de recherche avancés",
            "Favoris personnels"
        ],
        cta: "Actuel",
        premium: false
    },
    {
        id: "PREMIUM_MONTHLY",
        name: "Premium Mensuel",
        price: "2 500",
        description: "Boostez vos révisions",
        features: [
            "Tout le contenu gratuit",
            "Quiz interactifs par matière",
            "Dashboard de progression",
            "Explications IA des exercices",
            "Packs téléchargement PDF",
            "Badges et certificats",
            "Support prioritaire"
        ],
        cta: "S'abonner",
        premium: true,
        highlight: true
    },
    {
        id: "PREMIUM_ANNUAL",
        name: "Premium Annuel",
        price: "20 000",
        description: "Le meilleur rapport qualité-prix",
        features: [
            "Tout ce qui est dans le Mensuel",
            "Économisez 10 000 FCFA / an",
            "Accès aux lives de révision",
            "Conseils personnalisés",
            "Accès anticipé aux nouveautés"
        ],
        cta: "S'abonner",
        premium: true
    }
];

const premiumFeatures = [
    { icon: Brain, title: "Quiz Interactifs", desc: "Testez vos connaissances avec des quiz par matière et niveau." },
    { icon: BarChart3, title: "Suivi de Progression", desc: "Visualisez vos scores et identifiez vos points faibles." },
    { icon: Award, title: "Badges & Certificats", desc: "Gagnez des badges et obtenez des certificats de réussite." },
    { icon: Headphones, title: "Support Prioritaire", desc: "Assistance rapide par email pour toutes vos questions." },
];



export default function PricingContent() {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);

    // Message si redirigé depuis une route premium
    const reason = searchParams.get("reason");

    const handleSubscribe = (planId: string) => {
        if (!session) {
            signIn();
            return;
        }
        const plan = plans.find(p => p.id === planId);
        if (plan) {
            setSelectedPlan(plan);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Numéro copié !");
    };

    const getWhatsAppLink = () => {
        if (!selectedPlan || !session?.user?.email) return "#";
        const message = `Bonjour, je souhaite activer mon abonnement ${selectedPlan.name} (${selectedPlan.price} FCFA). J'ai effectué le paiement au 70 583 91 55. Mon compte : ${session.user.email}`;
        return `https://wa.me/221705839155?text=${encodeURIComponent(message)}`;
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-24 relative">
            {/* Modal de Paiement Manuel */}
            <AnimatePresence>
                {selectedPlan && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setSelectedPlan(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="bg-[#1DC3D2] p-6 text-white text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10"><Smartphone className="h-32 w-32" /></div>
                                <button
                                    onClick={() => setSelectedPlan(null)}
                                    className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                                <Smartphone className="h-12 w-12 mx-auto mb-3" />
                                <h3 className="text-2xl font-black">Paiement Wave</h3>
                                <p className="text-white/90 text-sm font-medium">Transfert direct sécurisé</p>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="text-center space-y-2">
                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Montant à envoyer</p>
                                    <p className="text-4xl font-black text-slate-900">{selectedPlan.price} <span className="text-lg text-slate-500">FCFA</span></p>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between group cursor-pointer hover:border-primary/50 transition-colors"
                                    onClick={() => copyToClipboard("705839155")}>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-muted-foreground uppercase">Numéro Wave Business</p>
                                        <p className="text-xl font-black text-slate-900 tracking-wider">70 583 91 55</p>
                                    </div>
                                    <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform text-slate-500">
                                        <Copy className="h-5 w-5" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex gap-3 text-sm text-slate-600 bg-amber-50 p-4 rounded-xl border border-amber-100">
                                        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                                        <p className="leading-relaxed">
                                            L&apos;intégration automatique est temporairement indisponible. Veuillez effectuer le transfert puis confirmer sur WhatsApp pour activation immédiate.
                                        </p>
                                    </div>

                                    <a
                                        href={getWhatsAppLink()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full h-14 rounded-2xl bg-[#25D366] text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#20bd5a] hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-green-500/20"
                                    >
                                        <Smartphone className="h-5 w-5" />
                                        Confirmer le paiement
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Bannière si redirigé depuis une route premium */}
            {reason === "premium_required" && (
                <div className="bg-amber-50 border-b border-amber-200 px-6 py-4">
                    <div className="container mx-auto flex items-center gap-3 text-amber-800">
                        <Crown className="h-5 w-5 flex-shrink-0" />
                        <p className="text-sm font-bold">
                            Cette fonctionnalité est réservée aux membres Premium. Choisissez un forfait ci-dessous pour y accéder.
                        </p>
                    </div>
                </div>
            )}

            {/* En-tête */}
            <div className="bg-white border-b mb-12">
                <div className="container mx-auto px-6 py-20 text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/10 mb-2">
                        <Sparkles className="h-4 w-4" />
                        <span>Investissement pour l&apos;Avenir</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                        Passez au niveau <span className="premium-gradient-text">Supérieur</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
                        Les PDF sont <strong>100% gratuits</strong>. Le Premium débloque quiz, dashboard, certificats et bien plus.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6">
                {/* Grille des plans */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={cn(
                                "group relative flex flex-col p-10 rounded-[2.5rem] transition-all duration-300",
                                plan.highlight
                                    ? "bg-slate-900 text-white shadow-2xl shadow-primary/40 -translate-y-4"
                                    : "bg-white border text-foreground shadow-sm hover:shadow-xl"
                            )}
                        >
                            {plan.highlight && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-lg">
                                    Recommandé
                                </div>
                            )}

                            <div className="mb-8 space-y-2">
                                <h3 className={cn("text-2xl font-black", plan.highlight ? "text-white" : "text-slate-900")}>{plan.name}</h3>
                                <p className={cn("text-sm font-medium leading-relaxed", plan.highlight ? "text-slate-400" : "text-muted-foreground")}>{plan.description}</p>
                                <div className="pt-4 flex items-baseline gap-2">
                                    <span className="text-5xl font-black">{plan.price}</span>
                                    <span className={cn("text-xs font-bold uppercase tracking-widest", plan.highlight ? "text-slate-500" : "text-muted-foreground")}>
                                        FCFA / {plan.id === 'PREMIUM_ANNUAL' ? 'AN' : 'MOIS'}
                                    </span>
                                </div>
                            </div>

                            <div className={cn("h-px w-full mb-8", plan.highlight ? "bg-white/10" : "bg-slate-100")} />

                            <ul className="space-y-5 mb-10 flex-1">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-sm font-bold">
                                        <div className={cn(
                                            "mt-0.5 rounded-full p-1 shrink-0",
                                            plan.highlight ? "bg-primary text-white" : "bg-primary/10 text-primary"
                                        )}>
                                            <Check className="h-3 w-3" strokeWidth={4} />
                                        </div>
                                        <span className={plan.highlight ? "text-slate-300" : "text-slate-600"}>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => plan.premium && handleSubscribe(plan.id)}
                                disabled={(!plan.premium && !!session?.user) || (session?.user?.isPremium && plan.premium)}
                                className={cn(
                                    "w-full h-14 rounded-2xl font-black transition-all text-sm uppercase tracking-widest active:scale-95 shadow-lg flex items-center justify-center gap-3",
                                    plan.highlight
                                        ? "bg-[#1DC3D2] text-white hover:bg-[#18adb5] shadow-[#1DC3D2]/20"
                                        : plan.premium
                                            ? "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/10"
                                            : "bg-slate-100 text-slate-500 cursor-default border border-slate-200"
                                )}
                            >
                                {(session?.user?.isPremium && plan.premium) ? (
                                    "Abonnement Actif"
                                ) : plan.premium ? (
                                    <>
                                        <Smartphone className="h-5 w-5" />
                                        Payer avec Wave
                                    </>
                                ) : (
                                    plan.cta
                                )}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Section fonctionnalités premium */}
                <div className="mt-24 space-y-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-black tracking-tight">
                            Ce que débloque le <span className="premium-gradient-text">Premium</span>
                        </h2>
                        <p className="text-muted-foreground max-w-xl mx-auto">
                            Des outils puissants pour maximiser vos chances de réussite aux examens.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {premiumFeatures.map((item, i) => (
                            <div key={i} className="flex flex-col items-center text-center space-y-4 p-8 rounded-[2rem] bg-white border hover:shadow-lg transition-all">
                                <div className="h-16 w-16 rounded-[1.5rem] bg-primary/5 flex items-center justify-center text-primary">
                                    <item.icon className="h-8 w-8" strokeWidth={1.5} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-black text-lg tracking-tight">{item.title}</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trust Elements */}
                <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 bg-white rounded-[3rem] p-12 border shadow-sm">
                    {[
                        { icon: Zap, title: "Accès Instantané", desc: "Vos ressources sont disponibles dès la validation." },
                        { icon: ShieldCheck, title: "Paiement Sécurisé", desc: "Transactions protégées Wave / Orange Money / Carte." },
                        { icon: Crown, title: "Qualité Supérieure", desc: "Contenus vérifiés par des inspecteurs d'éducation." }
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center text-center space-y-4">
                            <div className="h-16 w-16 rounded-[1.5rem] bg-primary/5 flex items-center justify-center text-primary">
                                <item.icon className="h-8 w-8" strokeWidth={1.5} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-black text-lg tracking-tight">{item.title}</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
