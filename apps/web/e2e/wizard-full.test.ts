import { test, expect, type Page } from "@playwright/test";

const API_MOCK = {
  success: {
    status: 201,
    contentType: "application/json",
    body: JSON.stringify({
      success: true,
      data: { id: "req_test_001", category: "performer", status: "submitted" },
    }),
  },
  error: {
    status: 500,
    contentType: "application/json",
    body: JSON.stringify({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Something went wrong on our end." },
    }),
  },
  validationError: {
    status: 422,
    contentType: "application/json",
    body: JSON.stringify({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid input", fields: { name: "Name is too short" } },
    }),
  },
};

async function fillPerformerStep1(page: Page) {
  await page.fill("#eventName", "Year-End Celebration");
  await page.selectOption("#eventType", { label: "Corporate Event" });
  await page.fill("#startDate", "2026-12-20");
  await page.fill("#endDate", "2026-12-20");
  await page.fill("#location", "Hyderabad");
  await page.getByText("Performer", { exact: true }).click();
}

async function fillPerformerStep2(page: Page) {
  const inputs = page.locator("input[placeholder]");
  await inputs.nth(0).fill("Live Band");
  await inputs.nth(1).fill("Indie / Pop");
  await inputs.nth(2).fill("5");
  await inputs.nth(3).fill("90");
  await inputs.nth(4).fill("75000");
}

async function fillPlannerStep1(page: Page) {
  await page.fill("#eventName", "Wedding Reception");
  await page.selectOption("#eventType", { label: "Wedding" });
  await page.fill("#startDate", "2026-11-15");
  await page.fill("#endDate", "2026-11-16");
  await page.fill("#location", "Bangalore");
  await page.getByText("Event Planner", { exact: true }).click();
}

async function fillPlannerStep2(page: Page) {
  const inputs = page.locator("input[placeholder]");
  await inputs.nth(0).fill("150");
  await inputs.nth(1).fill("500000");
  await inputs.nth(2).fill("catering, decor, photography");
}

async function fillCrewStep1(page: Page) {
  await page.fill("#eventName", "Tech Conference");
  await page.selectOption("#eventType", { label: "Conference" });
  await page.fill("#startDate", "2026-10-01");
  await page.fill("#endDate", "2026-10-03");
  await page.fill("#location", "Mumbai");
  await page.getByText("Crew", { exact: true }).click();
}

async function fillCrewStep2(page: Page) {
  const inputs = page.locator("input[placeholder]");
  await inputs.nth(0).fill("Lighting Tech");
  await inputs.nth(1).fill("4");
  await page.selectOption("select:has(option[value='entry'])", { label: "Expert" });
  await page.locator("input[type='time']").nth(0).fill("08:00");
  await page.locator("input[type='time']").nth(1).fill("20:00");
  await inputs.nth(2).fill("120000");
}

test.describe("E2E: Full wizard flow — Performer", () => {
  test("happy path: fill all steps, review, submit, see success", async ({ page }) => {
    await page.route("**/api/v1/requirements", (route) =>
      route.fulfill(API_MOCK.success)
    );

    await page.goto("/");
    await expect(page.getByText("What are you planning?")).toBeVisible();

    // Step 1
    await fillPerformerStep1(page);
    await page.screenshot({ path: "/home/shawmein/Downloads/qa-01-step1-filled.png", fullPage: true });
    await page.click("button:has-text('Continue')");

    // Step 2
    await expect(page.getByText("What do you need for the performance?")).toBeVisible();
    await fillPerformerStep2(page);
    await page.screenshot({ path: "/home/shawmein/Downloads/qa-02-step2-filled.png", fullPage: true });
    await page.click("button:has-text('Continue')");

    // Step 3
    await expect(page.getByText("Technical requirements and portfolio")).toBeVisible();
    await page.locator("textarea").fill("PA system + monitors, stage size 20x16");
    await page.locator("input[type='url']").fill("https://example.com/portfolio");
    await page.click("button:has-text('Continue')");

    // Step 4 - Review
    await expect(page.getByText("Review your requirement")).toBeVisible();
    await expect(page.getByText("Year-End Celebration")).toBeVisible();
    await expect(page.getByText("Live Band")).toBeVisible();
    await expect(page.getByText("Corporate Event")).toBeVisible();
    await expect(page.getByText("Hyderabad")).toBeVisible();
    await page.screenshot({ path: "/home/shawmein/Downloads/qa-03-review.png", fullPage: true });

    // Submit
    await page.click("button:has-text('Submit requirement')");
    await expect(page.getByText("Your requirement is in!")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("req_test_001")).toBeVisible();
    await expect(page.getByText("Quotes arrive in 24")).toBeVisible();
    await page.screenshot({ path: "/home/shawmein/Downloads/qa-04-success.png", fullPage: true });
  });
});

