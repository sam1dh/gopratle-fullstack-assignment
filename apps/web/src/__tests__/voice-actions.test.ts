import { describe, it, expect, vi, beforeEach } from "vitest";
import { applyVoiceAction, type WizardControls } from "../../lib/voice-actions";

function makeWizard(): WizardControls & {
  calls: { method: string; arg: unknown }[];
} {
  const calls: { method: string; arg: unknown }[] = [];
  return {
    calls,
    category: "performer",
    setCategory: (c) => { calls.push({ method: "setCategory", arg: c }); },
    updateEvent: (d) => { calls.push({ method: "updateEvent", arg: d }); },
    updatePlannerDetails: (d) => { calls.push({ method: "updatePlannerDetails", arg: d }); },
    updatePerformerDetails: (d) => { calls.push({ method: "updatePerformerDetails", arg: d }); },
    updateCrewDetails: (d) => { calls.push({ method: "updateCrewDetails", arg: d }); },
    goNext: () => { calls.push({ method: "goNext", arg: null }); },
    goBack: () => { calls.push({ method: "goBack", arg: null }); },
    goToStep: (s, o) => { calls.push({ method: "goToStep", arg: [s, o] }); },
    submit: () => { calls.push({ method: "submit", arg: null }); },
  };
}

describe("applyVoiceAction", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("sets an event field and returns a toast", () => {
    const w = makeWizard();
    const toast = applyVoiceAction(w, {
      type: "SUGGEST_FIELD_VALUE",
      field: "event.name",
      value: "Launch Night",
    });
    expect(w.calls).toEqual([{ method: "updateEvent", arg: { name: "Launch Night" } }]);
    expect(toast).toMatch(/Launch Night/);
  });

  it("routes details to the current category", () => {
    const w = makeWizard();
    applyVoiceAction(w, { type: "SUGGEST_FIELD_VALUE", field: "details.budget", value: 75000 });
    expect(w.calls).toEqual([{ method: "updatePerformerDetails", arg: { budget: 75000 } }]);
  });

  it("sets a valid category", () => {
    const w = makeWizard();
    const toast = applyVoiceAction(w, { type: "SUGGEST_FIELD_VALUE", field: "category", value: "crew" });
    expect(w.calls).toEqual([{ method: "setCategory", arg: "crew" }]);
    expect(toast).toMatch(/crew/);
  });

  it("rejects invalid category values", () => {
    const w = makeWizard();
    expect(
      applyVoiceAction(w, { type: "SUGGEST_FIELD_VALUE", field: "category", value: "spaceship" })
    ).toBeNull();
    expect(w.calls).toEqual([]);
  });

  it("rejects event types outside the dropdown options", () => {
    const w = makeWizard();
    expect(
      applyVoiceAction(w, { type: "SUGGEST_FIELD_VALUE", field: "event.type", value: "Live Music" })
    ).toBeNull();
    expect(w.calls).toEqual([]);
    const toast = applyVoiceAction(w, {
      type: "SUGGEST_FIELD_VALUE",
      field: "event.type",
      value: "Concert",
    });
    expect(toast).toMatch(/Concert/);
  });

  it("rejects unknown event keys", () => {
    const w = makeWizard();
    expect(
      applyVoiceAction(w, { type: "SUGGEST_FIELD_VALUE", field: "event.hacked", value: "x" })
    ).toBeNull();
    expect(w.calls).toEqual([]);
  });

  it("focuses a field by DOM id", () => {
    document.body.innerHTML = '<input id="eventName" />';
    const w = makeWizard();
    const el = document.getElementById("eventName")!;
    if (!("scrollIntoView" in el)) {
      (el as unknown as Record<string, unknown>).scrollIntoView = () => {};
    }
    const focusSpy = vi.spyOn(el, "focus");
    const scrollSpy = vi.spyOn(el, "scrollIntoView").mockImplementation(() => {});
    expect(applyVoiceAction(w, { type: "FOCUS_FIELD", field: "eventName" })).toBeNull();
    expect(focusSpy).toHaveBeenCalled();
    expect(scrollSpy).toHaveBeenCalled();
    expect(w.calls).toEqual([]);
  });

  it("navigates next/back/steps", () => {
    const w = makeWizard();
    applyVoiceAction(w, { type: "GO_TO_STEP", value: "next" });
    applyVoiceAction(w, { type: "GO_TO_STEP", value: "review" });
    expect(w.calls[0]).toEqual({ method: "goNext", arg: null });
    expect(w.calls[1]).toEqual({ method: "goToStep", arg: ["review", { force: true }] });
  });

  it("ignores NONE actions", () => {
    const w = makeWizard();
    expect(applyVoiceAction(w, { type: "NONE" })).toBeNull();
    expect(w.calls).toEqual([]);
  });

  it("submits the form on SUBMIT_REQUIREMENT", () => {
    const w = makeWizard();
    expect(applyVoiceAction(w, { type: "SUBMIT_REQUIREMENT" })).toBeNull();
    expect(w.calls).toEqual([{ method: "submit", arg: null }]);
  });

  it("maps event.category to category", () => {
    const w = makeWizard();
    const toast = applyVoiceAction(w, {
      type: "SUGGEST_FIELD_VALUE",
      field: "event.category",
      value: "performer",
    });
    expect(w.calls).toEqual([{ method: "setCategory", arg: "performer" }]);
    expect(toast).toMatch(/performer/);
  });

  it("normalizes requirements.* paths to details.*", () => {
    const w = makeWizard();
    const toast = applyVoiceAction(w, {
      type: "SUGGEST_FIELD_VALUE",
      field: "requirements.budget",
      value: 75000,
    });
    expect(w.calls).toEqual([{ method: "updatePerformerDetails", arg: { budget: 75000 } }]);
    expect(toast).toMatch(/75,000/);
  });

  it("normalizes bare detail names using the live category", () => {
    const w = makeWizard();
    applyVoiceAction(w, { type: "SUGGEST_FIELD_VALUE", field: "budget", value: 50000 });
    expect(w.calls).toEqual([{ method: "updatePerformerDetails", arg: { budget: 50000 } }]);
  });

  it("coerces service strings to arrays and rejects empties", () => {
    const w = { ...makeWizard(), category: "planner" as const };
    const toast = applyVoiceAction(w, {
      type: "SUGGEST_FIELD_VALUE",
      field: "details.servicesNeeded",
      value: "catering, decor",
    });
    expect(w.calls).toEqual([
      { method: "updatePlannerDetails", arg: { servicesNeeded: ["catering", "decor"] } },
    ]);
    expect(toast).toMatch(/catering, decor/);
    expect(
      applyVoiceAction(w, { type: "SUGGEST_FIELD_VALUE", field: "details.budget", value: "abc" })
    ).toBeNull();
  });
});
