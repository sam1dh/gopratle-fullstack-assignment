"use client";

import { cn } from "../../lib/utils";
import { STEPS } from "../../types/wizard";
import type { StepId } from "../../types/wizard";
import { Check } from "lucide-react";

interface WizardProgressProps {
  currentStep: StepId;
  onStepClick?: (step: StepId) => void;
}

const STEP_SUBTITLES: Record<StepId, string> = {
  basics: "Name, type & dates",
  requirements: "Act, size & budget",
  details: "Tech needs & links",
  review: "Confirm & submit",
};

export function WizardProgress({ currentStep, onStepClick }: WizardProgressProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <nav aria-label="Form steps">
      <p className="m-0 text-[12.5px] font-bold tracking-[0.08em] uppercase text-muted-foreground">
        Step <span>{currentIndex + 1}</span> of {STEPS.length}
      </p>
      <ol className="list-none mt-[18px] mb-0 p-0">
        {STEPS.map((s, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;
          const isClickable = i <= currentIndex;

          return (
            <li
              key={s.id}
              className={cn(
                "relative pb-[36px]",
                isCompleted && "is-done"
              )}
            >
              {i < STEPS.length - 1 && (
                <span
                  className={cn(
                    "absolute left-[17px] top-[42px] bottom-[6px] w-[2px] rounded-[2px] transition-colors duration-300",
                    isCompleted ? "bg-primary" : "bg-border"
                  )}
                />
              )}
              <button
                type="button"
                onClick={() => isClickable && onStepClick?.(s.id)}
                disabled={!isClickable}
                className={cn(
                  "flex gap-[14px] items-start bg-transparent border-0 p-0 cursor-pointer text-left w-full",
                  isClickable ? "cursor-pointer" : "cursor-default"
                )}
              >
                <span
                  className={cn(
                    "flex-none w-[36px] h-[36px] rounded-full border-2 bg-white grid place-items-center text-sm font-semibold transition-all duration-200",
                    isCompleted &&
                      "bg-primary border-primary text-white",
                    isCurrent &&
                      "border-primary text-primary shadow-[0_0_0_4px_var(--ring)]",
                    !isCompleted &&
                      !isCurrent &&
                      "border-border-strong text-foreground/60"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </span>
                <span className="pt-[7px]">
                  <span
                    className={cn(
                      "block text-[14.5px] font-semibold transition-colors duration-200",
                      isCurrent ? "text-foreground" : "text-foreground/60"
                    )}
                  >
                    {s.label}
                  </span>
                  <span className="block text-[12.5px] text-muted-foreground mt-[2px]">
                    {STEP_SUBTITLES[s.id]}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
