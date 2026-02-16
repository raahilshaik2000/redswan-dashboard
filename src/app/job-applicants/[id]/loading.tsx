import { Suspense } from "react";
import { Header } from "@/components/dashboard/header";

export default function JobApplicantsDetailLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-4 h-5 w-28 animate-pulse rounded bg-muted" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-80 animate-pulse rounded-xl border bg-card" />
          <div className="h-80 animate-pulse rounded-xl border bg-card" />
        </div>
      </main>
    </div>
  );
}
