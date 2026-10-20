"use client";

import * as React from "react";
import Image from "next/image";
import { 
    Badge,
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  Separator
} from "@/components/ui";
import { MapPin, ShieldCheck } from "lucide-react";

interface RequestDetailSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  request: any | null;
}

export function RequestDetailSheet({
  isOpen,
  onOpenChange,
  request,
}: RequestDetailSheetProps) {
  if (!request) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        overlayClassName="z-[1100] bg-black/30"
        className="z-1101 w-full overflow-y-auto p-6 sm:max-w-xl"
      >
        <SheetHeader className="text-left space-y-1 pb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary">
              {request.referenceNumber}
            </span>
            <Badge variant="outline" className="text-[10px]">
              {request.category.name}
            </Badge>
          </div>
          <SheetTitle className="text-xl font-bold leading-tight">
            {request.title}
          </SheetTitle>
          <SheetDescription className="text-xs">
            Reported by {request.citizen.fullName} ({request.citizen.email})
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 pt-2">
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border bg-muted/30 text-xs">
            <div>
              <span className="text-muted-foreground">Current State:</span>
              <p className="font-semibold text-foreground capitalize mt-0.5">
                {request.status.toLowerCase().replace("_", " ")}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Priority Level:</span>
              <p className="font-semibold text-foreground capitalize mt-0.5">
                {request.priority.toLowerCase()}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Assigned Officer:</span>
              <p className="font-semibold text-foreground mt-0.5">
                {request.assignedTo?.fullName || "Unassigned"}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">SLA Window:</span>
              <p className="font-semibold text-foreground mt-0.5">
                {request.category.slaHours} Hours
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>Location & Landmark</span>
            </div>
            <p className="text-sm font-medium text-foreground">{request.locationAddress}</p>
            {request.latitude && request.longitude && (
              <p className="text-xs font-mono text-muted-foreground">
                GPS: {request.latitude.toFixed(5)}, {request.longitude.toFixed(5)}
              </p>
            )}
          </div>

          <Separator />

          <div className="space-y-1.5">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              Description of Hazard
            </span>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {request.description}
            </p>
          </div>

          {request.attachments && request.attachments.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase text-muted-foreground">
                On-Site Evidence Attachment
              </span>
              <div className="grid grid-cols-1 gap-2">
                {request.attachments.map((att: { id: string; fileUrl: string; fileName: string }) => (
                  <AttachmentPreview
                    key={att.id}
                    fileUrl={att.fileUrl}
                    fileName={att.fileName}
                  />
                ))}
              </div>
            </div>
          )}

          <Separator />

 
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Audit History & Officer Notes</span>
            </div>

            <div className="border-l-2 border-border pl-4 space-y-4">
              {request.auditLogs.map((log: {
                id: string;
                action: string;
                comment: string | null;
                createdAt: string | Date;
                isInternal: boolean;
                actor?: { fullName: string; role: string } | null;
              }) => (
                <div key={log.id} className="relative space-y-1 text-xs">
                  <div className="absolute -left-5.25 top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">
                      {log.action}
                      {log.isInternal && (
                        <span className="ml-2 text-[10px] font-normal text-amber-500 border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 rounded">
                          Internal Note
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {log.comment && (
                    <p className="text-muted-foreground text-xs leading-relaxed">{log.comment}</p>
                  )}
                  {log.actor && (
                    <p className="text-[10px] text-muted-foreground">
                      Actor: {log.actor.fullName} ({log.actor.role})
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function AttachmentPreview({
  fileUrl,
  fileName,
}: {
  fileUrl: string;
  fileName: string;
}) {
  const [hasLoadError, setHasLoadError] = React.useState(false);
  const isSupportedSource =
    fileUrl.startsWith("/") || /^https?:\/\//i.test(fileUrl);

  if (!isSupportedSource || hasLoadError) {
    return (
      <div className="flex min-h-24 items-center justify-between gap-4 rounded-xl border bg-muted/30 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{fileName}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Image preview is unavailable.
          </p>
        </div>
        {isSupportedSource ? (
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 text-xs font-semibold text-primary underline-offset-4 hover:underline"
          >
            Open file
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <div className="relative h-60 w-full overflow-hidden rounded-xl border bg-muted/30">
      <Image
        src={fileUrl}
        alt={fileName}
        fill
        unoptimized
        onError={() => setHasLoadError(true)}
        className="object-cover"
      />
    </div>
  );
}
