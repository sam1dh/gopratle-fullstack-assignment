"use client";

import type {
  Category,
  EventInput,
  PlannerDetails,
  PerformerDetails,
  CrewDetails,
} from "@gopratle/contracts";
import { CATEGORY_INFO } from "../../types/wizard";
import { Pencil, Calendar, Music, Users, Wrench, CheckCircle2 } from "lucide-react";

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
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatBudget(amount?: number): string {
  if (!amount) return "—";
  return `₹${amount.toLocaleString("en-IN")}`;
}

const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  planner: <Calendar className="w-[17px] h-[17px]" />,
  performer: <Music className="w-[17px] h-[17px]" />,
  crew: <Users className="w-[17px] h-[17px]" />,
};

function ReviewCard({
  icon,
  title,
  onEdit,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  onEdit?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <article className="border border-border rounded-[var(--radius-lg)] bg-white mb-[14px] transition-shadow duration-200 hover:shadow-[var(--shadow-sm)]">
      <div className="flex items-center gap-3 p-[15px_20px] border-b border-border">
        <span className="w-9 h-9 rounded-[10px] gradient-brand text-white grid place-items-center">
          {icon}
        </span>
        <span className="font-bold text-[15px]">{title}</span>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="ml-auto inline-flex gap-[6px] items-center text-primary bg-primary-soft border-0 rounded-[9px] px-[13px] py-[7px] text-[13px] font-semibold cursor-pointer transition-colors duration-150 hover:bg-[#e2e7ff]"
          >
            <Pencil className="w-[13px] h-[13px]" />
            Edit
          </button>
        )}
      </div>
      {children && <div className="p-[18px_20px]">{children}</div>}
    </article>
  );
}

