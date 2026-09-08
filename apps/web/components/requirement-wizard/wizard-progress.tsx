"use client";

import { cn } from "../../lib/utils";
import { STEPS } from "../../types/wizard";
import type { StepId } from "../../types/wizard";
import { Check } from "lucide-react";

interface WizardProgressProps {
  currentStep: StepId;
  onStepClick?: (step: StepId) => void;
}

export function WizardProgress({ currentStep, onStepClick }: WizardProgressProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <nav aria-label="Progress">
      <ol className="space-y-4">
        {STEPS.map((s, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;
          const isClickable = i <= currentIndex;

          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => isClickable && onStepClick?.(s.id)}
                disabled={!isClickable}
                className={cn(
                  "flex items-center gap-3 text-left w-full rounded-md py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isClickable ? "cursor-pointer" : "cursor-default"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                    isCompleted &&
                      "border-primary bg-primary text-primary-foreground",
                    isCurrent &&
                      "border-primary bg-background text-primary",
                    !isCompleted &&
                      !isCurrent &&
                      "border-border bg-background text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium",
                    isCurrent && "text-foreground",
                    isCompleted && "text-foreground",
                    !isCompleted && !isCurrent && "text-muted-foreground"
                  )}
                >
                  {s.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
