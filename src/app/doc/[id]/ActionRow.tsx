'use client';

import { Download, Share2, AlertTriangle, LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
    Download,
    Share2,
    AlertTriangle,
};

interface ActionRowProps {
    iconName: string;
    label: string;
    href?: string;
    onClick?: () => void;
    external?: boolean;
    color?: string;
    bg?: string;
}

export default function ActionRow({ iconName, label, href, onClick, external, color = "text-slate-600", bg = "bg-slate-100" }: ActionRowProps) {
    const Icon = iconMap[iconName] ?? Download;
    const content = (
        <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors group cursor-pointer">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${bg} ${color} group-hover:scale-110 transition-transform`}>
                    <Icon className="h-4 w-4" />
                </div>
                <span className="font-bold text-sm text-slate-700">{label}</span>
            </div>
        </div>
    );

    if (href) {
        return (
            <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="block">
                {content}
            </a>
        );
    }

    return <button className="w-full text-left" onClick={onClick}>{content}</button>;
}
