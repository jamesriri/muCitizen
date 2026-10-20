"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

interface CategoryBreakdownBarProps {
  categories: Array<{
    name: string;
    count: number;
    percentage: number;
    slaHours: number;
  }>;
}

export default function CategoryBreakdownBar({ categories }: CategoryBreakdownBarProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-bold">Departmental Incident Distribution</CardTitle>
        <CardDescription className="text-xs">
          How reports are shared across county service teams
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map((cat) => (
          <div key={cat.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">{cat.name}</span>
              <span className="font-mono text-muted-foreground">
                {cat.count} cases ({cat.percentage}%)
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                style={{ width: `${Math.max(cat.percentage, 2)}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
