"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FiltersProps {
    levels: { id: string; name: string; slug: string }[];
    subjects: { id: string; name: string; slug: string }[];
}

export default function DocumentFilters({ levels, subjects }: FiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== 'all') {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`/docs?${params.toString()}`);
    };

    const clearFilters = () => {
        router.push('/docs');
    };

    const hasFilters = searchParams.get('level') || searchParams.get('subject') || searchParams.get('year') || searchParams.get('q');

    return (
        <div className="glass-card p-6 md:p-8 rounded-[2rem] space-y-8 bg-white/60">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <SlidersHorizontal className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="font-black text-xl tracking-tight">Filtrer les résultats</h2>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Affinage de précision</p>
                    </div>
                </div>

                {hasFilters && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-all border border-red-100"
                    >
                        <X className="h-4 w-4" />
                        Réinitialiser
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Search */}
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Mots-clés</label>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Ex: Maths 2024..."
                            className="h-12 w-full rounded-2xl border-none bg-muted/50 px-4 pl-11 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            onChange={(e) => updateFilter('q', e.target.value)}
                            defaultValue={searchParams.get('q') || ''}
                        />
                    </div>
                </div>

                {/* Level */}
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Examen</label>
                    <div className="relative">
                        <select
                            className="h-12 w-full rounded-2xl border-none bg-muted/50 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                            onChange={(e) => updateFilter('level', e.target.value)}
                            defaultValue={searchParams.get('level') || 'all'}
                        >
                            <option value="all">Tous les diplômes</option>
                            {levels.map(level => (
                                <option key={level.id} value={level.slug}>{level.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Matière</label>
                    <div className="relative">
                        <select
                            className="h-12 w-full rounded-2xl border-none bg-muted/50 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                            onChange={(e) => updateFilter('subject', e.target.value)}
                            defaultValue={searchParams.get('subject') || 'all'}
                        >
                            <option value="all">Toutes les disciplines</option>
                            {subjects.map(subject => (
                                <option key={subject.id} value={subject.slug}>{subject.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                </div>

                {/* Year */}
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Session</label>
                    <div className="relative">
                        <select
                            className="h-12 w-full rounded-2xl border-none bg-muted/50 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                            onChange={(e) => updateFilter('year', e.target.value)}
                            defaultValue={searchParams.get('year') || 'all'}
                        >
                            <option value="all">Toutes les années</option>
                            {[2024, 2023, 2022, 2021, 2020, 2019, 2018].map(year => (
                                <option key={year} value={year.toString()}>Année {year}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                </div>
            </div>
        </div>
    );
}
