"use client";

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { CategoryCard } from "./category-card";
import type { Category, EventInput } from "@gopratle/contracts";

interface StepBasicsProps {
  event: Partial<EventInput>;
  category: Category | null;
  onEventChange: (data: Partial<EventInput>) => void;
  onCategoryChange: (category: Category) => void;
  errors: Record<string, string>;
}

const CalendarIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const LocationIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const BuildingIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18" />
    <path d="M5 21V7l7-4 7 4v14" />
    <path d="M9 21v-6h6v6" />
  </svg>
);

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

export function StepBasics({
  event,
  category,
  onEventChange,
  onCategoryChange,
  errors,
}: StepBasicsProps) {
  return (
    <div>
      <header className="mb-[30px]">
        <p className="m-0 mb-2 text-[12.5px] font-bold tracking-[0.08em] uppercase text-primary">Step 1 of 4</p>
        <h1 className="m-0 text-[27px] font-extrabold tracking-[-0.03em]" tabIndex={-1}>What are you planning?</h1>
        <p className="mt-2 mb-0 text-[15px] text-foreground/60">Start with the essentials — pros use this to quote accurately.</p>
      </header>

      <div className="grid gap-5 mb-5">
        <div>
          <Label htmlFor="eventName" className="block text-[13.5px] font-semibold text-foreground mb-[7px]">
            Event name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="eventName"
            icon={CalendarIcon}
            placeholder="e.g. Hyderabad Product Launch Night"
            value={event.name || ""}
            onChange={(e) => onEventChange({ name: e.target.value })}
          />
          <FieldError message={errors.name} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-[20px_18px] mb-5 max-[980px]:grid-cols-1">
        <div>
          <Label htmlFor="eventType" className="block text-[13.5px] font-semibold text-foreground mb-[7px]">
            Event type <span className="text-destructive">*</span>
          </Label>
          <select
            id="eventType"
            value={event.type || ""}
            onChange={(e) => onEventChange({ type: e.target.value })}
            className="w-full h-[47px] border border-border-strong rounded-[var(--radius)] bg-white text-[15px] text-foreground appearance-none pr-[38px] pl-[14px] transition-[border-color,box-shadow] duration-150 hover:border-[#b9c1d2] focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_var(--ring)] cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%238a93a8' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 13px center",
            }}
          >
            <option value="" disabled>Select event type</option>
            <option>Corporate Event</option>
            <option>Wedding</option>
            <option>Concert</option>
            <option>Product Launch</option>
            <option>Conference</option>
            <option>College Fest</option>
            <option>Private Party</option>
            <option>Other</option>
          </select>
          <FieldError message={errors.type} />
        </div>
        <div>
          <Label htmlFor="venue" className="block text-[13.5px] font-semibold text-foreground mb-[7px]">
            Venue <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            id="venue"
            icon={BuildingIcon}
            placeholder="e.g. The Leela Palace"
            value={event.venue || ""}
            onChange={(e) => onEventChange({ venue: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-[20px_18px] mb-5 max-[980px]:grid-cols-1">
        <div>
          <Label htmlFor="startDate" className="block text-[13.5px] font-semibold text-foreground mb-[7px]">
            Start date <span className="text-destructive">*</span>
          </Label>
          <Input
            id="startDate"
            type="date"
            icon={CalendarIcon}
            value={event.startDate || ""}
            onChange={(e) => onEventChange({ startDate: e.target.value })}
          />
          <FieldError message={errors.startDate} />
        </div>
        <div>
          <Label htmlFor="endDate" className="block text-[13.5px] font-semibold text-foreground mb-[7px]">
            End date <span className="text-destructive">*</span>
          </Label>
          <Input
            id="endDate"
            type="date"
            icon={CalendarIcon}
            value={event.endDate || ""}
            onChange={(e) => onEventChange({ endDate: e.target.value })}
          />
          <FieldError message={errors.endDate} />
        </div>
      </div>

      <div className="grid gap-5 mb-5">
        <div>
          <Label htmlFor="location" className="block text-[13.5px] font-semibold text-foreground mb-[7px]">
            Location <span className="text-destructive">*</span>
          </Label>
          <Input
            id="location"
            icon={LocationIcon}
            placeholder="e.g. Hyderabad, Telangana"
            value={event.location || ""}
            onChange={(e) => onEventChange({ location: e.target.value })}
          />
          <FieldError message={errors.location} />
        </div>
      </div>

      <div className="h-px bg-border my-[34px] mb-[26px]" />

      <p className="text-[15px] font-bold mb-[2px]">Who are you looking for? <span className="text-destructive">*</span></p>
      <p className="text-[13.5px] text-foreground/60 m-0 mb-1">Select one category to continue</p>
      <div className="grid grid-cols-3 gap-3.5 mt-4 mb-1.5 max-[980px]:grid-cols-1 max-[520px]:grid-cols-1">
        {(["planner", "performer", "crew"] as const).map((cat) => (
          <CategoryCard
            key={cat}
            category={cat}
            isSelected={category === cat}
            onSelect={onCategoryChange}
          />
        ))}
      </div>
      <FieldError message={errors.category} />
    </div>
  );
}