test.describe("E2E: Full wizard flow — Planner", () => {
  test("happy path: planner category", async ({ page }) => {
    await page.route("**/api/v1/requirements", (route) =>
      route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { id: "req_planner_001", category: "planner", status: "submitted" },
        }),
      })
    );

    await page.goto("/");
    await fillPlannerStep1(page);
    await page.click("button:has-text('Continue')");

    await expect(page.getByText("What do you need for this event?")).toBeVisible();
    await fillPlannerStep2(page);
    await page.click("button:has-text('Continue')");

    await expect(page.getByText("Any preferences we should consider?")).toBeVisible();
    await page.locator("textarea").fill("VIP seating area required");
    await page.click("button:has-text('Continue')");

    await expect(page.getByText("Review your requirement")).toBeVisible();
    await expect(page.getByText("Wedding Reception")).toBeVisible();
    await expect(page.getByText("Wedding", { exact: true })).toBeVisible();
    await expect(page.getByText("Bangalore")).toBeVisible();
    await page.screenshot({ path: "/home/shawmein/Downloads/qa-05-planner-review.png", fullPage: true });

    await page.click("button:has-text('Submit requirement')");
    await expect(page.getByText("Your requirement is in!")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("req_planner_001")).toBeVisible();
  });
});

test.describe("E2E: Full wizard flow — Crew", () => {
  test("happy path: crew category", async ({ page }) => {
    await page.route("**/api/v1/requirements", (route) =>
      route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { id: "req_crew_001", category: "crew", status: "submitted" },
        }),
      })
    );

    await page.goto("/");
    await fillCrewStep1(page);
    await page.click("button:has-text('Continue')");

    await expect(page.getByText("What do you need for the crew?")).toBeVisible();
    await fillCrewStep2(page);
    await page.click("button:has-text('Continue')");

    await expect(page.getByText("Equipment and special requirements")).toBeVisible();
    await page.locator("textarea").fill("Dolly + track, lighting rig");
    await page.click("button:has-text('Continue')");

    await expect(page.getByText("Review your requirement")).toBeVisible();
    await expect(page.getByText("Tech Conference")).toBeVisible();
    await expect(page.getByText("Crew")).toBeVisible();
    await expect(page.getByText("Mumbai")).toBeVisible();
    await expect(page.getByText("Lighting Tech")).toBeVisible();
    await page.screenshot({ path: "/home/shawmein/Downloads/qa-06-crew-review.png", fullPage: true });

    await page.click("button:has-text('Submit requirement')");
    await expect(page.getByText("Your requirement is in!")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("req_crew_001")).toBeVisible();
  });
});

