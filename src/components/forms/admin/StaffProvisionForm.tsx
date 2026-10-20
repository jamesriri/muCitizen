"use client";

import * as React from "react";
import { useTransition } from "react";
import { toast } from "sonner";
import { UserPlus, Loader2, CheckCircle2 } from "lucide-react";
import { Role } from "@/types/domain";
import { provisionStaffAction } from "@/features/admin/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function StaffProvisionForm() {
  const [isPending, startTransition] = useTransition();
  const [createdPass, setCreatedPass] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await provisionStaffAction(formData);
      if (res.success && res.temporaryPassword) {
        setCreatedPass(res.temporaryPassword);
        toast.success("Officer account provisioned successfully!");
        form.reset();
      } else {
        toast.error(res.error || "Failed to provision account");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">Provision New Staff</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Create verified accounts for county staff and field officers
        </CardDescription>
      </CardHeader>
      <CardContent>
        {createdPass && (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 mb-1">
              <CheckCircle2 className="h-4 w-4" /> Account Created
            </div>
            <p className="text-muted-foreground mb-1">Temporary Password:</p>
            <p className="font-mono text-sm font-extrabold text-foreground bg-background p-1.5 rounded border select-all">
              {createdPass}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Deliver this securely to the officer.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-xs">Full Official Name *</Label>
            <Input id="fullName" name="fullName" placeholder="e.g. Samuel Mutiso" className="h-9 text-xs" required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs">Official Email *</Label>
            <Input id="email" name="email" type="email" placeholder="officer@example.go.ke" className="h-9 text-xs" required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nationalId" className="text-xs">Staff/National ID *</Label>
            <Input id="nationalId" name="nationalId" placeholder="GOV-89021" className="h-9 text-xs" required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role" className="text-xs">Role Assignment *</Label>
            <select
              id="role"
              name="role"
              defaultValue={Role.OFFICER}
              className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-hidden"
            >
              <option value={Role.OFFICER}>Field Officer (Incident Triage & Resolution)</option>
              <option value={Role.SUPER_ADMIN}>Super Administrator (Full System Control)</option>
            </select>
          </div>

          <Button type="submit" disabled={isPending} className="w-full h-9 text-xs font-semibold gap-2 mt-2">
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Provisioning...
              </>
            ) : (
              "Provision Account"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
