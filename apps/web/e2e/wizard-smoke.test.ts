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
    await page.fill("#eventType", "Corporate Party");
    await page.fill("#startDate", "2026-12-20");
    await page.fill("#endDate", "2026-12-20");
    await page.fill("#location", "Hyderabad");

    await page.getByRole("radio", { name: "Performer" }).click();
    await page.click("button:has-text('Continue')");

    // Step 2 — Requirements
    await expect(page.getByText("What do you need for the performance?")).toBeVisible();
    await page.fill("#performanceType", "Live Band");
    await page.fill("#performerCount", "5");
    await page.fill("#duration", "90");
    await page.fill("#performerBudget", "75000");
    await page.click("button:has-text('Continue')");

    // Step 3 — Details (optional)
    await expect(page.getByText("Technical requirements and portfolio")).toBeVisible();
    await page.fill("#technicalRequirements", "PA system + monitors");
    await page.click("button:has-text('Continue')");

    // Step 4 — Review
    await expect(page.getByText("Review your requirement")).toBeVisible();
    await expect(page.getByText("Year-End Celebration")).toBeVisible();
    await expect(page.getByText("Live Band")).toBeVisible();

    // Submit
    await page.click("button:has-text('Submit')");
    await expect(page.getByText("Requirement submitted")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("req_e2e_test_001")).toBeVisible();
  });
});
