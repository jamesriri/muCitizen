"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Bell, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
} from "@/components/ui";
import FormField from "@/components/forms/FormField";
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "@/lib/validations";
import {
  updateNotificationPreferencesAction,
  updatePasswordAction,
} from "@/features/account/actions/settings.action";

interface AccountSecuritySettingsProps {
  emailRequestUpdates: boolean;
  smsRequestUpdates: boolean;
}

export default function AccountSecuritySettings({
  emailRequestUpdates: initialEmailPreference,
  smsRequestUpdates: initialSmsPreference,
}: AccountSecuritySettingsProps) {
  const [emailRequestUpdates, setEmailRequestUpdates] = useState(
    initialEmailPreference,
  );
  const [smsRequestUpdates, setSmsRequestUpdates] = useState(
    initialSmsPreference,
  );
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const savePassword = async (data: ChangePasswordInput) => {
    try {
      const result = await updatePasswordAction(data);
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      passwordForm.reset();
      toast.success(result.message);
    } catch {
      toast.error("We couldn't update your password. Please try again.");
    }
  };

  const savePreferences = async () => {
    setIsSavingPreferences(true);
    try {
      const result = await updateNotificationPreferencesAction({
        emailRequestUpdates,
        smsRequestUpdates,
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
    } catch {
      toast.error("We couldn't save your notification preferences.");
    } finally {
      setIsSavingPreferences(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="size-4 text-primary" />
            Change password
          </CardTitle>
          <CardDescription>
            Confirm your current password before setting a new one.
          </CardDescription>
        </CardHeader>
        <CardContent className="border-t border-border/70 pt-5">
          <form
            onSubmit={passwordForm.handleSubmit(savePassword)}
            className="space-y-4"
          >
            <FormField
              control={passwordForm.control}
              name="currentPassword"
              label="Current password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your current password"
              icon={LockKeyhole}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={passwordForm.control}
                name="newPassword"
                label="New password"
                type="password"
                autoComplete="new-password"
                placeholder="Create a strong password"
                description="At least 8 characters, including upper and lowercase letters, a number, and a symbol."
                icon={LockKeyhole}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                label="Confirm new password"
                type="password"
                autoComplete="new-password"
                placeholder="Enter the new password again"
                icon={LockKeyhole}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                {passwordForm.formState.isSubmitting
                  ? "Updating password…"
                  : "Update password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="size-4 text-primary" />
            Notification preferences
          </CardTitle>
          <CardDescription>
            Choose how you would like to receive updates about your service requests.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 border-t border-border/70 pt-5">
          <label className="flex cursor-pointer items-start gap-3">
            <Checkbox
              checked={emailRequestUpdates}
              onCheckedChange={(checked) =>
                setEmailRequestUpdates(checked === true)
              }
              aria-label="Email request updates"
              className="mt-0.5"
            />
            <span>
              <span className="block text-sm font-medium">Email updates</span>
              <span className="mt-1 block text-xs text-muted-foreground">
                Receive status changes and important service-request updates by email.
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <Checkbox
              checked={smsRequestUpdates}
              onCheckedChange={(checked) =>
                setSmsRequestUpdates(checked === true)
              }
              aria-label="SMS request updates"
              className="mt-0.5"
            />
            <span>
              <span className="block text-sm font-medium">SMS updates</span>
              <span className="mt-1 block text-xs text-muted-foreground">
                Receive concise status notifications on your registered phone number.
              </span>
            </span>
          </label>
          <p className="text-xs text-muted-foreground">
            Your choices are saved to your account. Notification delivery needs to be
            configured by the portal administrator.
          </p>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isSavingPreferences}
              onClick={savePreferences}
            >
              {isSavingPreferences ? "Saving…" : "Save preferences"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
            Two-factor authentication
          </CardTitle>
          <CardDescription>
            Add an authenticator app as another layer of account protection.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 border-t border-border/70 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="size-2 rounded-full bg-muted-foreground/50" />
            Not enabled
          </div>
          <Button type="button" variant="outline" disabled>
            Setup unavailable
          </Button>
          <p className="text-xs text-muted-foreground sm:max-w-xs sm:text-right">
            Two-factor enrollment is not available yet. No 2FA protection is active
            on this account.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
