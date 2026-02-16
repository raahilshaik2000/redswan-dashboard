"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Search, Settings, LogOut, Inbox, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { TicketStatusBadge } from "@/components/tickets/ticket-status-badge";
import { CATEGORY_CONFIG } from "@/lib/category-config";
import type { TicketListItem, TicketCategory } from "@/lib/types";

const CATEGORY_BADGE_STYLES: Record<TicketCategory, string> = {
  contact_us: "bg-cyan-500/15 text-cyan-400",
  property_tokenization: "bg-orange-500/15 text-orange-400",
  job_application: "bg-purple-500/15 text-purple-400",
};

const navLinks = [
  { href: "/", label: "Dashboard", roles: ["admin", "ceo"] },
  { href: "/contact-us", label: "Contact Us" },
  { href: "/property-tokenization", label: "Property Tokenization" },
  { href: "/job-applicants", label: "Job Applicants" },
  { href: "/admin", label: "Admin", roles: ["admin"] },
] as const;

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [notifications, setNotifications] = useState<TicketListItem[]>([]);
  const [hasNew, setHasNew] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/tickets?limit=5");
      if (!res.ok) return;
      const data = await res.json();
      const tickets = data.tickets as TicketListItem[];
      setNotifications(tickets);
      setHasNew(tickets.some((t) => t.status === "new" || t.status === "pending_review"));
    } catch {
      // silent fail
    }
  }, []);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications, pathname]);

  function getBasePath() {
    if (pathname.startsWith("/property-tokenization")) return "/property-tokenization";
    if (pathname.startsWith("/job-applicants")) return "/job-applicants";
    return "/contact-us";
  }

  function pushSearch(value: string) {
    const base = getBasePath();
    const params = new URLSearchParams(searchParams);
    if (value.trim()) {
      params.set("search", value.trim());
    } else {
      params.delete("search");
    }
    params.delete("page");
    router.push(`${base}${params.toString() ? `?${params}` : ""}`);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushSearch(value), 300);
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <img src="/image-removebg-preview.png" alt="RedSwan" className="h-8 w-8 object-contain" />
          <h1 className="text-lg font-semibold tracking-tight">RedSwan Digital Real Estate</h1>
        </div>

        <nav className="hidden items-center gap-1 sm:flex">
          {navLinks
            .filter((link) => !("roles" in link && link.roles) || (link.roles as readonly string[]).includes(session?.user?.role ?? ""))
            .map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search tickets..."
            className="h-9 w-64 rounded-md border border-input bg-muted/50 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
        </div>

        <DropdownMenu onOpenChange={() => fetchNotifications()}>
          <DropdownMenuTrigger asChild>
            <button className="relative flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted">
              <Bell className="h-4 w-4 text-muted-foreground" />
              {hasNew && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-3 py-2">
              <p className="text-sm font-semibold">Recent Submissions</p>
            </div>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-1 py-6 text-muted-foreground">
                <Inbox className="h-5 w-5" />
                <p className="text-sm">No tickets yet</p>
              </div>
            ) : (
              notifications.map((ticket) => {
                const catConfig = CATEGORY_CONFIG[ticket.category];
                return (
                  <DropdownMenuItem
                    key={ticket.id}
                    className="flex flex-col items-start gap-1 px-3 py-2.5 cursor-pointer"
                    onClick={() => router.push(`/${catConfig.slug}/${ticket.id}`)}
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {ticket.firstName} {ticket.lastName}
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${CATEGORY_BADGE_STYLES[ticket.category]}`}
                        >
                          {catConfig.label}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">
                        {timeAgo(ticket.createdAt)}
                      </span>
                    </div>
                    <div className="flex w-full items-center justify-between">
                      <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                        {ticket.subject}
                      </span>
                      <TicketStatusBadge status={ticket.status} />
                    </div>
                  </DropdownMenuItem>
                );
              })
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-sm text-muted-foreground cursor-pointer">
              Close
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-muted-foreground" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-muted-foreground" />
          <span className="sr-only">Toggle theme</span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary/20 text-xs text-primary">
                  {session?.user?.name
                    ? session.user.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : session?.user?.email?.slice(0, 2).toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
