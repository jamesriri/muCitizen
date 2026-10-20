import Link from "next/link";
import { db } from "@/lib/db/prisma";
import { requireRole } from "@/lib/security/session";
import { PlusCircle, Clock, ExternalLink, Calendar, Download } from "lucide-react";
import { Badge, Button, Card, CardContent } from "@/components/ui";
import { Role } from "@/types/domain";
import { RequestExportActions } from "@/features/requests/components/RequestExportActions";

export const metadata = {
  title: "My Service Requests | muCitizen",
  description: "Track the local service issues you have reported",
};

export default async function MyRequestsPage() {
  const session = await requireRole([Role.CITIZEN]);

  const requests = await db.serviceRequest.findMany({
    where: { citizenId: session.userId },
    include: { category: true, attachments: true },
    orderBy: { createdAt: "desc" },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return <Badge variant="default">Resolved</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="secondary">In Progress</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending Review</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Service Requests</h2>
          <p className="text-sm text-muted-foreground">
            Track real-time progress and resolution SLAs of your reported issues.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="gap-2"
            nativeButton={false}
            render={<a href="/api/requests/export/csv" download />}
          >
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button className="gap-2" nativeButton={false} render={<Link href="/requests" />}>
            <PlusCircle className="h-4 w-4" /> Report New Issue
          </Button>
        </div>
      </div>

      {requests.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent className="space-y-3">
            <p className="text-muted-foreground text-sm">
              You haven&apos;t lodged any civic requests yet.
            </p>
            <Button variant="outline" className="gap-2" nativeButton={false} render={<Link href="/requests" />}>
                          <span>Submit Your First Report</span>
                          <PlusCircle className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map((req) => {
            const isBreached =
              req.status !== "RESOLVED" &&
              req.status !== "REJECTED" &&
              new Date() > new Date(req.slaDueDate);

            return (
              <Card key={req.id} className="p-5 hover:border-primary/40 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary">
                        {req.referenceNumber}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {req.category.name}
                      </Badge>
                      {getStatusBadge(req.status)}
                      {isBreached && (
                        <Badge variant="destructive" className="text-[10px]">
                          SLA Breached
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-semibold text-base text-foreground">{req.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {req.locationAddress}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Target: {new Date(req.slaDueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <RequestExportActions referenceNumber={req.referenceNumber} />
                    <Button variant="outline" size="sm" className="gap-1.5" nativeButton={false} render={<Link href={`/track?code=${req.referenceNumber}`} />}>
                        <span>Public View</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
