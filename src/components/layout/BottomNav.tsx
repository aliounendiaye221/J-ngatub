"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Brain, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BottomNav() {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Accueil", icon: Home },
        { href: "/docs", label: "Cours", icon: BookOpen },
        { href: "/quiz", label: "Quiz", icon: Brain },
        { href: "/profile", label: "Profil", icon: User },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 block md:hidden">
            <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-t border-white/20 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]"></div>
            <nav className="relative flex justify-around items-center h-20 pb-2 safe-area-bottom">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-300",
                                isActive ? "text-primary -translate-y-2" : "text-muted-foreground hover:text-slate-600"
                            )}
                        >
                            <div className={cn(
                                "p-2 rounded-2xl transition-all duration-300",
                                isActive ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-transparent"
                            )}>
                                <link.icon className={cn("h-6 w-6", isActive ? "stroke-[2.5px]" : "stroke-2")} />
                            </div>
                            <span className={cn(
                                "text-[10px] font-bold tracking-tight transition-all duration-300",
                                isActive ? "opacity-100 scale-100" : "opacity-0 scale-0 h-0 w-0"
                            )}>
                                {link.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
