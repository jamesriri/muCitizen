import Link from "next/link";
import {
    ArrowRight,
    Hourglass,
    Layers,
    CheckCircle,
    ShieldAlert
} from "lucide-react";
import { requireRole } from "@/lib/security/session";
import { Role } from "@/types";
import { AnalyticsService } from "@/features/analytics/services/analytics.service";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { OnboardingWalkthrough } from "@/components/shared";
import { ResolutionRateGauge, CategoryBreakdownBar, VolumeTrendChart } from "@/features/analytics/components";

export const metadata = {
    title: "County Command Centre | muCitizen",
    description: "Murang'a County service triage and reporting dashboard",
};

export default async function AdminDashboardPage() {
    const session = await requireRole([Role.OFFICER, Role.SUPER_ADMIN]);
    const analytics = await AnalyticsService.getSystemAnalytics();

    return (
        <div className="space-y-8">
            <OnboardingWalkthrough
                userRole={session?.role ?? Role.OFFICER}
                userName={session?.fullName ?? "Field Officer"}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">County Service Command Centre</h2>
                    <p className="text-sm text-muted-foreground">
                        Track incoming reports, service timelines, and county team workload.
                    </p>
                </div>

                <Button
                    className="gap-2"
                    nativeButton={false}
                    data-tour="staff-incident-queue"
                    render={<Link href="/incidents" />}
                >
                    <span>Manage Incident Queue</span>
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card  data-tour="staff-needs-triage">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
                            Needs Triage
                        </CardTitle>
                        <Hourglass className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.openRequests}</div>
                        <p className="text-xs text-muted-foreground">Active unresolved cases</p>
                    </CardContent>
                </Card>

                <Card >
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
                            Average Velocity
                        </CardTitle>
                        <Layers className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.averageResolutionHours}h</div>
                        <p className="text-xs text-muted-foreground">Mean resolution duration</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
                            Resolved Cases
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.resolvedRequests}</div>
                        <p className="text-xs text-muted-foreground">Successfully closed</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
                            Total Inflow
                        </CardTitle>
                        <ShieldAlert className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.totalRequests}</div>
                        <p className="text-xs text-muted-foreground">Recorded dispatches</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-tour="staff-analytics">
                <ResolutionRateGauge
                    percentage={analytics.slaCompliancePercentage}
                    averageHours={analytics.averageResolutionHours}
                />
                <div className="lg:col-span-2">
                    <VolumeTrendChart trend={analytics.weeklyTrend} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <CategoryBreakdownBar categories={analytics.categoryDistribution} />
            </div>
        </div>
    );
}
