import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { documentId } = await req.json();
        if (!documentId) {
            return new NextResponse("Document ID required", { status: 400 });
        }

        // Check if favorite exists
        const existingFavorite = await prisma.favorite.findUnique({
            where: {
                userId_documentId: {
                    userId: session.user.id,
                    documentId,
                },
            },
        });

        if (existingFavorite) {
            // Remove favorite
            await prisma.favorite.delete({
                where: {
                    id: existingFavorite.id,
                },
            });
            return NextResponse.json({ favorited: false });
        } else {
            // Add favorite
            await prisma.favorite.create({
                data: {
                    userId: session.user.id,
                    documentId,
                },
            });
            return NextResponse.json({ favorited: true });
        }
    } catch (error) {
        console.error("[FAVORITES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
