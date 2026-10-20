"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { CheckCircle, EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "lucide-react";

import { loginSchema } from "@/lib/validations";
import {
    Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  FieldGroup,
} from "@/components/ui";
import { signinAction } from "@/features/auth/actions";
import { useUIStore } from "@/store";
import { DEMO_ACCOUNTS } from "@/lib/config/demo-accounts";
import FormField from "../FormField";

const loginHighlights = [
  "Secure sign-in for Murang'a County services",
  "Follow your report from submission to action",
  "One account for county service requests",
];

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isPasswordVisible, togglePassword } = useUIStore();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const applyDemo = (account: keyof typeof DEMO_ACCOUNTS) => {
    form.setValue("email", DEMO_ACCOUNTS[account].email);
    form.setValue("password", DEMO_ACCOUNTS[account].password);
  };

  async function onSubmit(data: LoginFormValues) {
    const result = await signinAction(data);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Signed in successfully");
    const requestedRedirect = searchParams.get("redirect");
    const next =
      requestedRedirect?.startsWith("/") && !requestedRedirect.startsWith("//")
        ? requestedRedirect
        : result.redirectTo || "/my-requests";
    router.push(next);
    router.refresh();
  }

  return (
    <Card className="border-border/60 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Welcome back
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Sign in to report local issues and follow up with Murang&#39;a County.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Quick Demo Switcher */}
        <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs">
          <p className="font-semibold text-primary mb-1.5">Try a demo account:</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyDemo("citizen")}
              className="rounded bg-background px-2.5 py-1 font-medium shadow-xs border hover:bg-accent transition"
            >
              Citizen Demo
            </button>
            <button
              type="button"
              onClick={() => applyDemo("admin")}
              className="rounded bg-background px-2.5 py-1 font-medium shadow-xs border hover:bg-accent transition"
            >
              Admin Demo
            </button>
            <button
              type="button"
              onClick={() => applyDemo("officer")}
              className="rounded bg-background px-2.5 py-1 font-medium shadow-xs border hover:bg-accent transition"
            >
              Officer Demo
            </button>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="rounded-xl border border-primary/10 bg-primary/5 p-3 text-xs text-muted-foreground">
            <ul className="space-y-1">
              {loginHighlights.map((highlight) => (
                <li key={highlight} className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          <FieldGroup className="grid gap-3">
            <FormField
              control={form.control}
              name="email"
              label="Email Address"
              placeholder="name@example.com"
              autoComplete="username"
              icon={MailIcon}
            />

            <FormField
              control={form.control}
              name="password"
              label={
                <div className="flex items-center justify-between w-full">
                  <span>Password</span>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              }
              placeholder="••••••••"
              autoComplete="current-password"
              type={isPasswordVisible ? "text" : "password"}
              icon={LockIcon}
              rightContent={isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
              rightContentClassName="cursor-pointer"
              onRightContentClick={togglePassword}
            />
          </FieldGroup>

          <Field>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="h-11 w-full text-sm font-semibold"
            >
              {form.formState.isSubmitting ? "Authenticating..." : "Sign In to Portal"}
            </Button>
          </Field>
        </form>
      </CardContent>
    </Card>
  );
}
