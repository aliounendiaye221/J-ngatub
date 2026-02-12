"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Error:", error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="max-w-md text-center space-y-6">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black tracking-tight">
                        Une erreur est survenue
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Nous nous excusons pour la gêne occasionnée. Veuillez réessayer.
                    </p>
                </div>
                <button
                    onClick={reset}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:scale-105 active:scale-95 transition-all"
                >
                    <RefreshCw className="h-4 w-4" />
                    Réessayer
                </button>
            </div>
        </div>
    );
}
