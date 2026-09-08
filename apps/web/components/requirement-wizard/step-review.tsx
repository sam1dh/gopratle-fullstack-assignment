"use client";

import type {
  Category,
  EventInput,
  PlannerDetails,
  PerformerDetails,
  CrewDetails,
} from "@gopratle/contracts";
import { CATEGORY_INFO } from "../../types/wizard";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Pencil } from "lucide-react";

interface StepReviewProps {
  category: Category;
  event: Partial<EventInput>;
  plannerDetails: Partial<PlannerDetails>;
  performerDetails: Partial<PerformerDetails>;
  crewDetails: Partial<CrewDetails>;
  onEditStep?: (step: "basics" | "requirements" | "details") => void;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatBudget(amount?: number): string {
  if (!amount) return "—";
  return `₹${amount.toLocaleString("en-IN")}`;
}

function ReviewSection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </button>
        )}
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value || "—"}</span>
    </div>
  );
}

export function StepReview({
  category,
  event,
  plannerDetails,
  performerDetails,
  crewDetails,
  onEditStep,
}: StepReviewProps) {
  const info = CATEGORY_INFO[category];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Review your requirement</h2>
        <p className="text-muted-foreground">Check everything before submitting.</p>
      </div>

      <div className="space-y-4">
        <ReviewSection title="Event" onEdit={() => onEditStep?.("basics")}>
          <div className="space-y-1">
            <h4 className="font-medium text-base">{event.name || "Untitled Event"}</h4>
            <p className="text-sm text-muted-foreground">
              {event.type || "—"} · {formatDate(event.startDate)}
              {event.endDate && event.startDate !== event.endDate && (
                <> — {formatDate(event.endDate)}</>
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              {event.location || "—"}
              {event.venue && <> · {event.venue}</>}
            </p>
          </div>
        </ReviewSection>

        <ReviewSection title="Category">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold uppercase tracking-wide text-primary">
              {info.title}
            </span>
          </div>
        </ReviewSection>

        {category === "planner" && (
          <ReviewSection
            title="Requirement Details"
            onEdit={() => onEditStep?.("requirements")}
          >
            <div className="space-y-1">
              <DetailRow label="Guests" value={plannerDetails.guestCount} />
              <DetailRow
                label="Services"
                value={
                  plannerDetails.servicesNeeded?.length
                    ? plannerDetails.servicesNeeded.join(", ")
                    : undefined
                }
              />
              <DetailRow label="Budget" value={formatBudget(plannerDetails.budget)} />
              {plannerDetails.themeOrStyle && (
                <DetailRow label="Theme" value={plannerDetails.themeOrStyle} />
              )}
            </div>
          </ReviewSection>
        )}

        {category === "performer" && (
          <ReviewSection
            title="Requirement Details"
            onEdit={() => onEditStep?.("requirements")}
          >
            <div className="space-y-1">
              <DetailRow label="Type" value={performerDetails.performanceType} />
              {performerDetails.genre && (
                <DetailRow label="Genre" value={performerDetails.genre} />
              )}
              <DetailRow label="Performers" value={performerDetails.performerCount} />
              <DetailRow
                label="Duration"
                value={
                  performerDetails.performanceDurationMinutes
                    ? `${performerDetails.performanceDurationMinutes} min`
                    : undefined
                }
              />
              <DetailRow label="Budget" value={formatBudget(performerDetails.budget)} />
            </div>
          </ReviewSection>
        )}

        {category === "crew" && (
          <ReviewSection
            title="Requirement Details"
            onEdit={() => onEditStep?.("requirements")}
          >
            <div className="space-y-1">
              <DetailRow label="Role" value={crewDetails.crewRole} />
              <DetailRow label="Headcount" value={crewDetails.crewCount} />
              <DetailRow
                label="Experience"
                value={
                  crewDetails.experienceLevel
                    ? crewDetails.experienceLevel.charAt(0).toUpperCase() +
                      crewDetails.experienceLevel.slice(1)
                    : undefined
                }
              />
              <DetailRow
                label="Shift"
                value={
                  crewDetails.shiftStart && crewDetails.shiftEnd
                    ? `${crewDetails.shiftStart} — ${crewDetails.shiftEnd}`
                    : undefined
                }
              />
              <DetailRow label="Budget" value={formatBudget(crewDetails.budget)} />
            </div>
          </ReviewSection>
        )}

        {(plannerDetails.specialRequirements ||
          performerDetails.technicalRequirements ||
          crewDetails.equipmentRequired ||
          crewDetails.specialRequirements) && (
          <ReviewSection
            title="Additional Notes"
            onEdit={() => onEditStep?.("details")}
          >
            <div className="space-y-1">
              {plannerDetails.specialRequirements && (
                <DetailRow
                  label="Special requirements"
                  value={plannerDetails.specialRequirements}
                />
              )}
              {performerDetails.technicalRequirements && (
                <DetailRow
                  label="Technical requirements"
                  value={performerDetails.technicalRequirements}
                />
              )}
              {performerDetails.portfolioUrl && (
                <DetailRow label="Portfolio" value={performerDetails.portfolioUrl} />
              )}
              {crewDetails.equipmentRequired && (
                <DetailRow
                  label="Equipment"
                  value={crewDetails.equipmentRequired}
                />
              )}
              {crewDetails.specialRequirements && (
                <DetailRow
                  label="Special requirements"
                  value={crewDetails.specialRequirements}
                />
              )}
            </div>
          </ReviewSection>
        )}
      </div>
    </div>
  );
}
