"use client";

import { Download, Eye, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function RequestExportActions({
  referenceNumber,
}: {
  referenceNumber: string;
}) {
  const pdfUrl = `/api/requests/${encodeURIComponent(referenceNumber)}/pdf`;
  const previewUrl = `${pdfUrl}?preview=1`;

  async function shareRequest() {
    const url = new URL(
      `/track?code=${encodeURIComponent(referenceNumber)}`,
      window.location.origin,
    ).toString();

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Service request ${referenceNumber}`,
          text: "View the public status of this county service report.",
          url,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Public tracking link copied");
    } catch {
      toast.error("Could not copy the tracking link. Please copy it from the public view.");
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        nativeButton={false}
        render={<a href={previewUrl} target="_blank" rel="noreferrer" />}
      >
        <Eye className="h-3.5 w-3.5" />
        Preview PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        nativeButton={false}
        render={<a href={pdfUrl} download />}
      >
        <Download className="h-3.5 w-3.5" />
        Download PDF
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5"
        onClick={shareRequest}
      >
        <Share2 className="h-3.5 w-3.5" />
        Share
      </Button>
    </>
  );
}
