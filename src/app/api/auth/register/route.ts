import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
    name: z
        .string()
        .min(2, "Le nom doit contenir au moins 2 caractères")
        .max(50, "Le nom ne doit pas dépasser 50 caractères"),
    email: z
        .string()
        .email("Adresse email invalide"),
    password: z
        .string()
        .min(6, "Le mot de passe doit contenir au moins 6 caractères")
        .max(100, "Le mot de passe ne doit pas dépasser 100 caractères"),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validation = registerSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.errors[0].message },
                { status: 400 }
            );
        }

        const { name, email, password } = validation.data;

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Un compte avec cet email existe déjà" },
                { status: 409 }
            );
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 12);

        // Créer l'utilisateur
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        return NextResponse.json(
            {
                message: "Compte créé avec succès",
                user: { id: user.id, name: user.name, email: user.email },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("[REGISTER_ERROR]", error);
        return NextResponse.json(
            { error: "Erreur interne du serveur" },
            { status: 500 }
        );
    }
}
