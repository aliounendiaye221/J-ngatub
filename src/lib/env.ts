/**
 * Validation des variables d'environnement au démarrage.
 * Importé dans next.config.mjs pour vérifier dès le build.
 */

function getRequiredEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
        console.warn(`⚠️  Variable d'environnement manquante : ${name}`);
    }
    return value || "";
}

export function validateEnv() {
    const required = {
        DATABASE_URL: getRequiredEnvVar("DATABASE_URL"),
        NEXTAUTH_SECRET: getRequiredEnvVar("NEXTAUTH_SECRET"),
    };

    const optional = {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
        OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
    };

    // Vérifier les variables critiques
    const missing = Object.entries(required)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

    if (missing.length > 0 && process.env.NODE_ENV === "production") {
        throw new Error(
            `❌ Variables d'environnement manquantes en production : ${missing.join(", ")}`
        );
    }

    return { ...required, ...optional };
}
