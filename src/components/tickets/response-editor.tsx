"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Send, Archive, RotateCcw, X } from "lucide-react";
import type { Ticket } from "@/lib/types";

export function ResponseEditor({ ticket }: { ticket: Ticket }) {
  const router = useRouter();
  const [subject, setSubject] = useState(
    ticket.finalSubject || ticket.aiDraftSubject
  );
  const [body, setBody] = useState(
    ticket.finalResponse || ticket.aiDraftResponse
  );
  const [isPending, startTransition] = useTransition();
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  async function saveDraft() {
    const res = await fetch(`/api/tickets/${ticket.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        finalSubject: subject,
        finalResponse: body,
        status: ticket.status === "new" ? "pending_review" : undefined,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error || "Failed to save draft");
      return;
    }
    toast.success("Draft saved");
    startTransition(() => router.refresh());
  }

  async function approveAndSend() {
    // Save the final response first
    const saveRes = await fetch(`/api/tickets/${ticket.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        finalSubject: subject,
        finalResponse: body,
        status:
          ticket.status === "new" || ticket.status === "approved"
            ? "pending_review"
            : undefined,
      }),
    });
    if (!saveRes.ok) {
      const data = await saveRes.json();
      toast.error(data.error || "Failed to save response");
      return;
    }

    // Start countdown
    cancelledRef.current = false;
    setCountdown(5);

    let secondsLeft = 5;
    timerRef.current = setInterval(() => {
      secondsLeft -= 1;
      setCountdown(secondsLeft);

      if (secondsLeft <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        setCountdown(null);

        if (!cancelledRef.current) {
          doSend();
        }
      }
    }, 1000);
  }

  function cancelSend() {
    cancelledRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setCountdown(null);
    toast.info("Send cancelled. Draft has been saved.");
  }

  async function doSend() {
    const res = await fetch(`/api/tickets/${ticket.id}/approve`, {
      method: "POST",
    });
    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error || "Failed to approve");
      return;
    }
    toast.success("Response approved and sent!");
    startTransition(() => router.refresh());
  }

  async function archive() {
    const res = await fetch(`/api/tickets/${ticket.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "archived" }),
    });
    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error || "Failed to archive");
      return;
    }
    toast.success("Ticket archived");
    startTransition(() => router.refresh());
  }

  async function reopen() {
    const res = await fetch(`/api/tickets/${ticket.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "new" }),
    });
    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error || "Failed to reopen");
      return;
    }
    toast.success("Ticket reopened");
    startTransition(() => router.refresh());
  }

  const isSent = ticket.status === "sent";
  const isArchived = ticket.status === "archived";
  const canApprove =
    ticket.status === "pending_review" || ticket.status === "new";
  const isCounting = countdown !== null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Email Response</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {ticket.aiDraftSubject &&
          ticket.aiDraftSubject !== subject && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                AI Draft Subject (original)
              </p>
              <div className="rounded-md bg-muted/30 p-2 text-xs">
                {ticket.aiDraftSubject}
              </div>
            </div>
          )}

        {ticket.aiDraftResponse &&
          ticket.aiDraftResponse !== body && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                AI Draft Body (original)
              </p>
              <div className="max-h-32 overflow-y-auto rounded-md bg-muted/30 p-2 text-xs whitespace-pre-wrap">
                {ticket.aiDraftResponse}
              </div>
            </div>
          )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Subject Line</label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject line..."
            disabled={isSent || isArchived || isPending || isCounting}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Email Body</label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your response..."
            rows={10}
            disabled={isSent || isArchived || isPending || isCounting}
            className="resize-y"
          />
        </div>

        {isCounting && (
          <div className="flex items-center justify-between rounded-md bg-amber-500/10 px-4 py-3">
            <p className="text-sm font-medium text-amber-500">
              Sending in {countdown}s...
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={cancelSend}
              className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:text-amber-500"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {!isSent && !isArchived && !isCounting && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={saveDraft}
                disabled={isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={archive}
                disabled={isPending}
              >
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </Button>
              {canApprove && (
                <Button
                  size="sm"
                  onClick={approveAndSend}
                  disabled={isPending || !body.trim()}
                  className="ml-auto"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Approve & Send
                </Button>
              )}
            </>
          )}
          {isArchived && (
            <Button
              variant="outline"
              size="sm"
              onClick={reopen}
              disabled={isPending}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reopen
            </Button>
          )}
          {isSent && (
            <p className="text-sm text-muted-foreground">
              This response has been sent to the customer.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
