import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
    FileText,
    Search,
    Plus,
    ArrowLeft,
    Check,
    X
} from "lucide-react";
import Link from "next/link";
import AdminDocumentsClient from "./AdminDocumentsClient";

export default async function AdminDocumentsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") redirect("/");

    const documents = await prisma.document.findMany({
        include: {
            level: true,
            subject: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    // Sérialiser les dates pour le client component
    const serializedDocs = JSON.parse(JSON.stringify(documents));

    return (
        <div className="container py-8 space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Link href="/admin" className="text-sm text-muted-foreground flex items-center gap-1 hover:text-primary">
                        <ArrowLeft className="h-3 w-3" /> Retour dashboard
                    </Link>
                    <h1 className="text-3xl font-extrabold tracking-tight">Gestion des Documents</h1>
                </div>
                <Link
                    href="/admin/documents/new"
                    className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all w-fit"
                >
                    <Plus className="h-5 w-5" /> Nouveau
                </Link>
            </div>

            <AdminDocumentsClient documents={serializedDocs} />
        </div>
    );
}
