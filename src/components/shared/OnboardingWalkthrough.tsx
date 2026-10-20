"use client";

import * as React from "react";
import {
  ArrowRight,
  Check,
  Clock,
  PlusCircle,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { Role } from "@/types/domain";
import { Button } from "@/components/ui/button";

interface WalkthroughProps {
  userRole: Role;
  userName: string;
}

interface WalkthroughStep {
  icon: typeof PlusCircle;
  title: string;
  description: string;
  target: string;
}

interface TargetRect {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
  viewportWidth: number;
  viewportHeight: number;
}

const CITIZEN_STEPS: WalkthroughStep[] = [
  {
    icon: PlusCircle,
    title: "Report a community issue",
    description:
      "Start a service request for issues such as damaged roads, broken streetlights, water leaks, or uncollected refuse.",
    target: "citizen-submit",
  },
  {
    icon: Clock,
    title: "Keep an eye on active requests",
    description:
      "See how many reports are being reviewed or handled by county teams. Each request has a service target.",
    target: "citizen-active-requests",
  },
  {
    icon: Search,
    title: "Follow every update",
    description:
      "Your recent dispatches and their latest statuses appear here. Open your full request list whenever you need more detail.",
    target: "citizen-my-requests",
  },
];

const STAFF_STEPS: WalkthroughStep[] = [
  {
    icon: ShieldCheck,
    title: "Open the incident queue",
    description:
      "Review incoming reports, prioritise urgent issues, and coordinate the next steps with county teams.",
    target: "staff-incident-queue",
  },
  {
    icon: Clock,
    title: "See what needs triage",
    description:
      "This counter highlights unresolved cases that need attention. Use it alongside the queue to prioritize your team's work.",
    target: "staff-needs-triage",
  },
  {
    icon: Sparkles,
    title: "Review operational trends",
    description:
      "Use the resolution and volume summaries to monitor service performance and spot workload changes.",
    target: "staff-analytics",
  },
];

export default function OnboardingWalkthrough({
  userRole,
  userName,
}: WalkthroughProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [targetRect, setTargetRect] = React.useState<TargetRect | null>(null);
  const [panelHeight, setPanelHeight] = React.useState(280);
  const panelRef = React.useRef<HTMLElement | null>(null);
  const storageKey = `mucitizen_walkthrough_seen_${userRole}`;
  const steps = userRole === Role.CITIZEN ? CITIZEN_STEPS : STAFF_STEPS;
  const activeStep = steps[currentStep];
  const isFinalStep = currentStep === steps.length - 1;

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      let hasSeenTour = false;
      try {
        hasSeenTour = window.localStorage.getItem(storageKey) === "true";
      } catch {
        console.warn("Could not read onboarding preference from local storage.");
      }
      if (!hasSeenTour) {
        setIsOpen(true);
      }
    }, 800);

    return () => window.clearTimeout(timer);
  }, [storageKey]);

  React.useEffect(() => {
    if (!isOpen || !activeStep) return;

    let frame = 0;
    let retries = 0;
    let retryTimer = 0;
    let target: HTMLElement | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const updateRect = () => {
      if (!target?.isConnected) {
        setTargetRect(null);
        return;
      }

      const rect = target.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      });
    };

    const findTarget = () => {
      target = document.querySelector<HTMLElement>(
        `[data-tour="${activeStep.target}"]`,
      );
      if (!target && retries < 20) {
        retries += 1;
        retryTimer = window.setTimeout(findTarget, 150);
        return;
      }
      if (!target) {
        setTargetRect(null);
        return;
      }

      target.scrollIntoView({ behavior: "smooth", block: "center" });
      resizeObserver = new ResizeObserver(scheduleUpdate);
      resizeObserver.observe(target);
      frame = window.requestAnimationFrame(updateRect);
    };

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateRect);
    };

    retryTimer = window.setTimeout(findTarget, 0);
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("scroll", scheduleUpdate, true);

    return () => {
      window.clearTimeout(retryTimer);
      window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("scroll", scheduleUpdate, true);
    };
  }, [activeStep, isOpen]);

  React.useEffect(() => {
    if (!isOpen || !panelRef.current) return;

    const panel = panelRef.current;
    const resizeObserver = new ResizeObserver(() => {
      setPanelHeight(panel.getBoundingClientRect().height);
    });
    resizeObserver.observe(panel);
    setPanelHeight(panel.getBoundingClientRect().height);

    return () => resizeObserver.disconnect();
  }, [isOpen, activeStep]);

  const finishTour = () => {
    try {
      window.localStorage.setItem(storageKey, "true");
    } catch {
      console.warn("Could not save onboarding preference to local storage.");
    }
    setIsOpen(false);
  };

  const restartTour = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };

  const handleNext = () => {
    if (isFinalStep) {
      finishTour();
      return;
    }
    setCurrentStep((step) => step + 1);
  };

  if (!activeStep) return null;
  if (!isOpen) {
    return (
      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground"
          onClick={restartTour}
        >
          <Sparkles className="size-4" />
          Replay dashboard tour
        </Button>
      </div>
    );
  }

  const ActiveIcon = activeStep.icon;
  const viewportWidth = targetRect?.viewportWidth ?? 0;
  const viewportHeight = targetRect?.viewportHeight ?? 0;
  const panelHalfWidth = Math.min(176, Math.max(0, (viewportWidth - 32) / 2));
  const panelLeft = targetRect
    ? Math.max(
        16 + panelHalfWidth,
        Math.min(
          targetRect.left + targetRect.width / 2,
          viewportWidth - 16 - panelHalfWidth,
        ),
      )
    : "50%";
  const panelTop = targetRect
    ? Math.max(
        16,
        Math.min(
          targetRect.bottom + 14 + panelHeight <= viewportHeight - 16
            ? targetRect.bottom + 14
            : targetRect.top - panelHeight - 14,
          viewportHeight - panelHeight - 16,
        ),
      )
    : "50%";

  return (
    <div className="pointer-events-none fixed inset-0 z-100">
      {targetRect ? (
        <div
          aria-hidden="true"
          className="fixed rounded-xl border-2 border-primary shadow-[0_0_0_9999px_rgb(15_23_42/0.48),0_0_32px_rgb(59_130_246/0.3)] transition-all duration-300"
          style={{
            top: targetRect.top - 5,
            left: targetRect.left - 5,
            width: targetRect.width + 10,
            height: targetRect.height + 10,
          }}
        />
      ) : null}

      <section
        ref={panelRef}
        aria-label="Product walkthrough"
        aria-live="polite"
        className="pointer-events-auto fixed max-h-[calc(100vh-2rem)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-border/80 bg-popover p-5 text-popover-foreground shadow-2xl shadow-black/20 ring-1 ring-black/5"
        style={{
          left: panelLeft,
          top: panelTop,
          transform: targetRect ? "translateX(-50%)" : "translate(-50%, -50%)",
        }}
      >
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ActiveIcon className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {userName.split(" ")[0]}&apos;s quick tour · {currentStep + 1} of{" "}
              {steps.length}
            </p>
            <h2 className="mt-1 text-base font-semibold tracking-tight">
              {activeStep.title}
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Close walkthrough"
            className="-mr-2 -mt-2 shrink-0 text-muted-foreground"
            onClick={finishTour}
          >
            <X />
          </Button>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {activeStep.description}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={finishTour}
          >
            Skip tour
          </Button>
          <Button
            type="button"
            size="sm"
            className="gap-2"
            onClick={handleNext}
          >
            {isFinalStep ? (
              <>
                <Check className="size-4" />
                Finish
              </>
            ) : (
              <>
                Next tip
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </div>
      </section>
    </div>
  );
}
