"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
    documentId: string;
    initialFavorited: boolean;
    className?: string;
}

export default function FavoriteButton({
    documentId,
    initialFavorited,
    className,
}: FavoriteButtonProps) {
    const [favorited, setFavorited] = useState(initialFavorited);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            setIsLoading(true);
            const response = await fetch("/api/favorites", {
                method: "POST",
                body: JSON.stringify({ documentId }),
            });

            if (response.status === 401) {
                router.push("/api/auth/signin");
                return;
            }

            if (response.ok) {
                const data = await response.json();
                setFavorited(data.favorited);
                router.refresh();
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={toggleFavorite}
            disabled={isLoading}
            className={cn(
                "rounded-full p-2 transition-all hover:bg-muted",
                favorited ? "text-red-500" : "text-muted-foreground",
                isLoading && "opacity-50 cursor-not-allowed",
                className
            )}
        >
            <Heart
                className={cn("h-5 w-5", favorited && "fill-current")}
            />
        </button>
    );
}
