"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

interface VolumeTrendChartProps {
  trend: Array<{
    date: string;
    count: number;
  }>;
}

export default function VolumeTrendChart({ trend }: VolumeTrendChartProps) {
  const maxCount = Math.max(...trend.map((t) => t.count), 1);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="text-base font-bold">7-Day Incident Inflow</CardTitle>
        <CardDescription className="text-xs">
          Daily volume of citizen dispatches received over the past week
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col pt-2">
        <div className="flex min-h-48 flex-1 items-stretch justify-between gap-2 border-b border-border">
          {trend.map((item) => {
            const heightPercent = Math.round((item.count / maxCount) * 100);
            const barHeight = Math.max(heightPercent, 8);
            return (
              <div
                key={item.date}
                className="flex min-w-0 flex-1 flex-col items-center"
              >
                <span className="h-4 font-mono text-[10px] font-bold text-muted-foreground">
                  {item.count}
                </span>
                <div className="relative mt-1 w-full max-w-8 flex-1">
                  <div
                    className="absolute inset-x-0 bottom-0 rounded-t-md bg-primary/80 transition-colors hover:bg-primary"
                    style={{ height: `${barHeight}%` }}
                    title={`${item.date}: ${item.count} reports`}
                  />
                </div>
                <span className="mt-2 text-[11px] font-semibold text-muted-foreground">
                  {item.date}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
