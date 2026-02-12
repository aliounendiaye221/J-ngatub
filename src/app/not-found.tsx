import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="max-w-md text-center space-y-6">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <FileQuestion className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-4xl font-black tracking-tight">404</h2>
                    <p className="text-xl font-bold">Page introuvable</p>
                    <p className="text-muted-foreground text-sm">
                        Cette page n&apos;existe pas ou a été déplacée.
                    </p>
                </div>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:scale-105 active:scale-95 transition-all"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour à l&apos;accueil
                </Link>
            </div>
        </div>
    );
}
