"use client";

import { useState } from "react";
import { Paperclip, FileText } from "lucide-react";
import { PdfViewerModal } from "./pdf-viewer-modal";
import type { Attachment } from "@/lib/types";

export function AttachmentList({ attachments }: { attachments: Attachment[] }) {
  const [viewing, setViewing] = useState<Attachment | null>(null);

  return (
    <>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Paperclip className="h-5 w-5" />
          Attachments
        </h3>
        <div className="space-y-1">
          {attachments.map((att) => (
            <button
              key={att.id}
              onClick={() => setViewing(att)}
              className="group flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted/50 hover:border-primary/30 text-left transition-all"
            >
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="flex-1 truncate">{att.fileName}</span>
              {att.fileSize && (
                <span className="text-xs text-muted-foreground">
                  {(att.fileSize / 1024).toFixed(0)} KB
                </span>
              )}
              <span className="text-xs font-medium text-primary group-hover:text-primary/80 group-hover:underline">View</span>
            </button>
          ))}
        </div>
      </div>

      {viewing && (
        <PdfViewerModal
          url={viewing.fileUrl}
          fileName={viewing.fileName}
          onClose={() => setViewing(null)}
        />
      )}
    </>
  );
}
