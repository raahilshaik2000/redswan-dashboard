"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

type Step = "idle" | "sending" | "code" | "verifying";

export function SecurityTab() {
  const { data: session, update } = useSession();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [step, setStep] = useState<Step>("idle");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setTwoFactorEnabled(session?.user?.twoFactorEnabled ?? false);
  }, [session]);

  function resetCodeState() {
    setCode(["", "", "", "", "", ""]);
    setError("");
    setMessage("");
    setStep("idle");
  }

  function handleCodeChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleCodeKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleCodePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newCode = [...code];
    for (let i = 0; i < 6; i++) {
      newCode[i] = pasted[i] || "";
    }
    setCode(newCode);
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  }

  async function handleEnable() {
    setStep("sending");
    setError("");

    try {
      const res = await fetch("/api/user/2fa/enable", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to send code");
        setStep("idle");
        return;
      }
      setStep("code");
      setCode(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch {
      setError("Something went wrong");
      setStep("idle");
    }
  }

  async function handleDisable() {
    setStep("sending");
    setError("");

    try {
      const res = await fetch("/api/user/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sendCode: true }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to send code");
        setStep("idle");
        return;
      }
      setStep("code");
      setCode(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch {
      setError("Something went wrong");
      setStep("idle");
    }
  }

  async function handleVerify() {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setStep("verifying");
    setError("");

    try {
      const endpoint = twoFactorEnabled
        ? "/api/user/2fa/disable"
        : "/api/user/2fa/verify";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: fullCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed");
        setStep("code");
        return;
      }

      const newState = !twoFactorEnabled;
      setTwoFactorEnabled(newState);
      await update({ twoFactorEnabled: newState });
      setMessage(newState ? "Two-factor authentication enabled" : "Two-factor authentication disabled");
      setStep("idle");
      setCode(["", "", "", "", "", ""]);
    } catch {
      setError("Something went wrong");
      setStep("code");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between rounded-lg border border-border p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
            <Shield className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium">Two-Factor Authentication</h3>
              <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
                {twoFactorEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Add an extra layer of security by requiring a verification code sent to your email when signing in.
            </p>
          </div>
        </div>
      </div>

      {step === "idle" && (
        <button
          onClick={twoFactorEnabled ? handleDisable : handleEnable}
          className={`flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors ${
            twoFactorEnabled
              ? "border border-border bg-background text-foreground hover:bg-muted"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
        </button>
      )}

      {step === "sending" && (
        <p className="text-sm text-muted-foreground">Sending verification code...</p>
      )}

      {(step === "code" || step === "verifying") && (
        <div className="space-y-4 rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code sent to your email
          </p>
          <div className="flex gap-2" onPaste={handleCodePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(i, e.target.value)}
                onKeyDown={(e) => handleCodeKeyDown(i, e)}
                className="h-12 w-10 rounded-md border border-input bg-muted/50 text-center text-lg font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleVerify}
              disabled={step === "verifying"}
              className="flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {step === "verifying" ? "Verifying..." : "Verify"}
            </button>
            <button
              onClick={resetCodeState}
              className="flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
      {message && <p className="text-sm text-emerald-500">{message}</p>}
    </div>
  );
}
