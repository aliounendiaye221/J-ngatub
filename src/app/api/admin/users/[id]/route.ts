import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * DELETE /api/admin/users/[id] — Supprimer un utilisateur.
 */
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const userId = params.id;

        // Empêcher la suppression de soi-même
        if (userId === session.user.id) {
            return NextResponse.json(
                { error: "Vous ne pouvez pas supprimer votre propre compte" },
                { status: 400 }
            );
        }

        // Vérifier que l'utilisateur existe
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
        }

        // Supprimer l'utilisateur (cascade supprimera favoris, subscriptions, etc.)
        await prisma.user.delete({ where: { id: userId } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[ADMIN_USER_DELETE]", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}
