import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { LocationAutocomplete } from "../../components/requirement-wizard/location-autocomplete";

const suggestions = [
  { placeId: "a", text: "Hyderabad, Telangana, India", mainText: "Hyderabad", secondaryText: "Telangana, India" },
  { placeId: "b", text: "Hyderabad, Pakistan", mainText: "Hyderabad", secondaryText: "Pakistan" },
];

function Harness({ onSelect }: { onSelect: (v: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <LocationAutocomplete
      id="location"
      value={value}
      onChange={(v) => {
        setValue(v);
        onSelect(v);
      }}
      placeholder="City"
    />
  );
}

describe("LocationAutocomplete", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("shows Google suggestions after typing and fills on select", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { suggestions } }),
      })
    );
    const onChange = vi.fn();
    render(<Harness onSelect={onChange} />);
    fireEvent.change(screen.getByPlaceholderText("City"), { target: { value: "Hyder" } });
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByText("Telangana, India")).toBeVisible();
    expect(screen.getByText("Powered by Google")).toBeVisible();

    fireEvent.mouseDown(screen.getByText("Telangana, India"));
    expect(onChange).toHaveBeenCalledWith("Hyderabad, Telangana, India");
    expect(screen.getByPlaceholderText("City")).toHaveValue("Hyderabad, Telangana, India");
  });

  it("supports keyboard selection", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { suggestions } }),
      })
    );
    const onChange = vi.fn();
    render(<Harness onSelect={onChange} />);
    const input = screen.getByPlaceholderText("City");
    fireEvent.change(input, { target: { value: "Hyder" } });
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("Hyderabad, Telangana, India");
  });

  it("stays a plain input when the backend is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    const onChange = vi.fn();
    render(<Harness onSelect={onChange} />);
    fireEvent.change(screen.getByPlaceholderText("City"), { target: { value: "Nowhere" } });
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(onChange).toHaveBeenCalledWith("Nowhere");
  });
});
