/**
 * Extraction de texte depuis un PDF (URL Cloudinary ou autre).
 *
 * - Télécharge le PDF depuis l'URL
 * - Extrait le texte brut avec pdf-parse
 * - Cache en mémoire pour éviter de re-télécharger à chaque requête
 * - Limite la taille du texte envoyé à l'IA
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdf = require("pdf-parse");

// ─── Cache en mémoire (évite de re-télécharger le même PDF) ────────────
const textCache = new Map<string, { text: string; extractedAt: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Extrait le texte d'un PDF à partir de son URL.
 * Retourne le texte brut ou null en cas d'erreur.
 */
export async function extractTextFromPDF(pdfUrl: string): Promise<string | null> {
    try {
        // Vérifier le cache
        const cached = textCache.get(pdfUrl);
        if (cached && Date.now() - cached.extractedAt < CACHE_TTL) {
            console.log("[PDF_EXTRACT] Cache hit pour", pdfUrl.substring(0, 60));
            return cached.text;
        }

        console.log("[PDF_EXTRACT] Téléchargement du PDF...", pdfUrl.substring(0, 60));

        // Télécharger le PDF
        const response = await fetch(pdfUrl, {
            headers: {
                "User-Agent": "Jangatub-AI/1.0",
            },
        });

        if (!response.ok) {
            console.error("[PDF_EXTRACT] Erreur HTTP:", response.status);
            return null;
        }

        const contentType = response.headers.get("content-type");
        if (contentType && !contentType.includes("pdf") && !contentType.includes("octet-stream")) {
            console.warn("[PDF_EXTRACT] Content-Type inattendu:", contentType);
        }

        // Convertir en buffer
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (buffer.length === 0) {
            console.error("[PDF_EXTRACT] PDF vide");
            return null;
        }

        console.log("[PDF_EXTRACT] Taille du PDF:", (buffer.length / 1024).toFixed(1), "KB");

        // Extraire le texte
        const data = await pdf(buffer);
        let text = data.text || "";

        // Nettoyage basique du texte
        text = cleanExtractedText(text);

        if (!text || text.length < 20) {
            console.warn("[PDF_EXTRACT] Peu ou pas de texte extrait (PDF scanné ?)");
            return null;
        }

        console.log("[PDF_EXTRACT] Texte extrait:", text.length, "caractères,", data.numpages, "pages");

        // Mettre en cache
        textCache.set(pdfUrl, { text, extractedAt: Date.now() });

        return text;
    } catch (error) {
        console.error("[PDF_EXTRACT] Erreur:", error);
        return null;
    }
}

/**
 * Nettoie le texte extrait d'un PDF.
 */
function cleanExtractedText(text: string): string {
    return text
        // Supprimer les caractères de contrôle sauf newlines
        .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F]/g, "")
        // Réduire les espaces multiples
        .replace(/[ \t]{3,}/g, "  ")
        // Réduire les sauts de ligne excessifs
        .replace(/\n{4,}/g, "\n\n\n")
        // Supprimer les lignes ne contenant que des espaces
        .replace(/^\s+$/gm, "")
        .trim();
}

/**
 * Tronque le texte pour respecter la limite de tokens de l'IA.
 * Groq/Llama 3.3 supporte ~128K tokens, mais on limite pour la qualité.
 */
export function truncateForAI(text: string, maxChars: number = 12000): string {
    if (text.length <= maxChars) return text;

    // Couper au dernier saut de ligne avant la limite
    const truncated = text.substring(0, maxChars);
    const lastNewline = truncated.lastIndexOf("\n");

    return (lastNewline > maxChars * 0.8 ? truncated.substring(0, lastNewline) : truncated)
        + "\n\n[... suite du document tronquée pour l'analyse IA ...]";
}

/**
 * Nettoie le cache (appelé périodiquement si nécessaire).
 */
export function clearPDFCache(): void {
    const now = Date.now();
    const urls = Array.from(textCache.keys());
    for (const url of urls) {
        const entry = textCache.get(url);
        if (entry && now - entry.extractedAt > CACHE_TTL) {
            textCache.delete(url);
        }
    }
}
