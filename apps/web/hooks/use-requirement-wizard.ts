"use client";

import { useState, useCallback } from "react";
import type { Category, EventInput, PlannerDetails, PerformerDetails, CrewDetails } from "@gopratle/contracts";
import type { StepId } from "../types/wizard";
import { STEPS } from "../types/wizard";

interface UseRequirementWizard {
  step: StepId;
  stepIndex: number;
  category: Category | null;
  event: Partial<EventInput>;
  plannerDetails: Partial<PlannerDetails>;
  performerDetails: Partial<PerformerDetails>;
  crewDetails: Partial<CrewDetails>;
  setCategory: (category: Category) => void;
  updateEvent: (data: Partial<EventInput>) => void;
  updatePlannerDetails: (data: Partial<PlannerDetails>) => void;
  updatePerformerDetails: (data: Partial<PerformerDetails>) => void;
  updateCrewDetails: (data: Partial<CrewDetails>) => void;
  goNext: () => void;
  goBack: () => void;
  goToStep: (step: StepId, opts?: { force?: boolean }) => void;
  canGoNext: boolean;
  canGoBack: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function useRequirementWizard(): UseRequirementWizard {
  const [step, setStep] = useState<StepId>("basics");
  const [category, setCategory] = useState<Category | null>(null);
  const [event, setEvent] = useState<Partial<EventInput>>({});
  const [plannerDetails, setPlannerDetails] = useState<Partial<PlannerDetails>>({});
  const [performerDetails, setPerformerDetails] = useState<Partial<PerformerDetails>>({});
  const [crewDetails, setCrewDetails] = useState<Partial<CrewDetails>>({});

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const updateEvent = useCallback((data: Partial<EventInput>) => {
    setEvent((prev) => ({ ...prev, ...data }));
  }, []);

  const updatePlannerDetails = useCallback((data: Partial<PlannerDetails>) => {
    setPlannerDetails((prev) => ({ ...prev, ...data }));
  }, []);

  const updatePerformerDetails = useCallback((data: Partial<PerformerDetails>) => {
    setPerformerDetails((prev) => ({ ...prev, ...data }));
  }, []);

  const updateCrewDetails = useCallback((data: Partial<CrewDetails>) => {
    setCrewDetails((prev) => ({ ...prev, ...data }));
  }, []);

  const handleCategoryChange = useCallback((newCategory: Category) => {
    setCategory(newCategory);
    setPlannerDetails({});
    setPerformerDetails({});
    setCrewDetails({});
  }, []);

  const goNext = useCallback(() => {
    if (stepIndex < STEPS.length - 1) {
      setStep(STEPS[stepIndex + 1].id);
    }
  }, [stepIndex]);

  const goBack = useCallback(() => {
    if (stepIndex > 0) {
      setStep(STEPS[stepIndex - 1].id);
    }
  }, [stepIndex]);

  const goToStep = useCallback((targetStep: StepId, opts?: { force?: boolean }) => {
    const targetIndex = STEPS.findIndex((s) => s.id === targetStep);
    if (opts?.force || targetIndex <= stepIndex) {
      setStep(targetStep);
    }
  }, [stepIndex]);

  return {
    step,
    stepIndex,
    category,
    event,
    plannerDetails,
    performerDetails,
    crewDetails,
    setCategory: handleCategoryChange,
    updateEvent,
    updatePlannerDetails,
    updatePerformerDetails,
    updateCrewDetails,
    goNext,
    goBack,
    goToStep,
    canGoNext: stepIndex < STEPS.length - 1,
    canGoBack: stepIndex > 0,
    isFirstStep: stepIndex === 0,
    isLastStep: stepIndex === STEPS.length - 1,
  };
}