test.describe("E2E: Validation", () => {
  test("step 1 shows errors when submitting empty", async ({ page }) => {
    await page.goto("/");
    await page.click("button:has-text('Continue')");

    await expect(page.getByText("Event name is required")).toBeVisible();
    await expect(page.getByText("Event type is required")).toBeVisible();
    await expect(page.getByText("Start date is required")).toBeVisible();
    await expect(page.getByText("End date is required")).toBeVisible();
    await expect(page.getByText("Location is required")).toBeVisible();
    await expect(page.getByText("Please select a category")).toBeVisible();
    await page.screenshot({ path: "/home/shawmein/Downloads/qa-07-validation-errors.png", fullPage: true });
  });

  test("step 2 shows errors when submitting empty", async ({ page }) => {
    await page.goto("/");
    await fillPerformerStep1(page);
    await page.click("button:has-text('Continue')");

    // Step 2 - try to continue without filling
    await page.click("button:has-text('Continue')");
    await expect(page.getByText("Performance type is required")).toBeVisible();
    await expect(page.getByText("Performer count must be at least 1")).toBeVisible();
    await expect(page.getByText("Minimum 15 minutes")).toBeVisible();
    await expect(page.getByText("Budget is required")).toBeVisible();
  });

  test("end date before start date shows error", async ({ page }) => {
    await page.goto("/");
    await page.fill("#eventName", "Test Event");
    await page.selectOption("#eventType", { label: "Concert" });
    await page.fill("#startDate", "2026-12-25");
    await page.fill("#endDate", "2026-12-20");
    await page.fill("#location", "Hyderabad");
    await page.getByText("Performer", { exact: true }).click();

    await page.click("button:has-text('Continue')");
    await expect(page.getByText("End date must be on or after start date")).toBeVisible();
  });

  test("duration < 15 minutes shows error", async ({ page }) => {
    await page.goto("/");
    await fillPerformerStep1(page);
    await page.click("button:has-text('Continue')");

    const inputs = page.locator("input[placeholder]");
    await inputs.nth(0).fill("Live Band");
    await inputs.nth(2).fill("5");
    await inputs.nth(3).fill("10"); // less than 15
    await inputs.nth(4).fill("75000");

    await page.click("button:has-text('Continue')");
    await expect(page.getByText("Minimum 15 minutes")).toBeVisible();
  });
});

test.describe("E2E: Navigation", () => {
  test("location autocomplete suggests and fills Google places", async ({ page }) => {
    await page.route("**/api/v1/places/autocomplete*", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            suggestions: [
              {
                placeId: "ChIJx9Lr6tqZyzsRwvu6koO3k64",
                text: "Hyderabad, Telangana, India",
                mainText: "Hyderabad",
                secondaryText: "Telangana, India",
              },
            ],
          },
        }),
      })
    );

    await page.goto("/");
    await expect(page.getByText("What are you planning?")).toBeVisible();
    await page.fill("#location", "Hyder");
    await expect(page.getByRole("listbox")).toBeVisible();
    await expect(page.getByText("Telangana, India")).toBeVisible();
    await page.getByText("Telangana, India").click();
    await expect(page.locator("#location")).toHaveValue("Hyderabad, Telangana, India");
  });

  test("sticky action bar never swallows card clicks (raw mouse click)", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("What are you planning?")).toBeVisible();

    // Scroll so the sticky bar overlaps the category cards, then click
    // with raw mouse coordinates (no auto-scroll-into-view rescue).
    await page.evaluate(() => window.scrollTo(0, 260));
    const card = page.locator('[role="radio"][aria-label="Crew"]');
    const box = await card.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await expect(card).toHaveAttribute("aria-checked", "true");
  });

  test("sticky action bar never swallows textarea clicks", async ({ page }) => {
    await page.goto("/");
    await fillPlannerStep1(page);
    await page.click("button:has-text('Continue')");
    await fillPlannerStep2(page);
    await page.click("button:has-text('Continue')");

    await expect(page.getByText("Any preferences")).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const area = page.locator("textarea");
    const box = await area.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.keyboard.type("VIP seating");
    await expect(area).toHaveValue("VIP seating");
  });

  test("back button returns to previous step", async ({ page }) => {
    await page.goto("/");
    await fillPerformerStep1(page);
    await page.click("button:has-text('Continue')");

    await expect(page.getByText("What do you need for the performance?")).toBeVisible();
    await page.click("button:has-text('Back')");
    await expect(page.getByText("What are you planning?")).toBeVisible();
    // Data should be preserved
    await expect(page.locator("#eventName")).toHaveValue("Year-End Celebration");
  });

  test("back button is not visible on step 1", async ({ page }) => {
    await page.goto("/");
    const backButton = page.locator("button:has-text('Back')");
    await expect(backButton).toBeHidden();
  });

  test("review edit buttons navigate to correct steps", async ({ page }) => {
    await page.goto("/");
    await fillPerformerStep1(page);
    await page.click("button:has-text('Continue')");

    await fillPerformerStep2(page);
    await page.click("button:has-text('Continue')");

    await page.locator("textarea").fill("PA system");
    await page.click("button:has-text('Continue')");

    await expect(page.getByText("Review your requirement")).toBeVisible();

    // Click Edit on Event card
    const editButtons = page.locator("button:has-text('Edit')");
    await editButtons.nth(0).click();
    await expect(page.getByText("What are you planning?")).toBeVisible();

    // Navigate back to review
    await page.click("button:has-text('Continue')");
    await page.click("button:has-text('Continue')");
    await page.click("button:has-text('Continue')");
    await expect(page.getByText("Review your requirement")).toBeVisible();

    // Click Edit on Requirement details
    await editButtons.nth(2).click();
    await expect(page.getByText("What do you need for the performance?")).toBeVisible();
  });

  test("sidebar step click navigates to completed steps only", async ({ page }) => {
    await page.goto("/");
    await fillPerformerStep1(page);
    await page.click("button:has-text('Continue')");

    await fillPerformerStep2(page);
    await page.click("button:has-text('Continue')");

    await page.locator("textarea").fill("PA system");
    await page.click("button:has-text('Continue')");

    // Click step 1 in sidebar
    await page.locator("nav button").nth(0).click();
    await expect(page.getByText("What are you planning?")).toBeVisible();
  });
});

