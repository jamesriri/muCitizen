"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, Loader2, KeyRound, ExternalLink } from "lucide-react";

import {
  forgotPasswordSchema,
  ForgotPasswordInput,
} from "@/lib/validations";
import { requestPasswordResetAction } from "@/features/auth/actions";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { FormField } from "@/components/forms";

export default function ForgotPasswordForm() {
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [devUrl, setDevUrl] = React.useState<string | null>(null);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      const res = await requestPasswordResetAction(data);
      if (!res.success) {
        toast.error(res.message);
        return;
      }

      setIsSuccess(true);
      setDevUrl(res.devResetUrl ?? null);
      toast.success("Recovery request received");
    } catch {
      toast.error("We couldn't create a recovery link. Please try again.");
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl border-border/60">
      <CardHeader className="text-center space-y-1">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2">
          <KeyRound className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Reset Your Password</CardTitle>
        <CardDescription>
          Enter the email address associated with your portal account.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isSuccess ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-foreground space-y-2">
              <p className="font-bold text-primary text-sm">Request received</p>
              <p className="leading-relaxed">
                If an account exists for that address, you can continue with the
                recovery link below. For privacy, this page won&apos;t confirm
                whether an account exists.
              </p>
            </div>

            {devUrl && (
              <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
                <p className="font-semibold">Continue in this development environment</p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Email delivery is not configured. This one-time link expires
                  after one hour.
                </p>
                <Button
                  size="sm"
                  className="h-9 w-full gap-2"
                  nativeButton={false}
                  render={<Link href={devUrl} />}
                >
                  <span>Set a new password</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setIsSuccess(false);
                setDevUrl(null);
                form.reset();
              }}
            >
              Try another email address
            </Button>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              label="Email Address"
              placeholder="e.g. jane@example.com"
              type="email"
              autoComplete="email"
              icon={Mail}
            />

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full h-11 text-sm font-semibold mt-2"
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating
                  secure link…
                </>
              ) : (
              "Continue"
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
