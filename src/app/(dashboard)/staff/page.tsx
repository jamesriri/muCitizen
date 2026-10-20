import { requireRole } from "@/lib/security/session";
import { db } from "@/lib/db/prisma";
import { Role } from "@/types/domain";
import { Badge, Card, CardContent } from "@/components/ui";
import { StaffProvisionForm } from "@/components/forms/admin/StaffProvisionForm";

export const metadata = {
  title: "Staff Directory | muCitizen",
  description: "Manage county staff account access",
};

export default async function StaffPage() {
  await requireRole([Role.SUPER_ADMIN]);
  const staff = await db.user.findMany({
    where: { role: { in: [Role.OFFICER, Role.SUPER_ADMIN] } },
    include: { _count: { select: { assignedRequests: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Administration</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Staff &amp; officers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          County staff accounts with access to the incident operations workspace.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <StaffProvisionForm />
        <Card className="lg:col-span-2">
          <CardContent className="divide-y divide-border p-0">
            {staff.map((member) => (
              <div key={member.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{member.fullName}</p>
                  <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {member._count.assignedRequests} assigned requests
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={member.role === Role.SUPER_ADMIN ? "default" : "secondary"}>
                    {member.role === Role.SUPER_ADMIN ? "Super admin" : "Officer"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Joined {member.createdAt.toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {staff.length === 0 && (
              <p className="p-8 text-center text-sm text-muted-foreground">No staff accounts found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
