import { Suspense } from "react";
import { Header } from "@/components/dashboard/header";

export default function JobApplicantsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-6">
          <div className="h-8 w-40 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted" />
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-xl border bg-card"
              />
            ))}
          </div>
          <div className="h-96 animate-pulse rounded-xl border bg-card" />
        </div>
      </main>
    </div>
  );
}
