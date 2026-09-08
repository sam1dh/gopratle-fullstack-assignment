"use client";

import { Label } from "../ui/label";
import type { Category, PlannerDetails, PerformerDetails, CrewDetails } from "@gopratle/contracts";

interface StepRequirementsProps {
  category: Category;
  plannerDetails: Partial<PlannerDetails>;
  performerDetails: Partial<PerformerDetails>;
  crewDetails: Partial<CrewDetails>;
  onPlannerChange: (data: Partial<PlannerDetails>) => void;
  onPerformerChange: (data: Partial<PerformerDetails>) => void;
  onCrewChange: (data: Partial<CrewDetails>) => void;
  errors: Record<string, string>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex gap-[6px] items-center text-destructive text-[13px] font-medium mt-[7px] mx-[2px]">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      {message}
    </p>
  );
}

const MicIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <path d="M12 19v3" />
  </svg>
);

const TagIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2H2v10l9.3 9.3a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4Z" />
    <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
  </svg>
);

const UsersIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
  </svg>
);

const ClockIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

export function StepRequirements({
  category,
  plannerDetails,
  performerDetails,
  crewDetails,
  onPlannerChange,
  onPerformerChange,
  onCrewChange,
  errors,
}: StepRequirementsProps) {
  if (category === "planner") {
    return (
      <div>
        <header className="mb-[30px]">
          <p className="m-0 mb-2 text-[12.5px] font-bold tracking-[0.08em] uppercase text-primary">Step 2 of 4</p>
          <h1 className="m-0 text-[27px] font-extrabold tracking-[-0.03em]">What do you need for this event?</h1>
          <p className="mt-2 mb-0 text-[15px] text-foreground/60">Tell us the key details.</p>
        </header>
        <div className="grid grid-cols-2 gap-[20px_18px] mb-5 max-[980px]:grid-cols-1">
          <div>
            <Label className="block text-[13.5px] font-semibold text-foreground mb-[7px]">Guest count <span className="text-destructive">*</span></Label>
            <div className="relative flex items-center">
              <span className="absolute left-[13px] w-[17px] h-[17px] text-muted-foreground pointer-events-none">{UsersIcon}</span>
              <input
                type="number"
                min={1}
                placeholder="e.g. 200"
                value={plannerDetails.guestCount || ""}
                onChange={(e) => onPlannerChange({ guestCount: parseInt(e.target.value) || 0 })}
                className="w-full h-[47px] border border-border-strong rounded-[var(--radius)] bg-white text-[15px] text-foreground pl-[41px] pr-[14px] placeholder:text-[#a6adbf] transition-[border-color,box-shadow] duration-150 hover:border-[#b9c1d2] focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_var(--ring)]"
              />
            </div>
            <FieldError message={errors.guestCount} />
          </div>
          <div>
            <Label className="block text-[13.5px] font-semibold text-foreground mb-[7px]">Budget (INR) <span className="text-destructive">*</span></Label>
            <div className="relative flex items-center">
              <span className="absolute left-[14px] text-[15px] font-semibold text-foreground/60 pointer-events-none">₹</span>
              <input
                type="number"
                min={0}
                placeholder="500000"
                value={plannerDetails.budget || ""}
                onChange={(e) => onPlannerChange({ budget: parseInt(e.target.value) || 0 })}
                className="w-full h-[47px] border border-border-strong rounded-[var(--radius)] bg-white text-[15px] text-foreground pl-[34px] pr-[14px] placeholder:text-[#a6adbf] transition-[border-color,box-shadow] duration-150 hover:border-[#b9c1d2] focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_var(--ring)]"
              />
            </div>
            <FieldError message={errors.budget} />
          </div>
        </div>
        <div className="grid gap-5 mb-5">
          <div>
            <Label className="block text-[13.5px] font-semibold text-foreground mb-[7px]">Services needed <span className="text-destructive">*</span></Label>
            <div className="relative flex items-center">
              <span className="absolute left-[13px] w-[17px] h-[17px] text-muted-foreground pointer-events-none">{TagIcon}</span>
              <input
                placeholder="e.g. catering, decor, photography (comma separated)"
                value={plannerDetails.servicesNeeded ? plannerDetails.servicesNeeded.join(", ") : ""}
                onChange={(e) => onPlannerChange({
                  servicesNeeded: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                })}
                className="w-full h-[47px] border border-border-strong rounded-[var(--radius)] bg-white text-[15px] text-foreground pl-[41px] pr-[14px] placeholder:text-[#a6adbf] transition-[border-color,box-shadow] duration-150 hover:border-[#b9c1d2] focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_var(--ring)]"
              />
            </div>
            <FieldError message={errors.servicesNeeded} />
          </div>
        </div>
      </div>
    );
  }

  if (category === "performer") {
    return (
      <div>
        <header className="mb-[30px]">
          <p className="m-0 mb-2 text-[12.5px] font-bold tracking-[0.08em] uppercase text-primary">Step 2 of 4</p>
          <h1 className="m-0 text-[27px] font-extrabold tracking-[-0.03em]">What do you need for the performance?</h1>
          <p className="mt-2 mb-0 text-[15px] text-foreground/60">Key details so the right pros can quote you faster.</p>
        </header>
        <div className="grid grid-cols-2 gap-[20px_18px] mb-5 max-[980px]:grid-cols-1">
          <div>
            <Label className="block text-[13.5px] font-semibold text-foreground mb-[7px]">Performance type <span className="text-destructive">*</span></Label>
            <div className="relative flex items-center">
              <span className="absolute left-[13px] w-[17px] h-[17px] text-muted-foreground pointer-events-none">{MicIcon}</span>
              <input
                placeholder="e.g. Live Band"
                value={performerDetails.performanceType || ""}
                onChange={(e) => onPerformerChange({ performanceType: e.target.value })}
                className="w-full h-[47px] border border-border-strong rounded-[var(--radius)] bg-white text-[15px] text-foreground pl-[41px] pr-[14px] placeholder:text-[#a6adbf] transition-[border-color,box-shadow] duration-150 hover:border-[#b9c1d2] focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_var(--ring)]"
              />
            </div>
            <FieldError message={errors.performanceType} />
          </div>
          <div>
            <Label className="block text-[13.5px] font-semibold text-foreground mb-[7px]">Genre <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <div className="relative flex items-center">
              <span className="absolute left-[13px] w-[17px] h-[17px] text-muted-foreground pointer-events-none">{TagIcon}</span>
              <input
                placeholder="e.g. Indie / Pop"
                value={performerDetails.genre || ""}
                onChange={(e) => onPerformerChange({ genre: e.target.value })}
                className="w-full h-[47px] border border-border-strong rounded-[var(--radius)] bg-white text-[15px] text-foreground pl-[41px] pr-[14px] placeholder:text-[#a6adbf] transition-[border-color,box-shadow] duration-150 hover:border-[#b9c1d2] focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_var(--ring)]"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-[20px_18px] mb-5 max-[980px]:grid-cols-2 max-[520px]:grid-cols-1">
          <div>
            <Label className="block text-[13.5px] font-semibold text-foreground mb-[7px]">Performers <span className="text-destructive">*</span></Label>
            <div className="relative flex items-center">
              <span className="absolute left-[13px] w-[17px] h-[17px] text-muted-foreground pointer-events-none">{UsersIcon}</span>
              <input
                type="number"
                min={1}
                placeholder="e.g. 5"
                value={performerDetails.performerCount || ""}
                onChange={(e) => onPerformerChange({ performerCount: parseInt(e.target.value) || 0 })}
                className="w-full h-[47px] border border-border-strong rounded-[var(--radius)] bg-white text-[15px] text-foreground pl-[41px] pr-[14px] placeholder:text-[#a6adbf] transition-[border-color,box-shadow] duration-150 hover:border-[#b9c1d2] focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_var(--ring)]"
              />
            </div>
            <FieldError message={errors.performerCount} />
          </div>
          <div>
            <Label className="block text-[13.5px] font-semibold text-foreground mb-[7px]">Duration <span className="text-destructive">*</span></Label>
            <div className="relative flex items-center">
              <span className="absolute left-[13px] w-[17px] h-[17px] text-muted-foreground pointer-events-none">{ClockIcon}</span>
              <input
                type="number"
                min={15}
                placeholder="e.g. 90"
                value={performerDetails.performanceDurationMinutes || ""}
                onChange={(e) => onPerformerChange({ performanceDurationMinutes: parseInt(e.target.value) || 0 })}
                className="w-full h-[47px] border border-border-strong rounded-[var(--radius)] bg-white text-[15px] text-foreground pl-[41px] pr-[52px] placeholder:text-[#a6adbf] transition-[border-color,box-shadow] duration-150 hover:border-[#b9c1d2] focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_var(--ring)]"
              />
              <span className="absolute right-[14px] text-[13px] font-semibold text-muted-foreground pointer-events-none">min</span>
            </div>
            <FieldError message={errors.performanceDurationMinutes} />
          </div>
          <div>
            <Label className="block text-[13.5px] font-semibold text-foreground mb-[7px]">Budget <span className="text-destructive">*</span></Label>
            <div className="relative flex items-center">
              <span className="absolute left-[14px] text-[15px] font-semibold text-foreground/60 pointer-events-none">₹</span>
              <input
                type="number"
                min={0}
                placeholder="75,000"
                value={performerDetails.budget || ""}
                onChange={(e) => onPerformerChange({ budget: parseInt(e.target.value) || 0 })}
                className="w-full h-[47px] border border-border-strong rounded-[var(--radius)] bg-white text-[15px] text-foreground pl-[34px] pr-[14px] placeholder:text-[#a6adbf] transition-[border-color,box-shadow] duration-150 hover:border-[#b9c1d2] focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_var(--ring)]"
              />
            </div>
            <FieldError message={errors.budget} />
          </div>
        </div>
      </div>
    );
  }

  if (category === "crew") {
    return (
      <div>
        <header className="mb-[30px]">
          <p className="m-0 mb-2 text-[12.5px] font-bold tracking-[0.08em] uppercase text-primary">Step 2 of 4</p>
          <h1 className="m-0 text-[27px] font-extrabold tracking-[-0.03em]">What do you need for the crew?</h1>
          <p className="mt-2 mb-0 text-[15px] text-foreground/60">Tell us the key details.</p>
        </header>
        <div className="grid grid-cols-2 gap-[20px_18px] mb-5 max-[980px]:grid-cols-1">
          <div>
            <Label className="block text-[13.5px] font-semibold text-foreground mb-[7px]">Crew role <span className="text-destructive">*</span></Label>
            <div className="relative flex items-center">
              <span className="absolute left-[13px] w-[17px] h-[17px] text-muted-foreground pointer-events-none">{UsersIcon}</span>
              <input
                placeholder="e.g. Grip, Lighting Tech"
                value={crewDetails.crewRole || ""}
                onChange={(e) => onCrewChange({ crewRole: e.target.value })}
                className="w-full h-[47px] border border-border-strong rounded-[var(--radius)] bg-white text-[15px] text-foreground pl-[41px] pr-[14px] placeholder:text-[#a6adbf] transition-[border-color,box-shadow] duration-150 hover:border-[#b9c1d2] focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_var(--ring)]"
              />
            </div>
            <FieldError message={errors.crewRole} />
          </div>
          <div>
            <Label className="block text-[13.5px] font-semibold text-foreground mb-[7px]">Headcount <span className="text-destructive">*</span></Label>
            <div className="relative flex items-center">
              <span className="absolute left-[13px] w-[17px] h-[17px] text-muted-foreground pointer-events-none">{UsersIcon}</span>
              <input
                type="number"
                min={1}
                placeholder="e.g. 4"
                value={crewDetails.crewCount || ""}
                onChange={(e) => onCrewChange({ crewCount: parseInt(e.target.value) || 0 })}
                className="w-full h-[47px] border border-border-strong rounded-[var(--radius)] bg-white text-[15px] text-foreground pl-[41px] pr-[14px] placeholder:text-[#a6adbf] transition-[border-color,box-shadow] duration-150 hover:border-[#b9c1d2] focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_var(--ring)]"
              />
            </div>
            <FieldError message={errors.crewCount} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-[20px_18px] mb-5 max-[980px]:grid-cols-2 max-[520px]:grid-cols-1">
          <div>
            <Label className="block text-[13.5px] font-semibold text-foreground mb-[7px]">Experience level <span className="text-destructive">*</span></Label>
            <select
              value={crewDetails.experienceLevel || ""}
              onChange={(e) => onCrewChange({ experienceLevel: e.target.value as "entry" | "intermediate" | "expert" })}
              className="w-full h-[47px] border border-border-strong rounded-[var(--radius)] bg-white text-[15px] text-foreground appearance-none pr-[38px] pl-[14px] transition-[border-color,box-shadow] duration-150 hover:border-[#b9c1d2] focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_var(--ring)] cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%238a93a8' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 13px center",
              }}
            >
              <option value="" disabled>Select level</option>
              <option value="entry">Entry</option>
              <option value="intermediate">Intermediate</option>
              <option value="expert">Expert</option>
            </select>
            <FieldError message={errors.experienceLevel} />
          </div>
          <div>
            <Label className="block text-[13.5px] font-semibold text-foreground mb-[7px]">Shift start <span className="text-destructive">*</span></Label>
            <input
              type="time"
              value={crewDetails.shiftStart || ""}
              onChange={(e) => onCrewChange({ shiftStart: e.target.value })}
              className="w-full h-[47px] border border-border-strong rounded-[var(--radius)] bg-white text-[15px] text-foreground px-[14px] transition-[border-color,box-shadow] duration-150 hover:border-[#b9c1d2] focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_var(--ring)]"
            />
            <FieldError message={errors.shiftStart} />
          </div>
          <div>
            <Label className="block text-[13.5px] font-semibold text-foreground mb-[7px]">Shift end <span className="text-destructive">*</span></Label>
            <input
              type="time"
              value={crewDetails.shiftEnd || ""}
              onChange={(e) => onCrewChange({ shiftEnd: e.target.value })}
              className="w-full h-[47px] border border-border-strong rounded-[var(--radius)] bg-white text-[15px] text-foreground px-[14px] transition-[border-color,box-shadow] duration-150 hover:border-[#b9c1d2] focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_var(--ring)]"
            />
            <FieldError message={errors.shiftEnd} />
          </div>
        </div>
        <div className="grid gap-5 mb-5">
          <div>
            <Label className="block text-[13.5px] font-semibold text-foreground mb-[7px]">Budget (INR) <span className="text-destructive">*</span></Label>
            <div className="relative flex items-center">
              <span className="absolute left-[14px] text-[15px] font-semibold text-foreground/60 pointer-events-none">₹</span>
              <input
                type="number"
                min={0}
                placeholder="120000"
                value={crewDetails.budget || ""}
                onChange={(e) => onCrewChange({ budget: parseInt(e.target.value) || 0 })}
                className="w-full h-[47px] border border-border-strong rounded-[var(--radius)] bg-white text-[15px] text-foreground pl-[34px] pr-[14px] placeholder:text-[#a6adbf] transition-[border-color,box-shadow] duration-150 hover:border-[#b9c1d2] focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_var(--ring)]"
              />
            </div>
            <FieldError message={errors.budget} />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
