"use client";

import * as React from "react";
import { useTransition } from "react";
import { toast } from "sonner";
import { UserCheck, Loader2 } from "lucide-react";
import { assignOfficerAction } from "@/features/admin/actions";
import {
    Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
} from "@/components/ui";

interface AssignOfficerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  request: {
    id: string;
    referenceNumber: string;
    assignedToId?: string | null;
  } | null;
  officers: Array<{
    id: string;
    fullName: string;
    email: string;
    role: string;
  }>;
}

export function AssignOfficerDialog({
  isOpen,
  onOpenChange,
  request,
  officers,
}: AssignOfficerDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedOfficer, setSelectedOfficer] = React.useState<{
    requestId: string;
    officerId: string;
  } | null>(null);
  if (!request) return null;
  const selectedOfficerId =
    selectedOfficer?.requestId === request.id
      ? selectedOfficer.officerId
      : request.assignedToId || officers[0]?.id || "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("requestId", request.id);
    formData.append("officerId", selectedOfficerId);

    startTransition(async () => {
      const res = await assignOfficerAction(formData);
      if (res.success) {
        toast.success(`Assigned incident ${request.referenceNumber} successfully`);
        onOpenChange(false);
      } else {
        toast.error(res.error || "Failed to assign officer");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-lg">Assign Field Officer</DialogTitle>
            <DialogDescription>
              Assign incident{" "}
              <span className="font-mono font-bold text-primary">
                {request.referenceNumber}
              </span>{" "}
              to an active county officer
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-2">
            <Label htmlFor="officer">Available Officers & Admins *</Label>
            <select
              id="officer"
              value={selectedOfficerId}
              onChange={(e) =>
                setSelectedOfficer({
                  requestId: request.id,
                  officerId: e.target.value,
                })
              }
              className="w-full h-11 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-hidden"
              required
            >
              {officers.map((officer) => (
                <option key={officer.id} value={officer.id}>
                  {officer.fullName} ({officer.role}) — {officer.email}
                </option>
              ))}
            </select>
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
                  <Loader2 className="h-4 w-4 animate-spin" /> Assigning...
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4" /> Confirm Assignment
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
