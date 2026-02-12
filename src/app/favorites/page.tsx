import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DocumentCard from "@/components/ui/DocumentCard";
import { Heart } from "lucide-react";
import Link from "next/link";

export default async function FavoritesPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    const favorites = await prisma.favorite.findMany({
        where: {
            userId: session.user.id,
        },
        include: {
            document: {
                include: {
                    level: true,
                    subject: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <div className="container py-12 space-y-8">
            <div className="flex items-center gap-4">
                <div className="rounded-full bg-red-100 p-3 text-red-600">
                    <Heart className="h-8 w-8 fill-current" />
                </div>
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight">Mes Favoris</h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Retrouvez ici toutes les épreuves que vous avez enregistrées.
                    </p>
                </div>
            </div>

            {favorites.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-muted/20">
                    <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <p className="text-xl font-semibold text-muted-foreground">Vous n&apos;avez pas encore de favoris</p>
                    <p className="text-muted-foreground mt-2 mb-8">Parcourez notre bibliothèque pour enregistrer vos épreuves préférées.</p>
                    <Link
                        href="/docs"
                        className="rounded-full bg-primary px-8 py-3 font-bold text-white transition-all hover:scale-105"
                    >
                        Explorer les documents
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((fav) => (
                        <DocumentCard
                            key={fav.id}
                            document={fav.document as any}
                            isFavorited={true}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
