"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { TicketsHeader } from "./tickets-header";
import { TicketsTable } from "./tickets-table";
import type { TicketStats, TicketListItem } from "@/lib/types";

interface TicketsLiveWrapperProps {
  initialStats: TicketStats;
  initialTickets: TicketListItem[];
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  currentStatus?: string;
  currentSearch?: string;
}

export function TicketsLiveWrapper({
  initialStats,
  initialTickets,
  initialPagination,
  currentStatus,
  currentSearch,
}: TicketsLiveWrapperProps) {
  const [stats, setStats] = useState(initialStats);
  const [tickets, setTickets] = useState(initialTickets);
  const [pagination, setPagination] = useState(initialPagination);
  const prevTotalRef = useRef(initialStats.total);

  const fetchLatest = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (currentStatus && currentStatus !== "all") params.set("status", currentStatus);
      if (currentSearch) params.set("search", currentSearch);
      params.set("page", String(initialPagination.page));
      params.set("limit", String(initialPagination.limit));

      const [ticketRes, statsRes] = await Promise.all([
        fetch(`/api/tickets?${params}`),
        fetch("/api/tickets/stats"),
      ]);

      if (ticketRes.ok) {
        const data = await ticketRes.json();
        setTickets(data.tickets);
        setPagination(data.pagination);
      }

      if (statsRes.ok) {
        const newStats: TicketStats = await statsRes.json();
        if (newStats.total > prevTotalRef.current) {
          const diff = newStats.total - prevTotalRef.current;
          toast.info(`${diff} new ticket${diff > 1 ? "s" : ""} received`);
        }
        prevTotalRef.current = newStats.total;
        setStats(newStats);
      }
    } catch {
      // silent fail on poll
    }
  }, [currentStatus, currentSearch, initialPagination.page, initialPagination.limit]);

  useEffect(() => {
    const interval = setInterval(fetchLatest, 30_000);
    return () => clearInterval(interval);
  }, [fetchLatest]);

  // Sync when server-rendered props change (navigation)
  useEffect(() => {
    setStats(initialStats);
    setTickets(initialTickets);
    setPagination(initialPagination);
    prevTotalRef.current = initialStats.total;
  }, [initialStats, initialTickets, initialPagination]);

  return (
    <div className="space-y-6">
      <TicketsHeader stats={stats} />
      <TicketsTable
        tickets={tickets}
        pagination={pagination}
        currentStatus={currentStatus}
      />
    </div>
  );
}
