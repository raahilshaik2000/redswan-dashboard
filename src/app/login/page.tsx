"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { loginAction } from "./actions";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else if (result?.twoFactorRequired) {
      router.push("/login/verify");
    }
    // Server-side redirect will handle successful login without 2FA
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 h-[600px] w-[600px] rounded-full bg-red-500/15 blur-[120px]" />
      <div className="absolute bottom-0 left-1/4 h-[300px] w-[300px] rounded-full bg-red-600/10 blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 h-[250px] w-[250px] rounded-full bg-red-400/5 blur-[80px]" />

      {/* Subtle radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

      <div className="relative z-10 w-full max-w-sm space-y-8 rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm shadow-2xl">
        <div className="flex flex-col items-center gap-3">
          {/* Logo with red glow behind it */}
          <div className="relative">
            <div className="absolute inset-0 scale-150 rounded-full bg-red-500/20 blur-3xl" />
            <img src="/image-removebg-preview.png" alt="RedSwan" className="relative h-40 w-40 object-contain drop-shadow-[0_0_30px_rgba(239,68,68,0.3)]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-center text-white">
            RedSwan Digital Real Estate
          </h1>
          <p className="text-sm text-zinc-400">
            Sign in to access the dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-zinc-300"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="flex h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/30 transition-shadow backdrop-blur-sm"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-zinc-300"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                className="flex h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 pr-11 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/30 transition-shadow backdrop-blur-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-red-600 text-sm font-medium text-white transition-all hover:bg-red-500 disabled:opacity-50 shadow-lg shadow-red-500/20 hover:shadow-red-500/30"
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
