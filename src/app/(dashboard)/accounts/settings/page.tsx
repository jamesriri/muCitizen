import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MonitorCog, ShieldCheck } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { ThemeToggle } from "@/components/shared";
import AccountSecuritySettings from "@/components/account/AccountSecuritySettings";
import { db } from "@/lib/db/prisma";
import { requireRole } from "@/lib/security";
import { Role } from "@/types/domain";
import { getDashboardPath } from "@/lib/config/navigation";

export const metadata = {
  title: "Settings | muCitizen",
};

export default async function SettingsPage() {
  const session = await requireRole([
    Role.CITIZEN,
    Role.OFFICER,
    Role.SUPER_ADMIN,
  ]);
  const dashboardPath = getDashboardPath(session.role);
  const preferences = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      emailRequestUpdates: true,
      smsRequestUpdates: true,
    },
  });
  if (!preferences) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          aria-label="Back to dashboard"
          nativeButton={false}
          render={<Link href={dashboardPath} />}
        >
          <ArrowLeft />
        </Button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Personal workspace
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Account settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your sign-in security and service update preferences.
          </p>
        </div>
      </div>

      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MonitorCog className="size-4 text-primary" />
            Appearance
          </CardTitle>
          <CardDescription>
            Choose a light or dark interface, or follow your device preference.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4 border-t border-border/70 py-4">
          <div>
            <p className="text-sm font-medium">Color theme</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Your choice is saved on this device.
            </p>
          </div>
          <ThemeToggle />
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
            Account security
          </CardTitle>
          <CardDescription>
            Your session is protected with a secure, HTTP-only sign-in cookie.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 py-4">
          <div>
            <p className="text-sm font-medium">Signed-in account</p>
            <p className="mt-1 text-sm text-muted-foreground">{session.email}</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Protected session
          </span>
        </CardContent>
      </Card>

      <AccountSecuritySettings
        emailRequestUpdates={preferences.emailRequestUpdates}
        smsRequestUpdates={preferences.smsRequestUpdates}
      />
    </div>
  );
}
