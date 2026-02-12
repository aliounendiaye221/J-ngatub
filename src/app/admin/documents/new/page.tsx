import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import NewDocumentForm from "./NewDocumentForm";

export default async function NewDocumentPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") redirect("/");

    const [levels, subjects] = await Promise.all([
        prisma.level.findMany({ orderBy: { name: "asc" } }),
        prisma.subject.findMany({ orderBy: { name: "asc" } }),
    ]);

    return (
        <div className="container py-8">
            <NewDocumentForm levels={levels} subjects={subjects} />
        </div>
    );
}
