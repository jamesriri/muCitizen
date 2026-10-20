import { AdminRequestService } from "@/features/admin/services/admin-request.service";
import { AdminRequestsTable } from "@/features/admin/components/table/DataTable";
import { requireRole } from "@/lib/security/session";
import { Role } from "@/types/domain";

export const metadata = {
  title: "Incident Queue | muCitizen",
  description: "Review, prioritise, and assign Murang'a County service reports",
};

export default async function AdminRequestsPage() {
  await requireRole([Role.OFFICER, Role.SUPER_ADMIN]);
  const [requests, officers] = await Promise.all([
    AdminRequestService.getAllRequests(),
    AdminRequestService.getEligibleOfficers(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">County Incident Queue</h2>
        <p className="text-sm text-muted-foreground">
          Filter, prioritise, and assign service requests to the right county teams.
        </p>
      </div>

      <AdminRequestsTable data={requests} officers={officers} />
    </div>
  );
}
