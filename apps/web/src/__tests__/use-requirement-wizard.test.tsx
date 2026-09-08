import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRequirementWizard } from "../../hooks/use-requirement-wizard";

describe("useRequirementWizard", () => {
  it("starts on the basics step", () => {
    const { result } = renderHook(() => useRequirementWizard());
    expect(result.current.step).toBe("basics");
    expect(result.current.stepIndex).toBe(0);
    expect(result.current.isFirstStep).toBe(true);
    expect(result.current.isLastStep).toBe(false);
  });

  it("navigates forward and back", () => {
    const { result } = renderHook(() => useRequirementWizard());

    act(() => {
      result.current.goNext();
    });
    expect(result.current.step).toBe("requirements");

    act(() => {
      result.current.goBack();
    });
    expect(result.current.step).toBe("basics");
  });

  it("cannot go back from first step", () => {
    const { result } = renderHook(() => useRequirementWizard());
    expect(result.current.canGoBack).toBe(false);
  });

  it("cannot go forward from last step", () => {
    const { result } = renderHook(() => useRequirementWizard());

    act(() => {
      result.current.goNext();
    });
    act(() => {
      result.current.goNext();
    });
    act(() => {
      result.current.goNext();
    });
    expect(result.current.step).toBe("review");
    expect(result.current.canGoNext).toBe(false);
    expect(result.current.isLastStep).toBe(true);
  });

  it("sets category and clears details", () => {
    const { result } = renderHook(() => useRequirementWizard());

    act(() => {
      result.current.setCategory("planner");
    });
    expect(result.current.category).toBe("planner");

    act(() => {
      result.current.updatePlannerDetails({ guestCount: 100 });
    });
    expect(result.current.plannerDetails.guestCount).toBe(100);

    act(() => {
      result.current.setCategory("performer");
    });
    expect(result.current.category).toBe("performer");
    expect(result.current.plannerDetails).toEqual({});
  });

  it("updates event data", () => {
    const { result } = renderHook(() => useRequirementWizard());

    act(() => {
      result.current.updateEvent({
        name: "Test Event",
        type: "Corporate",
        startDate: "2026-10-14",
        endDate: "2026-10-14",
        location: "Hyderabad",
      });
    });
    expect(result.current.event.name).toBe("Test Event");
    expect(result.current.event.location).toBe("Hyderabad");
  });

  it("goToStep only allows going to completed steps", () => {
    const { result } = renderHook(() => useRequirementWizard());

    act(() => {
      result.current.goNext();
    });
    expect(result.current.step).toBe("requirements");

    act(() => {
      result.current.goToStep("basics");
    });
    expect(result.current.step).toBe("basics");

    act(() => {
      result.current.goToStep("review");
    });
    expect(result.current.step).toBe("basics");
  });
});