test.describe("E2E: Progress bar", () => {
  test("progress bar updates on each step", async ({ page }) => {
    await page.goto("/");
    const progressBar = page.locator("[role='progressbar']");
    await expect(progressBar).toHaveAttribute("aria-valuenow", "25");

    await fillPerformerStep1(page);
    await page.click("button:has-text('Continue')");
    await expect(progressBar).toHaveAttribute("aria-valuenow", "50");

    await fillPerformerStep2(page);
    await page.click("button:has-text('Continue')");
    await expect(progressBar).toHaveAttribute("aria-valuenow", "75");

    await page.locator("textarea").fill("test");
    await page.click("button:has-text('Continue')");
    await expect(progressBar).toHaveAttribute("aria-valuenow", "100");
  });
});

test.describe("E2E: API error handling", () => {
  test("shows toast on API error", async ({ page }) => {
    await page.route("**/api/v1/requirements", (route) =>
      route.fulfill(API_MOCK.error)
    );

    await page.goto("/");
    await fillPerformerStep1(page);
    await page.click("button:has-text('Continue')");

    await fillPerformerStep2(page);
    await page.click("button:has-text('Continue')");

    await page.locator("textarea").fill("PA system");
    await page.click("button:has-text('Continue')");

    await page.click("button:has-text('Submit requirement')");
    await expect(page.getByText("Something went wrong")).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: "/home/shawmein/Downloads/qa-08-api-error.png", fullPage: true });
  });

  test("shows toast on network error", async ({ page }) => {
    await page.route("**/api/v1/requirements", (route) =>
      route.abort("connectionrefused")
    );

    await page.goto("/");
    await fillPerformerStep1(page);
    await page.click("button:has-text('Continue')");

    await fillPerformerStep2(page);
    await page.click("button:has-text('Continue')");

    await page.locator("textarea").fill("PA system");
    await page.click("button:has-text('Continue')");

    await page.click("button:has-text('Submit requirement')");
    // Submit surfaces the real failure (fetch abort) instead of a generic message
    await expect(page.getByText(/fetch failed|Failed to create requirement/i)).toBeVisible({ timeout: 10000 });
  });
});

test.describe("E2E: Auto-save drafts", () => {
  test("saves draft to localStorage and restores on reload", async ({ page }) => {
    await page.goto("/");
    await page.fill("#eventName", "Draft Test Event");
    await page.selectOption("#eventType", { label: "Concert" });

    // Wait for auto-save debounce (600ms)
    await page.waitForTimeout(1000);

    // Verify draft saved indicator
    await expect(page.getByText("Draft saved at")).toBeVisible();

    // Reload page
    await page.reload();
    await page.waitForTimeout(500);

    // Verify draft restored
    await expect(page.locator("#eventName")).toHaveValue("Draft Test Event");
  });
});

