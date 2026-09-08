"use client";

import { useRequirementWizard } from "../../hooks/use-requirement-wizard";
import { WizardProgress } from "./wizard-progress";
import { StepBasics } from "./step-basics";
import { StepRequirements } from "./step-requirements";
import { StepDetails } from "./step-details";
import { StepReview } from "./step-review";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Send } from "lucide-react";
import { STEPS } from "../../types/wizard";
import { useState, useCallback, useEffect, useRef } from "react";
import { createRequirement } from "../../lib/api-client";
import type { CreateRequirementInput } from "@gopratle/contracts";

const DRAFT_KEY = "gopratle.draft.v1";

export function RequirementWizard() {
  const wizard = useRequirementWizard();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<{
    id: string;
    category: string;
  } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string>("");
  const toastTimer = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 3400);
  }, []);

  const validateStep = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (wizard.step === "basics") {
      if (!wizard.event.name?.trim()) newErrors.name = "Event name is required";
      if (!wizard.event.type?.trim()) newErrors.type = "Event type is required";
      if (!wizard.event.startDate) newErrors.startDate = "Start date is required";
      if (!wizard.event.endDate) newErrors.endDate = "End date is required";
      if (!wizard.event.location?.trim()) newErrors.location = "Location is required";
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
        if (!wizard.plannerDetails.servicesNeeded || wizard.plannerDetails.servicesNeeded.length === 0)
          newErrors.servicesNeeded = "At least one service is required";
        if (!wizard.plannerDetails.budget || wizard.plannerDetails.budget < 0)
          newErrors.budget = "Budget is required";
      }
      if (wizard.category === "performer") {
        if (!wizard.performerDetails.performanceType?.trim())
          newErrors.performanceType = "Performance type is required";
        if (!wizard.performerDetails.performerCount || wizard.performerDetails.performerCount < 1)
          newErrors.performerCount = "Performer count must be at least 1";
        if (!wizard.performerDetails.performanceDurationMinutes || wizard.performerDetails.performanceDurationMinutes < 15)
          newErrors.performanceDurationMinutes = "Minimum 15 minutes";
        if (!wizard.performerDetails.budget || wizard.performerDetails.budget < 0)
          newErrors.budget = "Budget is required";
      }
      if (wizard.category === "crew") {
        if (!wizard.crewDetails.crewRole?.trim()) newErrors.crewRole = "Crew role is required";
        if (!wizard.crewDetails.crewCount || wizard.crewDetails.crewCount < 1)
          newErrors.crewCount = "Crew count must be at least 1";
        if (!wizard.crewDetails.experienceLevel) newErrors.experienceLevel = "Experience level is required";
        if (!wizard.crewDetails.shiftStart) newErrors.shiftStart = "Shift start is required";
        if (!wizard.crewDetails.shiftEnd) newErrors.shiftEnd = "Shift end is required";
        if (!wizard.crewDetails.budget || wizard.crewDetails.budget < 0) newErrors.budget = "Budget is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [wizard]);

  const handleNext = () => {
    if (validateStep()) {
      wizard.goNext();
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      showToast("Please fix the highlighted fields to continue.");
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
      localStorage.removeItem(DRAFT_KEY);
      setSavedAt("");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAnother = () => {
    window.location.reload();
  };

  // Auto-save draft
  useEffect(() => {
    if (submitSuccess) return;
    const timer = setTimeout(() => {
      try {
        const draft = {
          name: wizard.event.name,
          type: wizard.event.type,
          startDate: wizard.event.startDate,
          endDate: wizard.event.endDate,
          location: wizard.event.location,
          venue: wizard.event.venue,
          category: wizard.category,
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        const now = new Date();
        setSavedAt(`Draft saved at ${now.toLocaleTimeString()}`);
      } catch { /* ignore storage errors */ }
    }, 600);
    return () => clearTimeout(timer);
  }, [wizard.event, wizard.category, submitSuccess]);

  // Restore draft
  useEffect(() => {
    try {
      const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}");
      if (draft.name) wizard.updateEvent({ name: draft.name });
      if (draft.type) wizard.updateEvent({ type: draft.type });
      if (draft.startDate) wizard.updateEvent({ startDate: draft.startDate });
      if (draft.endDate) wizard.updateEvent({ endDate: draft.endDate });
      if (draft.location) wizard.updateEvent({ location: draft.location });
      if (draft.venue) wizard.updateEvent({ venue: draft.venue });
      if (draft.category) wizard.setCategory(draft.category);
    } catch { /* ignore storage errors */ }
  }, [wizard]);

  const stepIndex = wizard.stepIndex;
  const progressPct = Math.round(((stepIndex + 1) / STEPS.length) * 100);

  // Success screen
  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-[560px] mx-auto py-[60px] px-4 animate-rise">
          <div className="bg-white border border-border rounded-[24px] shadow-[var(--shadow-md)] p-[48px_40px]">
            <div className="w-[84px] h-[84px] mx-auto mb-6 rounded-full bg-success-soft grid place-items-center">
              <svg className="w-[52px] h-[52px]" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="26" stroke="#059669" strokeWidth="2.5" fill="none" strokeDasharray="166" strokeDashoffset="166" className="animate-dash" />
                <path d="M17 29.5l7.5 7.5L39 21.5" stroke="#059669" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="50" strokeDashoffset="50" className="animate-dash-path" />
              </svg>
            </div>
            <h1 className="m-0 mb-[10px] text-[26px] font-extrabold tracking-[-0.03em]">Your requirement is in!</h1>
            <p className="m-0 mb-6 text-foreground/60 text-[15px] leading-[1.6]">
              Reference{" "}
              <span className="inline-block font-bold text-foreground bg-[#f1f3f8] px-[10px] py-[2px] rounded-[8px]">
                {submitSuccess.id}
              </span>
              <br />
              We&apos;ve sent a confirmation to your email. Pros will start responding shortly.
            </p>
            <div className="grid gap-[10px] text-left mb-[30px]">
              {[
                { title: "We&apos;re matching you", desc: "Verified pros matching your brief are being notified right now." },
                { title: "Quotes arrive in 24–48h", desc: "Compare offers side-by-side in your dashboard." },
                { title: "Book with confidence", desc: "Secure payments, verified profiles, and full support until showtime." },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start p-[13px_15px] border border-border rounded-[var(--radius)]">
                  <span className="w-[34px] h-[34px] flex-none rounded-[9px] gradient-brand text-white grid place-items-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <div>
                    <b className="block text-sm mb-[2px]">{item.title}</b>
                    <p className="m-0 text-[13px] text-foreground/60 leading-[1.5]" dangerouslySetInnerHTML={{ __html: item.desc }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button onClick={handleCreateAnother}>Go to dashboard</Button>
              <Button variant="ghost" onClick={handleCreateAnother}>Post another requirement</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Topbar */}
      <header className="sticky top-0 z-40 bg-white/82 backdrop-blur-[12px] border-b border-border">
        <div className="max-w-[1160px] mx-auto px-6 h-16 flex items-center gap-7">
          <a className="flex items-center gap-[10px] font-extrabold text-[17px] text-foreground no-underline tracking-[-0.02em]" href="#">
            <span className="w-8 h-8 rounded-[9px] gradient-brand grid place-items-center text-white shadow-[0_4px_12px_-2px_rgba(79,70,229,0.5)]">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 17V8l7-2v9" />
                <circle cx="7.5" cy="17" r="1.6" fill="currentColor" />
                <circle cx="14.5" cy="15" r="1.6" fill="currentColor" />
              </svg>
            </span>
            GoPratle
          </a>
          <div className="flex-1 h-[6px] bg-[#eceef4] rounded-full overflow-hidden max-w-[380px]" role="progressbar" aria-label="Form progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPct}>
            <div className="h-full rounded-full gradient-brand transition-[width] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="flex items-center gap-[18px] ml-auto">
            {savedAt && <span className="text-[12.5px] text-muted-foreground font-medium">{savedAt}</span>}
          </div>
        </div>
      </header>

      <div className="max-w-[1160px] mx-auto px-6 py-[44px] pb-[90px] grid grid-cols-[280px_minmax(0,1fr)] gap-[56px] items-start max-[980px]:grid-cols-1 max-[980px]:gap-0 max-[980px]:py-7 max-[980px]:px-4">
        {/* Sidebar */}
        <aside className="sticky top-[96px] max-[980px]:hidden">
          <WizardProgress currentStep={wizard.step} onStepClick={wizard.goToStep} />
          <div className="mt-7 p-[18px] rounded-[var(--radius-lg)] gradient-sidebar border border-[#e4e6fb]">
            <strong className="text-sm block mb-[6px]">Need a hand?</strong>
            <p className="m-0 mb-[10px] text-[13px] leading-[1.55] text-foreground/60">
              Our event experts can help you frame the perfect brief in under 5 minutes.
            </p>
            <a href="#" className="text-[13.5px] font-bold text-primary no-underline hover:underline" onClick={(e) => e.preventDefault()}>
              Chat with us →
            </a>
          </div>
        </aside>

        {/* Main content */}
        <div>
          {/* Mobile pill */}
          <div className="hidden max-[980px]:inline-flex items-center gap-[10px] mb-[18px] px-[14px] py-[9px] bg-primary-soft rounded-full w-fit text-[13.5px] font-semibold text-primary">
            <span className="w-[22px] h-[22px] rounded-full bg-primary text-white grid place-items-center text-[11.5px] font-bold">{stepIndex + 1}</span>
            <span>{STEPS[stepIndex]?.label}</span>
          </div>

          <div className="bg-white border border-border rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] px-[44px] pt-[40px] pb-[28px] max-[980px]:px-[22px] max-[980px]:pt-[26px] max-[980px]:pb-[22px] max-[520px]:px-4 max-[520px]:pt-[22px] max-[520px]:pb-[18px]">
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
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            )}

            {/* Action bar */}
            <div className="sticky bottom-[-28px] mx-[-44px] mt-[6px] mb-[-28px] px-[44px] pt-5 pb-[26px] flex justify-between items-center gap-3 bg-gradient-to-b from-white/0 to-white rounded-b-[var(--radius-xl)] max-[980px]:mx-[-22px] max-[980px]:mb-[-22px] max-[980px]:px-[22px] max-[980px]:pb-[22px] max-[520px]:mx-[-16px] max-[520px]:mb-[-18px] max-[520px]:px-4 max-[520px]:pb-[18px]">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  wizard.goBack();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={!wizard.canGoBack || isSubmitting}
                className={wizard.stepIndex === 0 ? "invisible" : ""}
              >
                <ArrowLeft className="w-[17px] h-[17px] mr-[9px]" />
                Back
              </Button>

              <span className="flex-1" />

              {wizard.isLastStep ? (
                <Button
                  type="button"
                  variant="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                >
                  {isSubmitting ? "Submitting…" : "Submit requirement"}
                  {!isSubmitting && <Send className="w-[17px] h-[17px] ml-[9px]" />}
                </Button>
              ) : (
                <Button type="button" onClick={handleNext}>
                  Continue
                  <ArrowRight className="w-[17px] h-[17px] ml-[9px]" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="fixed left-1/2 bottom-[30px] -translate-x-1/2 z-60 bg-[#141828] text-white px-5 py-[13px] rounded-[var(--radius)] flex gap-[10px] items-center text-sm font-medium shadow-[var(--shadow-lg)] animate-rise">
          <AlertCircle className="w-[17px] h-[17px] text-yellow-400" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
