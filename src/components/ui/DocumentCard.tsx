import Link from 'next/link';
import Image from 'next/image';
// Icônes utilisées dans la carte document
import { Calendar, FileText, Eye, Download, Star } from 'lucide-react';
import FavoriteButton from '@/components/favorites/FavoriteButton';
import { cn } from '@/lib/utils';

interface DocumentCardProps {
    document: {
        id: string;
        title: string;
        year: number;
        type: string;
        pdfUrl: string;
        imageUrl?: string | null;
        isPremium: boolean;
        level: {
            name: string;
        };
        subject: {
            name: string;
        };
    };
    isFavorited?: boolean;
}

export default function DocumentCard({ document, isFavorited = false }: DocumentCardProps) {
    return (
        <div className="group relative glass-card hover-lift rounded-[2rem] overflow-hidden flex flex-col h-full bg-white/40">
            {/* Header / Badge Section */}
            <div className="p-5 flex items-start justify-between">
                <div className="space-y-1.5">
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10">
                        {document.level.name}
                    </span>
                    <h3 className="font-bold text-lg leading-tight line-clamp-2 min-h-[3rem] group-hover:text-primary transition-colors">
                        {document.title}
                    </h3>
                </div>
                <div className="relative z-10">
                    <FavoriteButton
                        documentId={document.id}
                        initialFavorited={isFavorited}
                    />
                </div>
            </div>

            {/* Visual Element / Image or Subject Badge */}
            <div className="px-5 pb-4">
                {document.imageUrl ? (
                    <div className="relative rounded-2xl overflow-hidden h-40 bg-muted/20">
                        <Image
                            src={document.imageUrl}
                            alt={document.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-xl px-2.5 py-1 shadow-sm">
                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">{document.subject.name}</p>
                            <span className="text-[10px] font-black text-slate-900">{document.year}</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 group-hover:bg-muted/60 transition-colors">
                        <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">{document.subject.name}</p>
                            <p className="text-sm font-black text-slate-900">{document.year}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Meta Section */}
            <div className="px-5 pb-6 flex items-center gap-4 text-xs font-bold text-slate-600">
                <div className="flex items-center gap-1.5">
                    <Star className={cn("h-4 w-4", document.isPremium ? "text-amber-500 fill-amber-500" : "text-green-500 fill-green-500")} />
                    <span className={cn(document.isPremium ? "text-amber-700" : "text-green-700")}>
                        {document.type === 'SUBJECT' ? "Sujet d'examen" : "Corrigé complet"}
                    </span>
                </div>
            </div>

            {/* Actions / Footer */}
            <div className="mt-auto p-5 pt-0 border-t border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2 mt-5">
                    {/* Bouton unique : tous les documents sont en accès libre */}
                    <Link
                        href={`/doc/${document.id}`}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#4F46E5] text-white py-4 font-black text-sm shadow-xl shadow-indigo-500/20 hover:bg-[#4338CA] hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <Eye className="h-4 w-4" />
                        Consulter
                    </Link>
                </div>
            </div>

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
    );
}
