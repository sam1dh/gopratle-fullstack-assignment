"use client";

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select } from "../ui/select";
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
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            What do you need for this event?
          </h2>
          <p className="text-muted-foreground">Tell us the key details.</p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guestCount">Guest count</Label>
              <Input
                id="guestCount"
                type="number"
                min={1}
                placeholder="e.g. 200"
                value={plannerDetails.guestCount || ""}
                onChange={(e) =>
                  onPlannerChange({ guestCount: parseInt(e.target.value) || 0 })
                }
              />
              {errors.guestCount && (
                <p className="text-sm text-destructive">{errors.guestCount}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget (INR)</Label>
              <Input
                id="budget"
                type="number"
                min={0}
                placeholder="e.g. 500000"
                value={plannerDetails.budget || ""}
                onChange={(e) =>
                  onPlannerChange({ budget: parseInt(e.target.value) || 0 })
                }
              />
              {errors.budget && (
                <p className="text-sm text-destructive">{errors.budget}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="servicesNeeded">Services needed</Label>
            <Input
              id="servicesNeeded"
              placeholder="e.g. catering, decor, photography (comma separated)"
              value={
                plannerDetails.servicesNeeded
                  ? plannerDetails.servicesNeeded.join(", ")
                  : ""
              }
              onChange={(e) =>
                onPlannerChange({
                  servicesNeeded: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
            {errors.servicesNeeded && (
              <p className="text-sm text-destructive">{errors.servicesNeeded}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (category === "performer") {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            What do you need for the performance?
          </h2>
          <p className="text-muted-foreground">Tell us the key details.</p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="performanceType">Performance type</Label>
              <Input
                id="performanceType"
                placeholder="e.g. Live Band"
                value={performerDetails.performanceType || ""}
                onChange={(e) =>
                  onPerformerChange({ performanceType: e.target.value })
                }
              />
              {errors.performanceType && (
                <p className="text-sm text-destructive">{errors.performanceType}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="genre">Genre (optional)</Label>
              <Input
                id="genre"
                placeholder="e.g. Indie / Pop"
                value={performerDetails.genre || ""}
                onChange={(e) => onPerformerChange({ genre: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="performerCount">Performers</Label>
              <Input
                id="performerCount"
                type="number"
                min={1}
                placeholder="e.g. 5"
                value={performerDetails.performerCount || ""}
                onChange={(e) =>
                  onPerformerChange({
                    performerCount: parseInt(e.target.value) || 0,
                  })
                }
              />
              {errors.performerCount && (
                <p className="text-sm text-destructive">{errors.performerCount}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (min)</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                placeholder="e.g. 90"
                value={performerDetails.performanceDurationMinutes || ""}
                onChange={(e) =>
                  onPerformerChange({
                    performanceDurationMinutes: parseInt(e.target.value) || 0,
                  })
                }
              />
              {errors.performanceDurationMinutes && (
                <p className="text-sm text-destructive">
                  {errors.performanceDurationMinutes}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="performerBudget">Budget (INR)</Label>
              <Input
                id="performerBudget"
                type="number"
                min={0}
                placeholder="e.g. 75000"
                value={performerDetails.budget || ""}
                onChange={(e) =>
                  onPerformerChange({ budget: parseInt(e.target.value) || 0 })
                }
              />
              {errors.budget && (
                <p className="text-sm text-destructive">{errors.budget}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (category === "crew") {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            What do you need for the crew?
          </h2>
          <p className="text-muted-foreground">Tell us the key details.</p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="crewRole">Crew role</Label>
              <Input
                id="crewRole"
                placeholder="e.g. Grip, Lighting Tech"
                value={crewDetails.crewRole || ""}
                onChange={(e) => onCrewChange({ crewRole: e.target.value })}
              />
              {errors.crewRole && (
                <p className="text-sm text-destructive">{errors.crewRole}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="crewCount">Headcount</Label>
              <Input
                id="crewCount"
                type="number"
                min={1}
                placeholder="e.g. 4"
                value={crewDetails.crewCount || ""}
                onChange={(e) =>
                  onCrewChange({ crewCount: parseInt(e.target.value) || 0 })
                }
              />
              {errors.crewCount && (
                <p className="text-sm text-destructive">{errors.crewCount}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Experience level</Label>
              <Select
                id="experienceLevel"
                value={crewDetails.experienceLevel || ""}
                onChange={(e) =>
                  onCrewChange({
                    experienceLevel: e.target.value as "entry" | "intermediate" | "expert",
                  })
                }
                options={[
                  { value: "entry", label: "Entry" },
                  { value: "intermediate", label: "Intermediate" },
                  { value: "expert", label: "Expert" },
                ]}
                placeholder="Select level"
              />
              {errors.experienceLevel && (
                <p className="text-sm text-destructive">{errors.experienceLevel}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shiftStart">Shift start</Label>
              <Input
                id="shiftStart"
                type="time"
                value={crewDetails.shiftStart || ""}
                onChange={(e) => onCrewChange({ shiftStart: e.target.value })}
              />
              {errors.shiftStart && (
                <p className="text-sm text-destructive">{errors.shiftStart}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shiftEnd">Shift end</Label>
              <Input
                id="shiftEnd"
                type="time"
                value={crewDetails.shiftEnd || ""}
                onChange={(e) => onCrewChange({ shiftEnd: e.target.value })}
              />
              {errors.shiftEnd && (
                <p className="text-sm text-destructive">{errors.shiftEnd}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="crewBudget">Budget (INR)</Label>
            <Input
              id="crewBudget"
              type="number"
              min={0}
              placeholder="e.g. 120000"
              value={crewDetails.budget || ""}
              onChange={(e) =>
                onCrewChange({ budget: parseInt(e.target.value) || 0 })
              }
            />
            {errors.budget && (
              <p className="text-sm text-destructive">{errors.budget}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
