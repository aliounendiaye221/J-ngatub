import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import UsersManagementClient from "./UsersManagementClient";

export default async function AdminUsersPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/");
    }

    const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
    });

    return <UsersManagementClient users={JSON.parse(JSON.stringify(users))} />;
}
