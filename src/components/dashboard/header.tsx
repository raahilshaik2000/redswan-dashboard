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
import { Bell, Search, Settings, LogOut, User, Inbox, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { TicketStatusBadge } from "@/components/tickets/ticket-status-badge";
import type { TicketListItem } from "@/lib/types";

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/tickets", label: "Tickets" },
];

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

  function pushSearch(value: string) {
    const params = new URLSearchParams(searchParams);
    if (value.trim()) {
      params.set("search", value.trim());
    } else {
      params.delete("search");
    }
    params.delete("page");
    router.push(`/tickets${params.toString() ? `?${params}` : ""}`);
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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">
              RS
            </span>
          </div>
          <h1 className="text-lg font-semibold tracking-tight">RedSwan</h1>
        </div>

        <nav className="hidden items-center gap-1 sm:flex">
          {navLinks.map((link) => {
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
              notifications.map((ticket) => (
                <DropdownMenuItem
                  key={ticket.id}
                  className="flex flex-col items-start gap-1 px-3 py-2.5 cursor-pointer"
                  onClick={() => router.push(`/tickets/${ticket.id}`)}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-sm font-medium">
                      {ticket.firstName} {ticket.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground">
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
              ))
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
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
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
