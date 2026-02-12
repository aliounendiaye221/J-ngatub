import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function SuccessPage() {
    return (
        <div className="container py-24 flex flex-col items-center text-center space-y-8">
            <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center text-green-600 animate-bounce">
                <CheckCircle2 className="h-12 w-12" />
            </div>

            <div className="space-y-4 max-w-lg">
                <h1 className="text-4xl font-extrabold tracking-tight">Bienvenue dans le Premium !</h1>
                <p className="text-xl text-muted-foreground">
                    Votre abonnement a été activé avec succès. Vous avez maintenant un accès illimité à tous nos contenus.
                </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
                <Link
                    href="/docs"
                    className="bg-primary text-white font-bold px-8 py-3 rounded-full hover:scale-105 transition-all flex items-center gap-2"
                >
                    Explorer les documents <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                    href="/profile"
                    className="bg-muted text-foreground font-bold px-8 py-3 rounded-full hover:bg-muted/80 transition-all"
                >
                    Voir mon profil
                </Link>
            </div>
        </div>
    );
}