test.describe("E2E: Category switching", () => {
  test("switching category resets step 2 details", async ({ page }) => {
    await page.goto("/");
    await fillPerformerStep1(page);
    await page.click("button:has-text('Continue')");

    await fillPerformerStep2(page);
    await page.click("button:has-text('Continue')");

    // Go back to step 1
    await page.locator("nav button").nth(0).click();
    await expect(page.getByText("What are you planning?")).toBeVisible();

    // Switch to planner
    await page.getByText("Event Planner", { exact: true }).click();
    await page.click("button:has-text('Continue')");

    // Step 2 should show planner fields
    await expect(page.getByText("What do you need for this event?")).toBeVisible();
    await expect(page.getByText("Guest count")).toBeVisible();
    await expect(page.getByText("Services needed")).toBeVisible();
  });
});

test.describe("E2E: Review page content", () => {
  test("review shows all entered data correctly for performer", async ({ page }) => {
    await page.goto("/");
    await fillPerformerStep1(page);
    await page.click("button:has-text('Continue')");

    await fillPerformerStep2(page);
    await page.click("button:has-text('Continue')");

    await page.locator("textarea").fill("PA system + monitors");
    await page.locator("input[type='url']").fill("https://example.com/portfolio");
    await page.click("button:has-text('Continue')");

    // Verify review content
    await expect(page.getByText("Year-End Celebration")).toBeVisible();
    await expect(page.getByText("Corporate Event")).toBeVisible();
    await expect(page.getByText("Live Band")).toBeVisible();
    await expect(page.getByText("Indie / Pop")).toBeVisible();
    await expect(page.getByText("75,000")).toBeVisible();
    await expect(page.getByText("90 min")).toBeVisible();
    await expect(page.getByText("PA system + monitors")).toBeVisible();
    await expect(page.getByText("https://example.com/portfolio")).toBeVisible();
    await expect(page.getByText("What happens next?")).toBeVisible();
  });
});

test.describe("E2E: Success screen", () => {
  test("success screen has correct content and buttons", async ({ page }) => {
    await page.route("**/api/v1/requirements", (route) =>
      route.fulfill(API_MOCK.success)
    );

    await page.goto("/");
    await fillPerformerStep1(page);
    await page.click("button:has-text('Continue')");

    await fillPerformerStep2(page);
    await page.click("button:has-text('Continue')");

    await page.locator("textarea").fill("PA system");
    await page.click("button:has-text('Continue')");

    await page.click("button:has-text('Submit requirement')");
    await expect(page.getByText("Your requirement is in!")).toBeVisible({ timeout: 10000 });

    // Verify success content
    await expect(page.getByText("We're matching you")).toBeVisible();
    await expect(page.getByText("Quotes arrive in 24")).toBeVisible();
    await expect(page.getByText("Book with confidence")).toBeVisible();
    await expect(page.getByText("Post another requirement")).toBeVisible();
    await expect(page.getByText("Go to dashboard")).toBeVisible();
  });
});

test.describe("E2E: Accessibility", () => {
  test("page has correct heading structure", async ({ page }) => {
    await page.goto("/");
    const h1 = page.locator("h1");
    await expect(h1).toHaveText("What are you planning?");
  });

  test("progress bar has correct ARIA attributes", async ({ page }) => {
    await page.goto("/");
    const progressBar = page.locator("[role='progressbar']");
    await expect(progressBar).toHaveAttribute("aria-label", "Form progress");
    await expect(progressBar).toHaveAttribute("aria-valuemin", "0");
    await expect(progressBar).toHaveAttribute("aria-valuemax", "100");
    await expect(progressBar).toHaveAttribute("aria-valuenow", "25");
  });

  test("category cards are accessible via keyboard", async ({ page }) => {
    await page.goto("/");
    const performerCard = page.getByRole("radio", { name: "Performer" });
    await performerCard.focus();
    await page.keyboard.press("Enter");
    await expect(performerCard).toHaveAttribute("aria-checked", "true");
  });
});