function KvRow({ label, value, highlight }: { label: string; value?: string | number | null; highlight?: boolean }) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-[11px_24px] text-[14.5px]">
      <dt className="text-foreground/60 font-medium">{label}</dt>
      <dd className={`m-0 font-semibold text-right ${highlight ? "text-primary bg-primary-soft px-[10px] py-[2px] rounded-full justify-self-end" : ""}`}>
        {value || "—"}
      </dd>
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
    <div>
      <header className="mb-[30px]">
        <p className="m-0 mb-2 text-[12.5px] font-bold tracking-[0.08em] uppercase text-primary">Step 4 of 4</p>
        <h1 className="m-0 text-[27px] font-extrabold tracking-[-0.03em]">Review your requirement</h1>
        <p className="mt-2 mb-0 text-[15px] text-foreground/60">One last check before we send it to matching pros.</p>
      </header>

      {/* Event */}
      <ReviewCard
        icon={<Calendar className="w-[17px] h-[17px]" />}
        title="Event"
        onEdit={() => onEditStep?.("basics")}
      >
        <p className="text-[17px] font-bold tracking-[-0.01em] m-0 mb-3">{event.name || "Untitled Event"}</p>
        <div className="flex flex-wrap gap-2">
          <span className="text-[12.5px] font-semibold px-[11px] py-[6px] rounded-full bg-primary-soft text-primary">{event.type || "—"}</span>
          <span className="text-[12.5px] font-semibold px-[11px] py-[6px] rounded-full bg-[#f1f3f8] text-foreground/60 inline-flex gap-1.5 items-center">
            <Calendar className="w-3 h-3" />
            {formatDate(event.startDate)} → {formatDate(event.endDate)}
          </span>
          <span className="text-[12.5px] font-semibold px-[11px] py-[6px] rounded-full bg-[#f1f3f8] text-foreground/60 inline-flex gap-1.5 items-center">
            📍 {event.location || "—"}
          </span>
          {event.venue && (
            <span className="text-[12.5px] font-semibold px-[11px] py-[6px] rounded-full bg-[#f1f3f8] text-foreground/60">
              🏛 {event.venue}
            </span>
          )}
        </div>
      </ReviewCard>

      {/* Category */}
      <ReviewCard
        icon={CATEGORY_ICONS[category]}
        title={`Category — ${info.title}`}
        onEdit={() => onEditStep?.("basics")}
      />

      {/* Requirement Details */}
      <ReviewCard
        icon={<Wrench className="w-[17px] h-[17px]" />}
        title="Requirement details"
        onEdit={() => onEditStep?.("requirements")}
      >
        <dl className="m-0">
          {category === "planner" && (
            <>
              <KvRow label="Guests" value={plannerDetails.guestCount} />
              <KvRow label="Services" value={plannerDetails.servicesNeeded?.length ? plannerDetails.servicesNeeded.join(", ") : undefined} />
              <KvRow label="Budget" value={formatBudget(plannerDetails.budget)} highlight />
              {plannerDetails.themeOrStyle && <KvRow label="Theme" value={plannerDetails.themeOrStyle} />}
            </>
          )}
          {category === "performer" && (
            <>
              <KvRow label="Type" value={performerDetails.performanceType} />
              <KvRow label="Genre" value={performerDetails.genre} />
              <KvRow label="Performers" value={performerDetails.performerCount} />
              <KvRow label="Duration" value={performerDetails.performanceDurationMinutes ? `${performerDetails.performanceDurationMinutes} min` : undefined} />
              <KvRow label="Budget" value={formatBudget(performerDetails.budget)} highlight />
            </>
          )}
          {category === "crew" && (
            <>
              <KvRow label="Role" value={crewDetails.crewRole} />
              <KvRow label="Headcount" value={crewDetails.crewCount} />
              <KvRow label="Experience" value={crewDetails.experienceLevel ? crewDetails.experienceLevel.charAt(0).toUpperCase() + crewDetails.experienceLevel.slice(1) : undefined} />
              <KvRow label="Shift" value={crewDetails.shiftStart && crewDetails.shiftEnd ? `${crewDetails.shiftStart} — ${crewDetails.shiftEnd}` : undefined} />
              <KvRow label="Budget" value={formatBudget(crewDetails.budget)} highlight />
            </>
          )}
        </dl>
      </ReviewCard>

      {/* Additional Notes */}
      {(plannerDetails.specialRequirements || performerDetails.technicalRequirements || performerDetails.portfolioUrl || crewDetails.equipmentRequired || crewDetails.specialRequirements) && (
        <ReviewCard
          icon={<Wrench className="w-[17px] h-[17px]" />}
          title="Additional notes"
          onEdit={() => onEditStep?.("details")}
        >
          <dl className="m-0">
            {plannerDetails.specialRequirements && <KvRow label="Special requirements" value={plannerDetails.specialRequirements} />}
            {performerDetails.technicalRequirements && <KvRow label="Technical requirements" value={performerDetails.technicalRequirements} />}
            {performerDetails.portfolioUrl && (
              <div className="grid grid-cols-[1fr_auto] gap-[11px_24px] text-[14.5px]">
                <dt className="text-foreground/60 font-medium">Portfolio</dt>
                <dd className="m-0 font-semibold text-right">
                  <a href={performerDetails.portfolioUrl} target="_blank" rel="noopener" className="text-primary font-semibold no-underline hover:underline">
                    {performerDetails.portfolioUrl}
                  </a>
                </dd>
              </div>
            )}
            {crewDetails.equipmentRequired && <KvRow label="Equipment" value={crewDetails.equipmentRequired} />}
            {crewDetails.specialRequirements && <KvRow label="Special requirements" value={crewDetails.specialRequirements} />}
          </dl>
        </ReviewCard>
      )}

      {/* What happens next */}
      <div className="flex gap-3 items-start mt-5 p-[14px_16px] rounded-[var(--radius)] bg-success-soft border border-emerald-200 text-[13.5px] text-[#065f46] leading-[1.55]">
        <CheckCircle2 className="w-[17px] h-[17px] text-success mt-[1px] shrink-0" />
        <span>
          <b>What happens next?</b> Verified pros in your area will review your requirement and send quotes within 24–48 hours. You compare, chat, and book — all in one place.
        </span>
      </div>
    </div>
  );
}
