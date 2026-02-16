import { Suspense } from "react";
import { Header } from "@/components/dashboard/header";

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-6">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-muted" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl border bg-card"
            />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-xl border bg-card" />
      </main>
    </div>
  );
}
