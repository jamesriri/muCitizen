"use client";

import { cn } from "@/lib/utils";

export type StepItem = {
  title: string;
  description: string;
};

type StepIndicatorProps = {
  currentStep: number;
  steps: StepItem[];
};

export default function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="space-y-3 rounded-2xl border bg-muted/50 p-4">
      <div className="flex items-center gap-2">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isComplete = stepNumber < currentStep;

          return (
            <div key={step.title} className="flex flex-1 items-center gap-2">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  isActive && "bg-primary text-primary-foreground shadow-xs",
                  isComplete && "bg-primary/20 text-primary",
                  !isActive && !isComplete && "bg-muted text-muted-foreground"
                )}
                aria-current={isActive ? "step" : undefined}
              >
                {stepNumber}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 transition-colors",
                    isComplete ? "bg-primary/40" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="text-sm">
        <p className="font-semibold text-foreground">
          {steps[currentStep - 1]?.title}
        </p>
        <p className="text-xs text-muted-foreground">
          {steps[currentStep - 1]?.description}
        </p>
      </div>
    </div>
  );
}
