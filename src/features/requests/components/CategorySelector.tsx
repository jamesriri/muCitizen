"use client";

import { 
  Lightbulb, 
  Droplets, 
  Trash2, 
  Construction, 
  ShieldAlert, 
  HelpCircle,
  Clock 
} from "lucide-react";
import { CategorySummary } from "@/types";
import { Badge, Card } from "@/components/ui";
import { cn } from "@/lib/utils";

interface CategorySelectorProps {
  categories: CategorySummary[];
  selectedCategoryId: string;
  onSelect: (id: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Lightbulb,
  Droplets,
  Trash2,
  Construction,
  ShieldAlert,
};

export function CategorySelector({
  categories,
  selectedCategoryId,
  onSelect,
}: CategorySelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {categories.map((cat) => {
        const IconComponent = ICON_MAP[cat.iconName] || HelpCircle;
        const isSelected = selectedCategoryId === cat.id;

        return (
          <Card
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={cn(
              "p-4 cursor-pointer transition-all border text-left flex flex-col justify-between hover:border-primary/50",
              isSelected
                ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                : "border-border/70 bg-card hover:bg-accent/40"
            )}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <IconComponent className="h-5 w-5" />
                </div>
                <Badge variant={isSelected ? "default" : "outline"} className="text-[10px] gap-1 font-semibold">
                  <Clock className="h-3 w-3" />
                  {cat.slaHours}h SLA
                </Badge>
              </div>

              <h4 className="font-semibold text-sm text-foreground mb-1">
                {cat.name}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {cat.description}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
