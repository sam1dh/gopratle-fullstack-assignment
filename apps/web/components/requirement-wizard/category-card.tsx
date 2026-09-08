"use client";

import { cn } from "../../lib/utils";
import { Card } from "../ui/card";
import type { Category } from "@gopratle/contracts";
import { CATEGORY_INFO } from "../../types/wizard";
import { CalendarDays, Music, Users } from "lucide-react";

const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  planner: <CalendarDays className="h-6 w-6" />,
  performer: <Music className="h-6 w-6" />,
  crew: <Users className="h-6 w-6" />,
};

interface CategoryCardProps {
  category: Category;
  isSelected: boolean;
  onSelect: (category: Category) => void;
}

export function CategoryCard({ category, isSelected, onSelect }: CategoryCardProps) {
  const info = CATEGORY_INFO[category];

  return (
    <button type="button" onClick={() => onSelect(category)} className="w-full text-left">
      <Card
        className={cn(
          "p-5 transition-all hover:border-primary/50 hover:shadow-md",
          isSelected && "border-2 border-primary bg-primary/5 shadow-md"
        )}
      >
        <div className="flex items-start gap-4">
          <span
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg",
              isSelected
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {CATEGORY_ICONS[category]}
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base">{info.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{info.description}</p>
          </div>
          <span
            className={cn(
              "h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center mt-1",
              isSelected ? "border-primary" : "border-border"
            )}
          >
            {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
          </span>
        </div>
      </Card>
    </button>
  );
}
