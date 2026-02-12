"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TicketStatusBadge } from "./ticket-status-badge";
import type { TicketListItem, TicketStatus } from "@/lib/types";
import { ChevronLeft, ChevronRight, Archive, X, Download } from "lucide-react";

interface TicketsTableProps {
  tickets: TicketListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  currentStatus?: string;
}

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "pending_review", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "sent", label: "Sent" },
  { value: "archived", label: "Archived" },
];

export function TicketsTable({
  tickets,
  pagination,
  currentStatus,
}: TicketsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  function navigate(status?: string, page?: number) {
    const params = new URLSearchParams();
    const s = status ?? currentStatus;
    if (s && s !== "all") params.set("status", s);
    if (page && page > 1) params.set("page", String(page));
    const currentSearch = searchParams.get("search");
    if (currentSearch) params.set("search", currentSearch);
    router.push(`/tickets${params.toString() ? `?${params}` : ""}`);
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === tickets.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(tickets.map((t) => t.id)));
    }
  }

  async function handleBulkArchive() {
    if (selected.size === 0) return;
    setBulkLoading(true);
    try {
      const res = await fetch("/api/tickets/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected), action: "archive" }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`${data.updated} ticket${data.updated !== 1 ? "s" : ""} archived`);
        setSelected(new Set());
        router.refresh();
      } else {
        toast.error("Failed to archive tickets");
      }
    } catch {
      toast.error("Failed to archive tickets");
    } finally {
      setBulkLoading(false);
    }
  }

  async function handleExportCSV() {
    const params = new URLSearchParams();
    if (currentStatus && currentStatus !== "all") params.set("status", currentStatus);
    const currentSearch = searchParams.get("search");
    if (currentSearch) params.set("search", currentSearch);

    try {
      const res = await fetch(`/api/tickets/export?${params}`);
      if (!res.ok) {
        toast.error("Failed to export");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tickets-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exported");
    } catch {
      toast.error("Failed to export");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Support Tickets</CardTitle>
        <CardDescription>
          Review and respond to customer inquiries
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Tabs
            value={currentStatus || "all"}
            onValueChange={(v) => {
              setSelected(new Set());
              navigate(v, 1);
            }}
          >
            <TabsList>
              {STATUS_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="mr-1.5 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {selected.size > 0 && (
          <div className="flex items-center gap-3 rounded-md border border-border bg-muted/50 px-4 py-2">
            <span className="text-sm font-medium">
              {selected.size} selected
            </span>
            <Button
              variant="destructive"
              size="sm"
              disabled={bulkLoading}
              onClick={handleBulkArchive}
            >
              <Archive className="mr-1.5 h-4 w-4" />
              Archive Selected
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelected(new Set())}
            >
              <X className="mr-1.5 h-4 w-4" />
              Clear
            </Button>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={tickets.length > 0 && selected.size === tickets.length}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No tickets found
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => (
                <TableRow
                  key={ticket.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/tickets/${ticket.id}`)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selected.has(ticket.id)}
                      onCheckedChange={() => toggleSelect(ticket.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {ticket.firstName} {ticket.lastName}
                  </TableCell>
                  <TableCell>{ticket.subject}</TableCell>
                  <TableCell>
                    <TicketStatusBadge
                      status={ticket.status as TicketStatus}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground hover:text-foreground">
                    View
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} tickets)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => navigate(undefined, pagination.page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => navigate(undefined, pagination.page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
