import type { Metadata } from "next";
import "./globals.css";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
    title: {
        default: "Jàngatub — Banque d'épreuves BFEM & BAC du Sénégal",
        template: "%s | Jàngatub",
    },
    description:
        "Préparez vos examens BFEM et BAC avec Jàngatub : sujets, corrigés, quiz interactifs et outils IA. La plateforme éducative de référence au Sénégal.",
    keywords: [
        "BFEM",
        "BAC",
        "Sénégal",
        "épreuves",
        "corrigés",
        "sujets",
        "examens",
        "révisions",
        "Jàngatub",
        "éducation",
    ],
    authors: [{ name: "Jàngatub" }],
    creator: "Jàngatub",
    metadataBase: new URL(process.env.NEXTAUTH_URL || "https://jangatub.sn"),
    openGraph: {
        type: "website",
        locale: "fr_SN",
        siteName: "Jàngatub",
        title: "Jàngatub — Banque d'épreuves BFEM & BAC",
        description:
            "Préparez vos examens BFEM et BAC avec les meilleurs outils numériques au Sénégal.",
    },
    twitter: {
        card: "summary_large_image",
        title: "Jàngatub — Banque d'épreuves BFEM & BAC",
        description:
            "Préparez vos examens BFEM et BAC avec les meilleurs outils numériques au Sénégal.",
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr" className="scroll-smooth">
            <body className="min-h-screen bg-background font-sans antialiased text-foreground">
                <Providers>
                    <div className="relative flex min-h-screen flex-col">
                        <Header />
                        <main className="flex-1">{children}</main>
                        <Footer />
                        <BottomNav />
                    </div>
                </Providers>
            </body>
        </html>
    );
}
