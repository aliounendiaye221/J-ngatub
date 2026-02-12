import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";
import SubjectsClient from "./SubjectsClient";

export default async function AdminSubjectsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/");
    }

    const subjects = await prisma.subject.findMany({
        orderBy: { name: "asc" },
        include: {
            _count: {
                select: { documents: true, quizzes: true },
            },
        },
    });

    return (
        <div className="min-h-screen bg-slate-50/50 pb-24">
            <div className="bg-white border-b mb-12">
                <div className="container mx-auto px-6 py-12">
                    <Link href="/admin" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary mb-6 transition-colors">
                        <ArrowLeft className="h-3 w-3" /> Retour au dashboard
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                                <BookOpen className="h-8 w-8 text-primary" />
                                Gestion des Matières
                            </h1>
                            <p className="text-muted-foreground">
                                Ajoutez, modifiez ou supprimez les matières de la plateforme.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6">
                <SubjectsClient subjects={subjects} />
            </div>
        </div>
    );
}
