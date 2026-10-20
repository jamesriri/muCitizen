import { db } from "@/lib/db/prisma";
import { RequestStatus } from "@/types";

export interface AnalyticsData {
  totalRequests: number;
  openRequests: number;
  resolvedRequests: number;
  rejectedRequests: number;
  slaCompliancePercentage: number;
  averageResolutionHours: number;
  categoryDistribution: Array<{
    name: string;
    count: number;
    percentage: number;
    slaHours: number;
  }>;
  weeklyTrend: Array<{
    date: string;
    count: number;
  }>;
}

export class AnalyticsService {
  static async getSystemAnalytics(): Promise<AnalyticsData> {
    const [totalRequests, requests, categories] = await Promise.all([
      db.serviceRequest.count(),
      db.serviceRequest.findMany({
        select: {
          id: true,
          status: true,
          createdAt: true,
          resolvedAt: true,
          slaDueDate: true,
          categoryId: true,
        },
      }),
      db.category.findMany({
        select: {
          id: true,
          name: true,
          slaHours: true,
        },
      }),
    ]);

    // Status Tallies
    const resolved = requests.filter((r) => r.status === RequestStatus.RESOLVED);
    const rejected = requests.filter((r) => r.status === RequestStatus.REJECTED);
    const open = requests.filter(
      (r) =>
        r.status === RequestStatus.PENDING ||
        r.status === RequestStatus.IN_REVIEW ||
        r.status === RequestStatus.IN_PROGRESS
    );

    // SLA COmpliance Rate (% of resolved cases closed before slaDueDate)
    let compliantCount = 0;
    let totalResolutionDurationMs = 0;

    for (const r of resolved) {
      if (r.resolvedAt) {
        if (new Date(r.resolvedAt) <= new Date(r.slaDueDate)) {
          compliantCount++;
        }
        totalResolutionDurationMs +=
          new Date(r.resolvedAt).getTime() - new Date(r.createdAt).getTime();
      }
    }

    const slaCompliancePercentage =
      resolved.length > 0
        ? Math.round((compliantCount / resolved.length) * 100)
        : 100;

    const averageResolutionHours =
      resolved.length > 0
        ? Math.round(totalResolutionDurationMs / resolved.length / (1000 * 60 * 60))
        : 0;

    // Category Distribution
    const categoryCounts: Record<string, number> = {};
    for (const r of requests) {
      categoryCounts[r.categoryId] = (categoryCounts[r.categoryId] || 0) + 1;
    }

    const categoryDistribution = categories.map((cat) => {
      const count = categoryCounts[cat.id] || 0;
      const percentage =
        totalRequests > 0 ? Math.round((count / totalRequests) * 100) : 0;
      return {
        name: cat.name,
        count,
        percentage,
        slaHours: cat.slaHours,
      };
    }).sort((a, b) => b.count - a.count);

    // Weekly Trend
    const now = new Date();
    const weeklyTrend: Array<{ date: string; count: number }> = [];

    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59);

      const dayCount = requests.filter((r) => {
        const d = new Date(r.createdAt);
        return d >= dayStart && d <= dayEnd;
      }).length;

      weeklyTrend.push({
        date: dayStart.toLocaleDateString("en-US", { weekday: "short" }),
        count: dayCount,
      });
    }

    return {
      totalRequests,
      openRequests: open.length,
      resolvedRequests: resolved.length,
      rejectedRequests: rejected.length,
      slaCompliancePercentage,
      averageResolutionHours,
      categoryDistribution,
      weeklyTrend,
    };
  }
}
