"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import type { Note } from "@/lib/types";

export function TicketNotes({ ticketId }: { ticketId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/notes`);
      if (res.ok) {
        setNotes(await res.json());
      }
    } catch {
      // silent
    }
  }, [ticketId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });
      if (res.ok) {
        setContent("");
        toast.success("Note added");
        fetchNotes();
      } else {
        toast.error("Failed to add note");
      }
    } catch {
      toast.error("Failed to add note");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Internal Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add an internal note..."
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 min-h-[80px] resize-y"
          />
          <Button type="submit" size="sm" disabled={loading || !content.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>

        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No notes yet
          </p>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="rounded-md border border-border bg-muted/30 p-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{note.authorName}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(note.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{note.content}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
