"use client";

import * as React from "react";
import { useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
import { RequestStatus } from "@/types/domain";
import { updateRequestStatusAction } from "@/features/admin/actions";
import {
    Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label, 
  Textarea
} from "@/components/ui";

interface StatusUpdateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  request: {
    id: string;
    referenceNumber: string;
    status: RequestStatus;
  } | null;
}

export function StatusUpdateDialog({
  isOpen,
  onOpenChange,
  request,
}: StatusUpdateDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = React.useState<{
    requestId: string;
    status: RequestStatus;
    comment: string;
    isInternal: boolean;
  } | null>(null);
  if (!request) return null;
  const activeDraft =
    draft?.requestId === request.id
      ? draft
      : {
          requestId: request.id,
          status: request.status,
          comment: "",
          isInternal: false,
        };
  const selectedStatus = activeDraft.status;
  const comment = activeDraft.comment;
  const isInternal = activeDraft.isInternal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("requestId", request.id);
    formData.append("newStatus", selectedStatus);
    formData.append("comment", comment);
    formData.append("isInternal", isInternal.toString());

    startTransition(async () => {
      const res = await updateRequestStatusAction(formData);
      if (res.success) {
        toast.success(`Request ${request.referenceNumber} status updated to ${selectedStatus}`);
        onOpenChange(false);
      } else {
        toast.error(res.error || "Failed to update status");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-lg">Update Incident Status</DialogTitle>
            <DialogDescription>
              Transition status for case{" "}
              <span className="font-mono font-bold text-primary">
                {request.referenceNumber}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">New Incident State *</Label>
              <select
                id="status"
                value={selectedStatus}
                onChange={(e) =>
                  setDraft({ ...activeDraft, status: e.target.value as RequestStatus })
                }
                className="w-full h-11 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-hidden"
              >
                <option value={RequestStatus.PENDING}>Pending Review</option>
                <option value={RequestStatus.IN_REVIEW}>Under Triage / In Review</option>
                <option value={RequestStatus.IN_PROGRESS}>In Field Dispatch / In Progress</option>
                <option value={RequestStatus.RESOLVED}>Resolved & Closed</option>
                <option value={RequestStatus.REJECTED}>Rejected (Out of Scope)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Officer Action Log Note *</Label>
              <Textarea
                id="comment"
                placeholder="Explain the field actions taken, department dispatched, or reason for status transition..."
                value={comment}
                onChange={(e) => setDraft({ ...activeDraft, comment: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                id="isInternal"
                type="checkbox"
                checked={isInternal}
                onChange={(e) =>
                  setDraft({ ...activeDraft, isInternal: e.target.checked })
                }
                className="h-4 w-4 rounded border-input text-primary"
              />
              <Label htmlFor="isInternal" className="text-xs font-normal text-muted-foreground cursor-pointer">
                Mark as internal note (hide from public tracking page)
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Updating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Save Status
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
