"use client";

import { useRequirementWizard } from "../../hooks/use-requirement-wizard";
import { WizardProgress } from "./wizard-progress";
import { StepBasics } from "./step-basics";
import { StepRequirements } from "./step-requirements";
import { StepDetails } from "./step-details";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { STEPS } from "../../types/wizard";
import { useState, useCallback } from "react";

export function RequirementWizard() {
  const wizard = useRequirementWizard();
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const currentStepConfig = STEPS[wizard.stepIndex];

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

              {wizard.step === "review" && (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">
                      Review your requirement
                    </h2>
                    <p className="text-muted-foreground">
                      Check everything before submitting.
                    </p>
                  </div>
                  <p className="text-muted-foreground">Review step — coming in Milestone 5.</p>
                </div>
              )}

              <div className="flex items-center justify-between mt-12 pt-6 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={wizard.goBack}
                  disabled={!wizard.canGoBack}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>

                <Button type="button" onClick={handleNext} disabled={wizard.isLastStep}>
                  {wizard.isLastStep ? "Submit" : "Continue"}
                  {!wizard.isLastStep && <ArrowRight className="h-4 w-4 ml-2" />}
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
