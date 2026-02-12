/**
 * Page /certificates — Badges et certificats de l'utilisateur.
 * 
 * Affiche les badges gagnés, les certificats obtenus,
 * et les certificats disponibles à débloquer.
 * Premium uniquement (protégé par middleware).
 */

"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
    Award, Trophy, Star, ArrowLeft, Download, Sparkles,
    CheckCircle2, Lock, Loader2, GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Certificate {
    id: string;
    title: string;
    pdfUrl: string | null;
    issuedAt: string;
}

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: string;
}

interface AvailableCert {
    levelId: string;
    levelName: string;
    quizCount: number;
    averageScore: number;
}

interface CertificateData {
    certificates: Certificate[];
    badges: Badge[];
    availableCertificates: AvailableCert[];
}

export default function CertificatesPage() {
    const [data, setData] = useState<CertificateData | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/certificate");
                if (res.ok) setData(await res.json());
            } catch (error) {
                console.error("Erreur:", error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    /** Générer un certificat */
    const generateCertificate = async (levelId: string) => {
        setGenerating(levelId);
        try {
            const res = await fetch("/api/certificate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ levelId }),
            });

            if (res.ok) {
                const result = await res.json();
                // Rafraîchir les données
                const updated = await fetch("/api/certificate");
                if (updated.ok) setData(await updated.json());

                // Générer et télécharger le certificat HTML
                downloadCertificateHTML(
                    result.userName,
                    result.levelName,
                    result.averageScore,
                    result.quizCount
                );
            } else {
                const err = await res.json();
                alert(err.error);
            }
        } catch (error) {
            console.error("Erreur:", error);
        } finally {
            setGenerating(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="min-h-screen bg-slate-50/50 pb-24">
            {/* En-tête */}
            <div className="bg-white border-b mb-12">
                <div className="container mx-auto px-6 py-12">
                    <Link
                        href="/profile/dashboard"
                        className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-6"
                    >
                        <ArrowLeft className="h-4 w-4" /> Dashboard
                    </Link>
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-black uppercase tracking-widest border border-amber-200">
                            <Award className="h-4 w-4" />
                            <span>Récompenses</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight">
                            Badges & <span className="premium-gradient-text">Certificats</span>
                        </h1>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 space-y-12 max-w-5xl">
                {/* ─── Badges ────────────────────────────────────────────── */}
                <section>
                    <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-amber-500" /> Mes Badges
                    </h2>

                    {data.badges.length === 0 ? (
                        <div className="bg-white rounded-[2rem] border p-12 text-center">
                            <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="font-bold text-lg">Pas encore de badge</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Complétez des quiz pour gagner vos premiers badges !
                            </p>
                            <Link
                                href="/quiz"
                                className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm"
                            >
                                Commencer un quiz
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {data.badges.map((badge) => (
                                <div key={badge.id} className="bg-white p-6 rounded-[2rem] border shadow-sm flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-inner flex-shrink-0">
                                        <Star className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <p className="font-black text-sm">{badge.description}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Obtenu le {new Date(badge.earnedAt).toLocaleDateString("fr-FR")}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* ─── Certificats disponibles ───────────────────────────── */}
                {data.availableCertificates.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-primary" /> Certificats à débloquer
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {data.availableCertificates.map((cert) => (
                                <div key={cert.levelId} className="bg-white p-6 rounded-[2rem] border shadow-sm space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-600">
                                            <CheckCircle2 className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="font-black">Certificat {cert.levelName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {cert.quizCount} quiz • {cert.averageScore}% de moyenne
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => generateCertificate(cert.levelId)}
                                        disabled={generating === cert.levelId}
                                        className="w-full h-12 rounded-xl bg-primary text-white font-black text-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {generating === cert.levelId ? (
                                            <><Loader2 className="h-4 w-4 animate-spin" /> Génération...</>
                                        ) : (
                                            <><Award className="h-4 w-4" /> Générer le certificat</>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ─── Certificats obtenus ────────────────────────────── */}
                <section>
                    <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                        <GraduationCap className="h-6 w-6 text-primary" /> Mes Certificats
                    </h2>

                    {data.certificates.length === 0 ? (
                        <div className="bg-white rounded-[2rem] border p-12 text-center">
                            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="font-bold text-lg">Pas encore de certificat</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Complétez au moins 5 quiz d&apos;un niveau avec 70%+ de moyenne pour en obtenir un.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {data.certificates.map((cert) => (
                                <div key={cert.id} className="bg-white p-6 rounded-[2rem] border shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                            <Award className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <p className="font-black">{cert.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Délivré le {new Date(cert.issuedAt).toLocaleDateString("fr-FR")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

/**
 * Génère et télécharge un certificat HTML en tant que fichier.
 * Alternative légère à pdf-lib/puppeteer pour Vercel Free Tier.
 */
function downloadCertificateHTML(
    userName: string,
    levelName: string,
    averageScore: number,
    quizCount: number
) {
    const date = new Date().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Certificat Jàngatub - ${levelName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f8fafc; }
    .cert { width: 800px; padding: 60px; background: white; border: 3px solid #4F46E5; border-radius: 24px; text-align: center; position: relative; }
    .cert::before { content: ''; position: absolute; top: 8px; left: 8px; right: 8px; bottom: 8px; border: 1px solid #e2e8f0; border-radius: 20px; }
    .logo { font-size: 28px; font-weight: 900; color: #0f172a; margin-bottom: 8px; }
    .logo span { color: #4F46E5; }
    .subtitle { color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; font-weight: 700; }
    h1 { font-size: 36px; font-weight: 900; color: #0f172a; margin: 40px 0 16px; }
    .name { font-size: 32px; font-weight: 900; color: #4F46E5; margin: 20px 0; }
    .detail { color: #475569; font-size: 16px; line-height: 1.8; margin: 20px 0; }
    .stats { display: flex; justify-content: center; gap: 40px; margin: 30px 0; }
    .stat { text-align: center; }
    .stat-value { font-size: 28px; font-weight: 900; color: #0f172a; }
    .stat-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; }
    .date { color: #94a3b8; font-size: 13px; margin-top: 40px; }
    @media print { body { background: white; } .cert { border: 3px solid #4F46E5; box-shadow: none; } }
  </style>
</head>
<body>
  <div class="cert">
    <div class="logo">Jànga<span>tub</span></div>
    <div class="subtitle">Plateforme Éducative du Sénégal</div>
    <h1>Certificat de Réussite</h1>
    <p class="detail">Ce certificat est décerné à</p>
    <p class="name">${userName}</p>
    <p class="detail">
      Pour avoir démontré une maîtrise exceptionnelle du programme <strong>${levelName}</strong><br/>
      sur la plateforme Jàngatub.
    </p>
    <div class="stats">
      <div class="stat">
        <div class="stat-value">${averageScore}%</div>
        <div class="stat-label">Score moyen</div>
      </div>
      <div class="stat">
        <div class="stat-value">${quizCount}</div>
        <div class="stat-label">Quiz complétés</div>
      </div>
    </div>
    <p class="date">Délivré le ${date}</p>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `certificat-jangatub-${levelName.toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
}
