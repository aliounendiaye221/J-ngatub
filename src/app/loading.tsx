export default function Loading() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
                <p className="text-sm font-bold text-muted-foreground animate-pulse">
                    Chargement...
                </p>
            </div>
        </div>
    );
}
