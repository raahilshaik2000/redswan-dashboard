"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Eye, EyeOff, Shield, Crown, Briefcase } from "lucide-react";

export function ProfileTab() {
  const { data: session, update } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          setName(data.name || "");
          setEmail(data.email || "");
          return;
        }
      } catch {
        // fall through to session fallback
      }
      // Fallback to session data if API fails
      if (session?.user) {
        setName(session.user.name || "");
        setEmail(session.user.email || "");
      }
    }
    loadProfile();
  }, [session]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const body: Record<string, string> = { name };
      if (newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
        body.confirmPassword = confirmPassword;
      }

      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
      } else {
        setMessage("Profile updated");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        // Update session name if changed
        if (session?.user?.name !== name) {
          await update({ name });
        }
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            disabled
            className="flex h-10 w-full rounded-md border border-input bg-muted/30 px-3 text-sm text-muted-foreground cursor-not-allowed"
          />
        </div>

      </div>

      {/* Role Card */}
      {(() => {
        const role = session?.user?.role || "employee";
        const config = {
          admin: {
            icon: Shield,
            label: "Administrator",
            description: "Full system access including user management",
            gradient: "from-violet-500/10 to-violet-600/5",
            border: "border-violet-500/20",
            iconBg: "bg-violet-500/10",
            iconColor: "text-violet-500",
            textColor: "text-violet-500",
          },
          ceo: {
            icon: Crown,
            label: "CEO",
            description: "Executive access with dashboard analytics",
            gradient: "from-amber-500/10 to-amber-600/5",
            border: "border-amber-500/20",
            iconBg: "bg-amber-500/10",
            iconColor: "text-amber-500",
            textColor: "text-amber-500",
          },
          employee: {
            icon: Briefcase,
            label: "Employee",
            description: "Access to forms and ticket management",
            gradient: "from-sky-500/10 to-sky-600/5",
            border: "border-sky-500/20",
            iconBg: "bg-sky-500/10",
            iconColor: "text-sky-500",
            textColor: "text-sky-500",
          },
        }[role] || {
          icon: Briefcase,
          label: role,
          description: "",
          gradient: "from-muted/50 to-muted/30",
          border: "border-border",
          iconBg: "bg-muted",
          iconColor: "text-muted-foreground",
          textColor: "text-muted-foreground",
        };
        const Icon = config.icon;
        return (
          <div className={`relative overflow-hidden rounded-xl border ${config.border} bg-gradient-to-br ${config.gradient} p-4`}>
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${config.iconBg}`}>
                <Icon className={`h-6 w-6 ${config.iconColor}`} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${config.textColor}`}>
                    {config.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {config.description}
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="border-t border-border pt-6">
        <h3 className="text-sm font-medium text-foreground mb-4">Change Password</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="currentPassword" className="text-sm font-medium text-foreground">
              Current Password
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="newPassword" className="text-sm font-medium text-foreground">
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {message && <p className="text-sm text-emerald-500">{message}</p>}

      <button
        type="submit"
        disabled={saving}
        className="flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
