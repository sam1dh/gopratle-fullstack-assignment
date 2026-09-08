import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CategoryCard } from "../../components/requirement-wizard/category-card";

describe("CategoryCard", () => {
  it("renders category title and description", () => {
    render(
      <CategoryCard
        category="planner"
        isSelected={false}
        onSelect={vi.fn()}
      />
    );
    expect(screen.getByText("Event Planner")).toBeInTheDocument();
    expect(
      screen.getByText(/Coordinate vendors, logistics/)
    ).toBeInTheDocument();
  });

  it("calls onSelect when clicked", () => {
    const onSelect = vi.fn();
    render(
      <CategoryCard
        category="performer"
        isSelected={false}
        onSelect={onSelect}
      />
    );
    fireEvent.click(screen.getByRole("radio", { name: "Performer" }));
    expect(onSelect).toHaveBeenCalledWith("performer");
  });

  it("shows selected state", () => {
    render(
      <CategoryCard
        category="crew"
        isSelected={true}
        onSelect={vi.fn()}
      />
    );
    const radio = screen.getByRole("radio", { name: "Crew" });
    expect(radio).toHaveAttribute("aria-checked", "true");
  });

  it("shows unselected state", () => {
    render(
      <CategoryCard
        category="crew"
        isSelected={false}
        onSelect={vi.fn()}
      />
    );
    const radio = screen.getByRole("radio", { name: "Crew" });
    expect(radio).toHaveAttribute("aria-checked", "false");
  });
});
