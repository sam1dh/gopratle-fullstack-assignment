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

export function StepBasics({
  event,
  category,
  onEventChange,
  onCategoryChange,
  errors,
}: StepBasicsProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">What are you planning?</h2>
        <p className="text-muted-foreground">Start with the essentials.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="eventName">Event name</Label>
          <Input
            id="eventName"
            placeholder="e.g. Hyderabad Product Launch Night"
            value={event.name || ""}
            onChange={(e) => onEventChange({ name: e.target.value })}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="eventType">Event type</Label>
            <Input
              id="eventType"
              placeholder="e.g. Corporate Event"
              value={event.type || ""}
              onChange={(e) => onEventChange({ type: e.target.value })}
            />
            {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start date</Label>
            <Input
              id="startDate"
              type="date"
              value={event.startDate || ""}
              onChange={(e) => onEventChange({ startDate: e.target.value })}
            />
            {errors.startDate && (
              <p className="text-sm text-destructive">{errors.startDate}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="endDate">End date</Label>
            <Input
              id="endDate"
              type="date"
              value={event.endDate || ""}
              onChange={(e) => onEventChange({ endDate: e.target.value })}
            />
            {errors.endDate && (
              <p className="text-sm text-destructive">{errors.endDate}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g. Hyderabad, Telangana"
              value={event.location || ""}
              onChange={(e) => onEventChange({ location: e.target.value })}
            />
            {errors.location && (
              <p className="text-sm text-destructive">{errors.location}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="venue">Venue (optional)</Label>
          <Input
            id="venue"
            placeholder="e.g. The Leela Palace"
            value={event.venue || ""}
            onChange={(e) => onEventChange({ venue: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-base">Who are you looking for?</h3>
          <p className="text-sm text-muted-foreground mt-1">Select a category</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(["planner", "performer", "crew"] as const).map((cat) => (
            <CategoryCard
              key={cat}
              category={cat}
              isSelected={category === cat}
              onSelect={onCategoryChange}
            />
          ))}
        </div>
        {errors.category && (
          <p className="text-sm text-destructive">{errors.category}</p>
        )}
      </div>
    </div>
  );
}
