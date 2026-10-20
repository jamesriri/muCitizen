"use client";

import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

interface ResolutionRateGaugeProps {
  percentage: number;
  averageHours: number;
}

export default function ResolutionRateGauge({ percentage, averageHours }: ResolutionRateGaugeProps) {
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Card className="flex h-full flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold">SLA Compliance Rate</CardTitle>
          <Badge variant={percentage >= 80 ? "default" : "destructive"} className="text-xs">
            {percentage >= 80 ? "Meeting Target" : "At Risk"}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Reports handled within their service target
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center justify-center py-6">
        <div className="relative flex items-center justify-center">
          <svg className="h-44 w-44 -rotate-90 transform">
            <circle
              cx="88"
              cy="88"
              r={radius}
              className="text-muted/40"
              strokeWidth="14"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="88"
              cy="88"
              r={radius}
              className="text-primary transition-all duration-1000 ease-out"
              strokeWidth="14"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold tracking-tight text-foreground">
              {percentage}%
            </span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase">
              On-Time Rate
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
          <span>Average time to resolve:</span>
          <span className="font-bold text-foreground">{averageHours} hours</span>
        </div>
      </CardContent>
    </Card>
  );
}
