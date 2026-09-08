"use client";

import { Label } from "../ui/label";
import type { Category, PlannerDetails, PerformerDetails, CrewDetails } from "@gopratle/contracts";
import { useState } from "react";

interface StepDetailsProps {
  category: Category;
  plannerDetails: Partial<PlannerDetails>;
  performerDetails: Partial<PerformerDetails>;
  crewDetails: Partial<CrewDetails>;
  onPlannerChange: (data: Partial<PlannerDetails>) => void;
  onPerformerChange: (data: Partial<PerformerDetails>) => void;
  onCrewChange: (data: Partial<CrewDetails>) => void;
}

const WrenchIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z" />
  </svg>
);

const LinkIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

export function StepDetails({
  category,
  plannerDetails,
  performerDetails,
  crewDetails,
  onPlannerChange,
  onPerformerChange,
  onCrewChange,
}: StepDetailsProps) {
  const [charCount, setCharCount] = useState(0);

  const technicalReqs =
    category === "planner"
      ? plannerDetails.specialRequirements
      : category === "performer"
        ? performerDetails.technicalRequirements
        : crewDetails.equipmentRequired;

  const portfolioUrl =
    category === "performer" ? performerDetails.portfolioUrl : undefined;

  const handleChange = (value: string) => {
    setCharCount(value.length);
    if (category === "planner") onPlannerChange({ specialRequirements: value });
    else if (category === "performer") onPerformerChange({ technicalRequirements: value });
    else onCrewChange({ equipmentRequired: value });
  };

  const handlePortfolioChange = (value: string) => {
    if (category === "performer") onPerformerChange({ portfolioUrl: value });
  };

  return (
    <div>
      <header className="mb-[30px]">
        <p className="m-0 mb-2 text-[12.5px] font-bold tracking-[0.08em] uppercase text-primary">Step 3 of 4</p>
        <h1 className="m-0 text-[27px] font-extrabold tracking-[-0.03em]">
          {category === "planner"
            ? "Any preferences we should consider?"
            : category === "performer"
              ? "Technical requirements and portfolio"
              : "Equipment and special requirements"}
        </h1>
        <p className="mt-2 mb-0 text-[15px] text-foreground/60">
          {category === "planner"
            ? "Theme, style, and special requirements."
            : "Any extras we should know about."}
        </p>
      </header>

      <div className="grid gap-5 mb-5">
        <div>
          <Label className="block text-[13.5px] font-semibold text-foreground mb-[7px]">
            {category === "planner"
              ? "Special requirements"
              : category === "performer"
                ? "Technical requirements"
                : "Equipment required"}{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <div className="relative flex items-start">
            <span className="absolute left-[13px] top-[15px] w-[17px] h-[17px] text-muted-foreground pointer-events-none">
              {WrenchIcon}
            </span>
            <textarea
              maxLength={500}
              placeholder={
                category === "planner"
                  ? "e.g. VIP seating area, accessibility needs"
                  : category === "performer"
                    ? "e.g. PA system + monitors, stage size"
                    : "e.g. Dolly + track, lighting rig"
              }
              value={technicalReqs || ""}
              onChange={(e) => handleChange(e.target.value)}
              className="w-full min-h-[118px] border border-border-strong rounded-[var(--radius)] bg-white text-[15px] text-foreground placeholder:text-[#a6adbf] resize-y leading-[1.55] py-[13px] pr-[14px] pl-[41px] transition-[border-color,box-shadow] duration-150 hover:border-[#b9c1d2] focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_var(--ring)]"
            />
            <span className="absolute right-3 bottom-[11px] text-xs text-muted-foreground bg-white/90 px-1 py-0.5 rounded-[6px]">
              {charCount}/500
            </span>
          </div>
        </div>

        {category === "performer" && (
          <div>
            <Label className="block text-[13.5px] font-semibold text-foreground mb-[7px]">
              Portfolio URL <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <div className="relative flex items-center">
              <span className="absolute left-[13px] w-[17px] h-[17px] text-muted-foreground pointer-events-none">
                {LinkIcon}
              </span>
              <input
                type="url"
                placeholder="https://example.com/portfolio"
                value={portfolioUrl || ""}
                onChange={(e) => handlePortfolioChange(e.target.value)}
                className="w-full h-[47px] border border-border-strong rounded-[var(--radius)] bg-white text-[15px] text-foreground pl-[41px] pr-[14px] placeholder:text-[#a6adbf] transition-[border-color,box-shadow] duration-150 hover:border-[#b9c1d2] focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_var(--ring)]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
