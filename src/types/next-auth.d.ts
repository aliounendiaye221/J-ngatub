/**
 * Extension des types NextAuth pour Jàngatub.
 * 
 * Ajoute les champs personnalisés (id, role, isPremium) 
 * dans Session, User et JWT.
 */

import { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: string;
            isPremium: boolean;
        } & DefaultSession["user"];
    }

    interface User {
        role: string;
        isPremium: boolean;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
        role?: string;
        isPremium?: boolean;
    }
}
