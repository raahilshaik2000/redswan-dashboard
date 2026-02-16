import { Suspense } from "react";
import { Header } from "@/components/dashboard/header";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminPanel } from "@/components/admin/admin-panel";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/contact-us");
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      twoFactorEnabled: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <main className="mx-auto max-w-7xl px-6 py-6">
        <AdminPanel
          users={users.map((u) => ({
            ...u,
            role: u.role as string,
            createdAt: u.createdAt.toISOString(),
          }))}
          currentUserId={session.user.id}
        />
      </main>
    </div>
  );
}
