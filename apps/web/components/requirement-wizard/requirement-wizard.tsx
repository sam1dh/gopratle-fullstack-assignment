"use client";

import { useRequirementWizard } from "../../hooks/use-requirement-wizard";
import { WizardProgress } from "./wizard-progress";
import { StepBasics } from "./step-basics";
import { StepRequirements } from "./step-requirements";
import { StepDetails } from "./step-details";
import { StepReview } from "./step-review";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { STEPS } from "../../types/wizard";
import { useState, useCallback } from "react";
import { createRequirement } from "../../lib/api-client";
import type { CreateRequirementInput } from "@gopratle/contracts";

export function RequirementWizard() {
  const wizard = useRequirementWizard();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<{
    id: string;
    category: string;
  } | null>(null);

  const validateStep = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (wizard.step === "basics") {
      if (!wizard.event.name?.trim()) newErrors.name = "Event name is required";
      if (!wizard.event.type?.trim()) newErrors.type = "Event type is required";
      if (!wizard.event.startDate) newErrors.startDate = "Start date is required";
      if (!wizard.event.endDate) newErrors.endDate = "End date is required";
      if (!wizard.event.location?.trim())
        newErrors.location = "Location is required";
      if (!wizard.category) newErrors.category = "Please select a category";

      if (wizard.event.startDate && wizard.event.endDate) {
        const start = new Date(wizard.event.startDate);
        const end = new Date(wizard.event.endDate);
        if (end < start) newErrors.endDate = "End date must be on or after start date";
      }
    }

    if (wizard.step === "requirements" && wizard.category) {
      if (wizard.category === "planner") {
        if (!wizard.plannerDetails.guestCount || wizard.plannerDetails.guestCount < 1)
          newErrors.guestCount = "Guest count must be at least 1";
        if (
          !wizard.plannerDetails.servicesNeeded ||
          wizard.plannerDetails.servicesNeeded.length === 0
        )
          newErrors.servicesNeeded = "At least one service is required";
        if (!wizard.plannerDetails.budget || wizard.plannerDetails.budget < 0)
          newErrors.budget = "Budget is required";
      }

      if (wizard.category === "performer") {
        if (!wizard.performerDetails.performanceType?.trim())
          newErrors.performanceType = "Performance type is required";
        if (
          !wizard.performerDetails.performerCount ||
          wizard.performerDetails.performerCount < 1
        )
          newErrors.performerCount = "Performer count must be at least 1";
        if (
          !wizard.performerDetails.performanceDurationMinutes ||
          wizard.performerDetails.performanceDurationMinutes < 1
        )
          newErrors.performanceDurationMinutes = "Duration must be at least 1 minute";
        if (!wizard.performerDetails.budget || wizard.performerDetails.budget < 0)
          newErrors.budget = "Budget is required";
      }

      if (wizard.category === "crew") {
        if (!wizard.crewDetails.crewRole?.trim())
          newErrors.crewRole = "Crew role is required";
        if (!wizard.crewDetails.crewCount || wizard.crewDetails.crewCount < 1)
          newErrors.crewCount = "Crew count must be at least 1";
        if (!wizard.crewDetails.experienceLevel)
          newErrors.experienceLevel = "Experience level is required";
        if (!wizard.crewDetails.shiftStart)
          newErrors.shiftStart = "Shift start is required";
        if (!wizard.crewDetails.shiftEnd)
          newErrors.shiftEnd = "Shift end is required";
        if (!wizard.crewDetails.budget || wizard.crewDetails.budget < 0)
          newErrors.budget = "Budget is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [wizard]);

  const handleNext = () => {
    if (validateStep()) {
      wizard.goNext();
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    if (!wizard.category) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const input: CreateRequirementInput = {
      category: wizard.category,
      event: {
        name: wizard.event.name || "",
        type: wizard.event.type || "",
        startDate: wizard.event.startDate || "",
        endDate: wizard.event.endDate || "",
        location: wizard.event.location || "",
        venue: wizard.event.venue || undefined,
      },
      details:
        wizard.category === "planner"
          ? wizard.plannerDetails
          : wizard.category === "performer"
            ? wizard.performerDetails
            : wizard.crewDetails,
    } as CreateRequirementInput;

    try {
      const response = await createRequirement(input);
      setSubmitSuccess({
        id: response.data.id,
        category: response.data.category,
      });
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAnother = () => {
    window.location.reload();
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full text-center space-y-6 px-4">
          <CheckCircle2 className="h-16 w-16 text-success mx-auto" />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Requirement submitted
            </h1>
            <p className="text-muted-foreground">
              Your {submitSuccess.category} requirement has been created successfully.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Requirement ID</p>
            <p className="font-mono text-sm font-medium bg-muted px-4 py-2 rounded-md">
              {submitSuccess.id}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="text-sm font-medium capitalize">Submitted</p>
          </div>
          <Button onClick={handleCreateAnother} className="mt-4">
            Create another requirement
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight">GoPratle</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          <aside className="lg:w-64 shrink-0">
            <div className="lg:sticky lg:top-8">
              <p className="text-sm text-muted-foreground mb-4">
                Step {wizard.stepIndex + 1} of {STEPS.length}
              </p>
              <WizardProgress
                currentStep={wizard.step}
                onStepClick={wizard.goToStep}
              />
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="max-w-2xl">
              {wizard.step === "basics" && (
                <StepBasics
                  event={wizard.event}
                  category={wizard.category}
                  onEventChange={wizard.updateEvent}
                  onCategoryChange={wizard.setCategory}
                  errors={errors}
                />
              )}

              {wizard.step === "requirements" && wizard.category && (
                <StepRequirements
                  category={wizard.category}
                  plannerDetails={wizard.plannerDetails}
                  performerDetails={wizard.performerDetails}
                  crewDetails={wizard.crewDetails}
                  onPlannerChange={wizard.updatePlannerDetails}
                  onPerformerChange={wizard.updatePerformerDetails}
                  onCrewChange={wizard.updateCrewDetails}
                  errors={errors}
                />
              )}

              {wizard.step === "details" && wizard.category && (
                <StepDetails
                  category={wizard.category}
                  plannerDetails={wizard.plannerDetails}
                  performerDetails={wizard.performerDetails}
                  crewDetails={wizard.crewDetails}
                  onPlannerChange={wizard.updatePlannerDetails}
                  onPerformerChange={wizard.updatePerformerDetails}
                  onCrewChange={wizard.updateCrewDetails}
                />
              )}

              {wizard.step === "review" && wizard.category && (
                <StepReview
                  category={wizard.category}
                  event={wizard.event}
                  plannerDetails={wizard.plannerDetails}
                  performerDetails={wizard.performerDetails}
                  crewDetails={wizard.crewDetails}
                  onEditStep={(step) => {
                    wizard.goToStep(step);
                  }}
                />
              )}

              {submitError && (
                <div className="mt-6 p-4 rounded-md bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">
                      Submission failed
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{submitError}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-12 pt-6 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={wizard.goBack}
                  disabled={!wizard.canGoBack || isSubmitting}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>

                {wizard.isLastStep ? (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit"
                    )}
                  </Button>
                ) : (
                  <Button type="button" onClick={handleNext}>
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
