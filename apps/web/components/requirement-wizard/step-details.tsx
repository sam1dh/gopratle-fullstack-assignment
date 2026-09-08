"use client";

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import type { Category, PlannerDetails, PerformerDetails, CrewDetails } from "@gopratle/contracts";

interface StepDetailsProps {
  category: Category;
  plannerDetails: Partial<PlannerDetails>;
  performerDetails: Partial<PerformerDetails>;
  crewDetails: Partial<CrewDetails>;
  onPlannerChange: (data: Partial<PlannerDetails>) => void;
  onPerformerChange: (data: Partial<PerformerDetails>) => void;
  onCrewChange: (data: Partial<CrewDetails>) => void;
}

export function StepDetails({
  category,
  plannerDetails,
  performerDetails,
  crewDetails,
  onPlannerChange,
  onPerformerChange,
  onCrewChange,
}: StepDetailsProps) {
  if (category === "planner") {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Any preferences we should consider?
          </h2>
          <p className="text-muted-foreground">Theme, style, and special requirements.</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="themeOrStyle">Theme or style (optional)</Label>
            <Input
              id="themeOrStyle"
              placeholder="e.g. Modern Corporate"
              value={plannerDetails.themeOrStyle || ""}
              onChange={(e) => onPlannerChange({ themeOrStyle: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialRequirements">Special requirements (optional)</Label>
            <Textarea
              id="specialRequirements"
              placeholder="e.g. VIP seating area, accessibility needs"
              value={plannerDetails.specialRequirements || ""}
              onChange={(e) =>
                onPlannerChange({ specialRequirements: e.target.value })
              }
            />
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
            Technical requirements and portfolio
          </h2>
          <p className="text-muted-foreground">Any extras we should know about.</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="technicalRequirements">
              Technical requirements (optional)
            </Label>
            <Textarea
              id="technicalRequirements"
              placeholder="e.g. PA system + monitors, stage size"
              value={performerDetails.technicalRequirements || ""}
              onChange={(e) =>
                onPerformerChange({ technicalRequirements: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolioUrl">Portfolio URL (optional)</Label>
            <Input
              id="portfolioUrl"
              type="url"
              placeholder="https://example.com/portfolio"
              value={performerDetails.portfolioUrl || ""}
              onChange={(e) => onPerformerChange({ portfolioUrl: e.target.value })}
            />
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
            Equipment and special requirements
          </h2>
          <p className="text-muted-foreground">Any extras we should know about.</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="equipmentRequired">Equipment required (optional)</Label>
            <Textarea
              id="equipmentRequired"
              placeholder="e.g. Dolly + track, lighting rig"
              value={crewDetails.equipmentRequired || ""}
              onChange={(e) => onCrewChange({ equipmentRequired: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="crewSpecialRequirements">
              Special requirements (optional)
            </Label>
            <Textarea
              id="crewSpecialRequirements"
              placeholder="e.g. Early call time, union crew"
              value={crewDetails.specialRequirements || ""}
              onChange={(e) =>
                onCrewChange({ specialRequirements: e.target.value })
              }
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
