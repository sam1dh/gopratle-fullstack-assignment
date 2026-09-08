"use client";

import { cn } from "../../lib/utils";
import type { Category } from "@gopratle/contracts";
import { CATEGORY_INFO } from "../../types/wizard";
import { CalendarDays, Music, Users, Check } from "lucide-react";

const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  planner: <CalendarDays className="w-5 h-5" />,
  performer: <Music className="w-5 h-5" />,
  crew: <Users className="w-5 h-5" />,
};

interface CategoryCardProps {
  category: Category;
  isSelected: boolean;
  onSelect: (category: Category) => void;
}

export function CategoryCard({ category, isSelected, onSelect }: CategoryCardProps) {
  const info = CATEGORY_INFO[category];

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      aria-label={info.title}
      onClick={() => onSelect(category)}
      className={cn(
        "relative flex flex-col gap-[10px] p-[18px_16px_16px] border-[1.5px] rounded-[var(--radius-lg)] bg-white cursor-pointer transition-all duration-150 text-left w-full",
        "hover:border-[#c2c9da] hover:translate-y-[-2px] hover:shadow-[var(--shadow-md)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isSelected && "border-primary gradient-brand-soft shadow-[0_0_0_4px_var(--ring)]"
      )}
    >
      <span
        className={cn(
          "w-[42px] h-[42px] rounded-[12px] grid place-items-center transition-all duration-150",
          "bg-primary-soft text-primary",
          isSelected && "gradient-brand text-white shadow-[0_6px_14px_-4px_rgba(79,70,229,0.5)]"
        )}
      >
        {CATEGORY_ICONS[category]}
      </span>
      <span className="font-bold text-[15px] tracking-[-0.01em]">{info.title}</span>
      <span className="text-[13px] leading-[1.55] text-foreground/60">{info.description}</span>
      <span
        className={cn(
          "absolute top-[13px] right-[13px] w-[22px] h-[22px] rounded-full border-2 bg-white grid place-items-center transition-all duration-150",
          isSelected ? "border-primary bg-primary" : "border-border-strong"
        )}
        aria-hidden="true"
      >
        <Check
          className={cn(
            "w-[11px] h-[11px] text-white transition-all duration-150",
            isSelected ? "opacity-100 scale-100" : "opacity-0 scale-50"
          )}
        />
      </span>
    </button>
  );
}
