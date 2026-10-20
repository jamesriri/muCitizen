import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Clock3,
  FileText,
  CircleCheck,
} from "lucide-react";
import { RequestStatus } from "@prisma/client";
import { db } from "@/lib/db/prisma";
import { requireRole } from "@/lib/security";
import { Role } from "@/types";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";

export const metadata = {
  title: "My Activity | muCitizen",
  description: "A personal summary of your Murang'a County service requests",
};

const statusLabels: Record<RequestStatus, string> = {
  [RequestStatus.PENDING]: "Pending review",
  [RequestStatus.IN_REVIEW]: "Under review",
  [RequestStatus.IN_PROGRESS]: "In progress",
  [RequestStatus.RESOLVED]: "Resolved",
  [RequestStatus.REJECTED]: "Closed",
};

export default async function CitizenAnalyticsPage() {
  const session = await requireRole([Role.CITIZEN]);
  const requests = await db.serviceRequest.findMany({
    where: { citizenId: session.userId },
    select: { status: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const statusCounts = new Map<RequestStatus, number>();
  for (const request of requests) {
    statusCounts.set(
      request.status,
      (statusCounts.get(request.status) ?? 0) + 1,
    );
  }

  const activeCount = requests.filter(
    ({ status }) =>
      status === RequestStatus.PENDING ||
      status === RequestStatus.IN_REVIEW ||
      status === RequestStatus.IN_PROGRESS,
  ).length;
  const resolvedCount = statusCounts.get(RequestStatus.RESOLVED) ?? 0;
  const recentActivityCutoff = new Date();
  recentActivityCutoff.setDate(recentActivityCutoff.getDate() - 30);
  const recentActivityCount = requests.filter(
    ({ createdAt }) => createdAt >= recentActivityCutoff,
  ).length;

  const now = new Date();
  const monthCounts = Array.from({ length: 6 }, (_, index) => {
    const month = new Date(now);
    month.setDate(1);
    month.setHours(0, 0, 0, 0);
    month.setMonth(month.getMonth() - (5 - index));

    return {
      key: `${month.getFullYear()}-${month.getMonth()}`,
      label: month.toLocaleDateString("en-GB", { month: "short" }),
      count: 0,
    };
  });
  const monthIndex = new Map(monthCounts.map((month, index) => [month.key, index]));
  for (const request of requests) {
    const key = `${request.createdAt.getFullYear()}-${request.createdAt.getMonth()}`;
    const index = monthIndex.get(key);
    if (index !== undefined) {
      const month = monthCounts[index];
      if (month) month.count += 1;
    }
  }
  const maxMonthCount = Math.max(1, ...monthCounts.map(({ count }) => count));

  const summaryCards = [
    {
      label: "Requests submitted",
      value: requests.length,
      detail: "All reports you have lodged",
      icon: FileText,
      iconClass: "text-primary",
    },
    {
      label: "Being followed up",
      value: activeCount,
      detail: "Awaiting review or action",
      icon: Clock3,
      iconClass: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Resolved",
      value: resolvedCount,
      detail: "Reports marked as sorted",
      icon: CircleCheck,
      iconClass: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Last 30 days",
      value: recentActivityCount,
      detail: "New reports submitted",
      icon: Activity,
      iconClass: "text-blue-600 dark:text-blue-400",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Your services</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            My activity
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A quick look at the reports you have submitted.
          </p>
        </div>
        <Button
          className="gap-2"
          nativeButton={false}
          render={<Link href="/my-requests" />}
        >
          View my requests
          <ArrowRight className="size-4" />
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(({ label, value, detail, icon: Icon, iconClass }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <CardDescription>{label}</CardDescription>
              <Icon className={`size-4 ${iconClass}`} aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tracking-tight">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Request status</CardTitle>
            <CardDescription>
              Where your reports currently stand.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {Object.values(RequestStatus).map((status) => {
              const count = statusCounts.get(status) ?? 0;
              const percentage =
                requests.length > 0 ? (count / requests.length) * 100 : 0;

              return (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">
                      {statusLabels[status]}
                    </span>
                    <span className="font-medium tabular-nums">{count}</span>
                  </div>
                  <div
                    className="h-2 overflow-hidden rounded-full bg-muted"
                    role="meter"
                    aria-label={`${statusLabels[status]} requests`}
                    aria-valuemin={0}
                    aria-valuemax={requests.length}
                    aria-valuenow={count}
                  >
                    <div
                      className="h-full rounded-full bg-primary transition-[width]"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {requests.length === 0 && (
              <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Once you report an issue, its progress will appear here.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
            <CardDescription>
              Reports submitted over the last six months.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-end justify-between gap-3">
              {monthCounts.map(({ key, label, count }) => (
                <div
                  key={key}
                  className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                >
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {count}
                  </span>
                  <div className="flex h-32 w-full items-end rounded-md bg-muted/50">
                    <div
                      className="w-full rounded-md bg-primary/80 transition-[height]"
                      style={{
                        height: `${count === 0 ? 0 : Math.max(8, (count / maxMonthCount) * 100)}%`,
                      }}
                      role="img"
                      aria-label={`${count} reports in ${label}`}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
