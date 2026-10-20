import Link from "next/link";
import { ArrowLeft, Mail, ShieldCheck, UserRound } from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { requireRole } from "@/lib/security";
import { Role } from "@/types/domain";
import { getDashboardPath } from "@/lib/config/navigation";

export const metadata = {
  title: "Your Profile | muCitizen",
};

export default async function ProfilePage() {
  const session = await requireRole([
    Role.CITIZEN,
    Role.OFFICER,
    Role.SUPER_ADMIN,
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          aria-label="Back to dashboard"
          nativeButton={false}
          render={
            <Link href={getDashboardPath(session.role)} />
          }
        >
          <ArrowLeft />
        </Button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Account
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Your profile
          </h1>
        </div>
      </div>

      <Card className="overflow-hidden border-border/70 shadow-sm">
        <div className="h-24 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent" />
        <CardHeader className="-mt-12 pb-4">
          <div className="flex size-16 items-center justify-center rounded-2xl border-4 border-card bg-primary text-primary-foreground shadow-md">
            <UserRound className="size-7" />
          </div>
          <CardTitle className="pt-2 text-xl">{session.fullName}</CardTitle>
          <Badge className="w-fit" variant="secondary">
            {session.role.replaceAll("_", " ")}
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-4 pb-6 sm:grid-cols-2">
          <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Mail className="size-3.5" />
              Email address
            </p>
            <p className="mt-2 break-all text-sm font-medium">{session.email}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="size-3.5" />
              Access level
            </p>
            <p className="mt-2 text-sm font-medium">
              {session.role === Role.CITIZEN
                ? "Citizen services"
                : "County operations"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
