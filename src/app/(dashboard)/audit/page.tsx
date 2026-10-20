import { db } from "@/lib/db/prisma";
import { requireRole } from "@/lib/security/session";
import { Role } from "@/types/domain";
import { Badge, Card, CardContent } from "@/components/ui";

export const metadata = {
  title: "System Audit | muCitizen",
  description: "Review recent county service request activity",
};

export default async function AuditPage() {
  await requireRole([Role.SUPER_ADMIN]);
  const events = await db.auditLog.findMany({
    include: {
      actor: { select: { fullName: true, role: true } },
      serviceRequest: { select: { referenceNumber: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Security &amp; compliance</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">System audit log</h1>
        <p className="mt-1 text-sm text-muted-foreground">The 100 most recent activity records across county service requests.</p>
      </div>
      <Card>
        <CardContent className="divide-y divide-border p-0">
          {events.map((event) => (
            <div key={event.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={event.isInternal ? "secondary" : "outline"}>
                    {event.action.replaceAll("_", " ")}
                  </Badge>
                  <span className="font-mono text-xs text-primary">
                    {event.serviceRequest.referenceNumber}
                  </span>
                </div>
                <p className="text-sm font-medium">{event.serviceRequest.title}</p>
                <p className="text-xs text-muted-foreground">
                  {event.actor?.fullName ?? "System"}{event.comment ? ` — ${event.comment}` : ""}
                </p>
              </div>
              <time className="shrink-0 text-xs text-muted-foreground">
                {event.createdAt.toLocaleString()}
              </time>
            </div>
          ))}
          {events.length === 0 && (
            <p className="p-8 text-center text-sm text-muted-foreground">No audit events recorded yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
