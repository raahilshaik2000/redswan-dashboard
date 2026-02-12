import { Suspense } from "react";
import { Header } from "@/components/dashboard/header";
import { SettingsContent } from "@/components/settings/settings-content";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense>
        <Header />
      </Suspense>
      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="text-2xl font-semibold tracking-tight mb-6">Settings</h1>
        <SettingsContent />
      </main>
    </div>
  );
}
