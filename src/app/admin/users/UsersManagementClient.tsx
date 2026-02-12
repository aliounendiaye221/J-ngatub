"use client";

import { useRouter } from "next/navigation";
import {
    Users,
    FileText,
    Crown,
    ArrowLeft,
    Mail,
    ShieldCheck,
    Trash2,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Search,
    Loader2
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface User {
    id: string;
    name: string | null;
    email: string;
    role: string;
    isPremium: boolean;
    createdAt: Date | string;
}

interface UsersManagementClientProps {
    users: User[];
}

const ITEMS_PER_PAGE = 15;

export default function UsersManagementClient({ users: initialUsers }: UsersManagementClientProps) {
    const router = useRouter();
    const [users, setUsers] = useState(initialUsers);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination réelle
    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const togglePremium = async (userId: string, currentStatus: boolean) => {
        setLoading(userId);
        try {
            const response = await fetch(`/api/admin/users/${userId}/premium`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isPremium: !currentStatus }),
            });

            if (response.ok) {
                setUsers(users.map(u =>
                    u.id === userId ? { ...u, isPremium: !currentStatus } : u
                ));
                router.refresh();
            }
        } catch (error) {
            console.error("Error updating premium status:", error);
        } finally {
            setLoading(null);
        }
    };

    const handleDelete = async (userId: string, userName: string | null) => {
        if (!confirm(`Supprimer l'utilisateur ${userName || userId} ? Cette action est irréversible.`)) return;
        setDeleting(userId);
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setUsers(users.filter(u => u.id !== userId));
                router.refresh();
            } else {
                const err = await response.json();
                alert(err.error || "Erreur lors de la suppression");
            }
        } catch (error) {
            alert("Erreur de connexion");
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="container py-12 space-y-12 min-h-screen bg-slate-50/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <Link
                        href="/admin"
                        className="flex items-center gap-2 text-sm font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
                    >
                        <ArrowLeft className="h-4 w-4" /> Retour Admin
                    </Link>
                    <h1 className="text-4xl font-black tracking-tighter">Gestion des Utilisateurs</h1>
                </div>

                <div className="relative group w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom ou email..."
                        className="h-12 w-full rounded-2xl border bg-white px-11 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="glass-card rounded-[3rem] bg-white overflow-hidden border shadow-xl shadow-slate-200/50 flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Utilisateur</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Rôle</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Abonnement</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Inscrit le</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {paginatedUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-black shadow-inner">
                                                {user.name?.[0]?.toUpperCase() || <UserIcon className="h-6 w-6" />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-900">{user.name || "Inconnu"}</span>
                                                <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                                                    <Mail className="h-3 w-3" /> {user.email}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={cn(
                                            "inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                            user.role === "ADMIN" ? "bg-purple-100 text-purple-700 border border-purple-300" : "bg-slate-100 text-slate-600 border border-slate-300"
                                        )}>
                                            {user.role}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <button
                                            onClick={() => togglePremium(user.id, user.isPremium)}
                                            disabled={loading === user.id}
                                            className={cn(
                                                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm",
                                                user.isPremium
                                                    ? "bg-amber-100 text-amber-700 border border-amber-300 hover:scale-105"
                                                    : "bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200"
                                            )}
                                        >
                                            <Crown className={cn("h-4 w-4", user.isPremium ? "fill-amber-500" : "fill-none")} />
                                            {loading === user.id ? "Traitement..." : (user.isPremium ? "Membre Premium" : "Activer Premium")}
                                        </button>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleDelete(user.id, user.name)}
                                                disabled={deleting === user.id}
                                                className="p-3 rounded-xl hover:bg-red-50 text-red-400 hover:text-red-500 transition-all disabled:opacity-50"
                                            >
                                                {deleting === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="p-20 text-center space-y-4">
                        <div className="mx-auto h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                            <Users className="h-10 w-10" />
                        </div>
                        <p className="font-black text-xl text-slate-900">Aucun utilisateur trouvé</p>
                        <p className="text-muted-foreground text-sm font-medium">Réessayez avec d&apos;autres mots-clés.</p>
                    </div>
                )}

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{filteredUsers.length} Membres — Page {currentPage}/{totalPages || 1}</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage <= 1}
                            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-primary transition-all disabled:opacity-50"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage >= totalPages}
                            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-primary transition-all disabled:opacity-50"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function UserIcon({ className }: { className?: string }) {
    return <Users className={className} />;
}
