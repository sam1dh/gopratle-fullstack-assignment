import { test, expect } from "@playwright/test";

test.describe("Requirement Wizard E2E", () => {
  test("happy path — fill, review, submit", async ({ page }) => {
    await page.route("**/api/v1/requirements", (route) =>
      route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            id: "req_e2e_test_001",
            category: "performer",
            status: "submitted",
          },
        }),
      })
    );

    await page.goto("/");

    // Step 1 — Basics
    await expect(page.getByText("What are you planning?")).toBeVisible();
    await page.fill("#eventName", "Year-End Celebration");
    await page.selectOption("#eventType", { label: "Corporate Event" });
    await page.fill("#startDate", "2026-12-20");
    await page.fill("#endDate", "2026-12-20");
    await page.fill("#location", "Hyderabad");

    await page.getByText("Performer", { exact: true }).click();
    await page.click("button:has-text('Continue')");

    // Step 2 — Requirements
    await expect(page.getByText("What do you need for the performance?")).toBeVisible();
    const inputs = page.locator("input[placeholder]");
    await inputs.nth(0).fill("Live Band");
    await inputs.nth(2).fill("5");
    await inputs.nth(3).fill("90");
    await inputs.nth(4).fill("75000");
    await page.click("button:has-text('Continue')");

    // Step 3 — Details (optional)
    await expect(page.getByText("Technical requirements and portfolio")).toBeVisible();
    await page.locator("textarea").fill("PA system + monitors");
    await page.click("button:has-text('Continue')");

    // Step 4 — Review
    await expect(page.getByRole("heading", { name: "Review your requirement" })).toBeVisible();
    await expect(page.getByText("Year-End Celebration")).toBeVisible();
    await expect(page.getByText("Live Band")).toBeVisible();

    // Submit
    await page.click("button:has-text('Submit requirement')");
    await expect(page.getByText("Your requirement is in!")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("req_e2e_test_001")).toBeVisible();
  });
});
