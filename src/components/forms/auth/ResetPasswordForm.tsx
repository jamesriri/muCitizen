"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Lock, EyeIcon, EyeOffIcon, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";

import {
  resetPasswordSchema,
  ResetPasswordInput,
} from "@/lib/validations";
import { completePasswordResetAction } from "@/features/auth/actions";
import { useUIStore } from "@/store";
import {
    Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { FormField } from "@/components/forms";

export default function ResetPasswordForm({ token }: { token: string | null }) {
  const router = useRouter();
  const { isPasswordVisible, togglePassword } = useUIStore();

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    const res = await completePasswordResetAction(data);
    if (!res.success) {
      toast.error(res.message);
      return;
    }

    toast.success(res.message);
    router.push("/login");
  };

  if (!token) {
    return (
      <Card className="w-full max-w-md shadow-xl border-border/60 text-center p-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-3">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl font-bold">Invalid Recovery Link</CardTitle>
        <CardDescription className="text-xs pt-1">
          No verification token was detected in your request URL.
        </CardDescription>
        <Button
          className="mt-6 w-full text-xs"
          variant="outline"
          nativeButton={false}
          render={<Link href="/forgot-password" />}
        >
          Request a New Link
        </Button>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-xl border-border/60">
      <CardHeader className="text-center space-y-1">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Create New Password</CardTitle>
        <CardDescription>
          Choose a secure passkey to protect your verified citizen profile
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="newPassword"
            label="New Password"
            placeholder="••••••••"
            type={isPasswordVisible ? "text" : "password"}
            autoComplete="new-password"
            description="Minimum 8 characters with 1 uppercase letter and 1 number."
            icon={Lock}
            rightContent={isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
            rightContentClassName="cursor-pointer"
            onRightContentClick={togglePassword}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            label="Confirm New Password"
            placeholder="••••••••"
            type={isPasswordVisible ? "text" : "password"}
            autoComplete="new-password"
            icon={Lock}
            rightContent={isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
            rightContentClassName="cursor-pointer"
            onRightContentClick={togglePassword}
          />

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="mt-2 h-11 w-full text-sm font-semibold"
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating Password...
              </>
            ) : (
              "Save New Password"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
