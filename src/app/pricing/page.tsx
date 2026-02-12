import { Suspense } from "react";
import PricingContent from "./PricingContent";

/**
 * Page tarification - Composant serveur avec Suspense boundary
 * pour le useSearchParams() utilisé dans PricingContent.
 */
export default function PricingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        }>
            <PricingContent />
        </Suspense>
    );
}
