import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

/**
 * Configuration NextAuth pour Jàngatub.
 *
 * - Adapter Prisma pour stocker les utilisateurs dans Neon (PostgreSQL)
 * - Strategy JWT pour que le middleware puisse lire le token
 * - Provider Credentials (email + mot de passe hashé avec bcrypt)
 * - Callbacks pour exposer id, role et isPremium dans la session ET le JWT
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Email ou mot de passe incorrect");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Email ou mot de passe incorrect");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isPremium: user.isPremium,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    /**
     * Callback JWT : enrichit le token avec les données utilisateur.
     * Nécessaire pour que le middleware puisse vérifier le rôle et le statut premium.
     */
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.isPremium = (user as any).isPremium;
      }

      // Rafraîchir les données depuis la DB quand la session est mise à jour
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.isPremium = dbUser.isPremium;
        }
      }

      return token;
    },

    /**
     * Callback session : expose les champs personnalisés dans la session côté client.
     */
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.isPremium = token.isPremium as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
