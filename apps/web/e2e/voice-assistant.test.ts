import { test, expect } from "@playwright/test";

test.describe("Voice assistant", () => {
  test("floating button is visible, labeled, and there is no chat UI", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("What are you planning?")).toBeVisible();

    const button = page.getByRole("button", { name: "Start voice assistant" });
    await expect(button).toBeVisible();

    // Voice-first: no text conversation surface anywhere
    await expect(page.locator("main textarea, [role='log']")).toHaveCount(0);
    // Idle bubble with affordance, mic hero, compact language pill
    await expect(page.getByText("Tap to speak")).toBeVisible();
    await expect(page.getByRole("button", { name: /assistant language/i })).toBeVisible();

    // Language menu opens upward with both options
    await page.getByRole("button", { name: /assistant language/i }).click();
    await expect(page.getByRole("menuitemradio", { name: "English" })).toBeVisible();
    await expect(page.getByRole("menuitemradio", { name: "Hindi" })).toBeVisible();
    await page.keyboard.press("Escape");
  });

  test("unsupported browser shows recoverable error and form still works", async ({ page }) => {
    // Force the unsupported path deterministically.
    await page.addInitScript(() => {
      for (const key of ["SpeechRecognition", "webkitSpeechRecognition"]) {
        try {
          Object.defineProperty(window, key, { value: undefined, configurable: true });
        } catch {
          // noop
        }
      }
    });
    await page.goto("/");
    await page.getByRole("button", { name: "Start voice assistant" }).click();

    // Greeting plays first; recognition fails after since STT is unavailable.
    await expect(page.getByRole("status")).toContainText(/not supported/i, {
      timeout: 30000,
    });
    await expect(
      page.getByRole("button", { name: /error/i })
    ).toBeVisible();

    // Form must remain fully usable
    await page.fill("#eventName", "Voice Test Event");
    await expect(page.locator("#eventName")).toHaveValue("Voice Test Event");
  });

  test("continuous session: greeting -> listening -> answer -> listening -> stop", async ({ page }) => {
    let requestBody: { message?: string; language?: string; context?: { currentStep?: string } } | undefined;
    await page.route("**/api/v1/assistant/message", (route) => {
      requestBody = route.request().postDataJSON() as typeof requestBody;
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            response: "Choose Product Launch as the event type.",
            suggestedAction: { type: "NONE" },
          },
        }),
      });
    });
    // Mock TTS: no real audio, so the hook falls back to stubbed device speech.
    await page.route("**/api/v1/assistant/speak", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { mimeType: "audio/mock", audioBase64: "", text: "mock" },
        }),
      })
    );

    // Fake device speech APIs for a deterministic pipeline
    await page.addInitScript(() => {
      const w = window as unknown as Record<string, unknown>;
      w.SpeechRecognition = class {
        onresult: ((e: { results: { transcript: string }[][] }) => void) | null = null;
        onerror: unknown = null;
        onend: unknown = null;
        start() {
          setTimeout(
            () =>
              this.onresult?.({
                results: [[{ transcript: "What should I select for event type?" }]],
              }),
            150
          );
        }
        stop() {}
        abort() {}
      };
      w.speechSynthesis = undefined;
      try {
        Object.defineProperty(window, "speechSynthesis", {
          value: {
            speak(u: { onend?: () => void }) {
              setTimeout(() => u.onend?.(), 100);
            },
            cancel() {},
            getVoices: () => [],
          },
          configurable: true,
        });
      } catch {
        // fall back to real device speech
      }
    });

    await page.goto("/");
    await expect(page.getByText("What are you planning?")).toBeVisible();

    // Start: greeting speaks first, then the loop listens
    await page.getByRole("button", { name: "Start voice assistant" }).click();
    await expect(page.getByRole("status")).toContainText(/speaking/i, {
      timeout: 10000,
    });
    await expect(page.getByRole("status")).toContainText(/listening/i, {
      timeout: 15000,
    });

    // Answer a question: thinking -> speaking -> back to listening (stays on)
    await expect(page.getByRole("status")).toContainText(/thinking|speaking/i, {
      timeout: 10000,
    });
    await expect(page.getByRole("status")).toContainText(/speaking/i, {
      timeout: 10000,
    });
    await expect(page.getByRole("status")).toContainText(/listening/i, {
      timeout: 15000,
    });

    // Stop: tap again -> idle
    await page.getByRole("button", { name: "Stop voice assistant" }).click();
    await expect(
      page.getByRole("button", { name: "Start voice assistant" })
    ).toBeVisible({ timeout: 10000 });

    // Backend received the transcript plus live form context
    expect(requestBody?.message).toBe("What should I select for event type?");
    expect(requestBody?.context?.currentStep).toBe("event-basics");
  });

  test("Talk to us in the sidebar starts the voice session", async ({ page }) => {
    await page.route("**/api/v1/assistant/speak", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { mimeType: "audio/mock", audioBase64: "", text: "mock" },
        }),
      })
    );
    await page.addInitScript(() => {
      try {
        Object.defineProperty(window, "speechSynthesis", {
          value: {
            speak(u: { onend?: () => void }) {
              setTimeout(() => u.onend?.(), 100);
            },
            cancel() {},
            getVoices: () => [],
          },
          configurable: true,
        });
      } catch {
        // fall back to real device speech
      }
    });

    await page.goto("/");
    await expect(page.getByText("What are you planning?")).toBeVisible();
    await page.getByRole("link", { name: /talk to us/i }).click();
    // Session starts: greeting speaks, then it listens
    await expect(page.getByRole("status")).toContainText(/speaking|listening/i, {
      timeout: 15000,
    });
  });

  test("voice command fills the form field automatically", async ({ page }) => {
    await page.route("**/api/v1/assistant/message", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            response: "Done. Event name set to Launch Night.",
            suggestedAction: {
              type: "SUGGEST_FIELD_VALUE",
              field: "event.name",
              value: "Launch Night",
            },
          },
        }),
      })
    );
    await page.route("**/api/v1/assistant/speak", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { mimeType: "audio/mock", audioBase64: "", text: "mock" },
        }),
      })
    );

    await page.addInitScript(() => {
      const w = window as unknown as Record<string, unknown>;
      let calls = 0;
      w.SpeechRecognition = class {
        onresult: ((e: { results: { transcript: string }[][] }) => void) | null = null;
        onerror: unknown = null;
        onend: unknown = null;
        start() {
          calls += 1;
          // First session start: greeting turn (silence). Second: the command.
          if (calls === 1) {
            setTimeout(() => (this as { onend?: () => void }).onend?.(), 150);
          } else {
            setTimeout(
              () =>
                this.onresult?.({
                  results: [[{ transcript: "set event name to Launch Night" }]],
                }),
              150
            );
          }
        }
        stop() {}
        abort() {}
      };
      try {
        Object.defineProperty(window, "speechSynthesis", {
          value: {
            speak(u: { onend?: () => void }) {
              setTimeout(() => u.onend?.(), 100);
            },
            cancel() {},
            getVoices: () => [],
          },
          configurable: true,
        });
      } catch {
        // fall back to real device speech
      }
    });

    await page.goto("/");
    await expect(page.getByText("What are you planning?")).toBeVisible();

    await page.getByRole("button", { name: "Start voice assistant" }).click();

    // The command fills the field without typing
    await expect(page.locator("#eventName")).toHaveValue("Launch Night", {
      timeout: 20000,
    });
    await expect(page.getByText("Voice set Event name to Launch Night.")).toBeVisible();
  });
});

test.describe("Voice assistant - submit automation", () => {
  test("saying submit the form submits and shows success", async ({ page }) => {
    await page.route("**/api/v1/requirements", (route) =>
      route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { id: "req_voice_submit_001", category: "performer", status: "submitted" },
        }),
      })
    );
    await page.route("**/api/v1/assistant/message", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            response: "Submitting your requirement now.",
            suggestedAction: { type: "SUBMIT_REQUIREMENT" },
          },
        }),
      })
    );
    await page.route("**/api/v1/assistant/speak", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { mimeType: "audio/mock", audioBase64: "", text: "mock" },
        }),
      })
    );
    await page.addInitScript(() => {
      const w = window as unknown as Record<string, unknown>;
      let calls = 0;
      w.SpeechRecognition = class {
        onresult: ((e: { results: { transcript: string }[][] }) => void) | null = null;
        onerror: unknown = null;
        onend: unknown = null;
        start() {
          calls += 1;
          if (calls === 1) {
            setTimeout(() => (this as { onend?: () => void }).onend?.(), 150);
          } else {
            setTimeout(
              () => this.onresult?.({ results: [[{ transcript: "submit the form" }]] }),
              150
            );
          }
        }
        stop() {}
        abort() {}
      };
      try {
        Object.defineProperty(window, "speechSynthesis", {
          value: {
            speak(u: { onend?: () => void }) {
              setTimeout(() => u.onend?.(), 100);
            },
            cancel() {},
            getVoices: () => [],
          },
          configurable: true,
        });
      } catch {
        // fall back to real device speech
      }
    });

    // Fill a valid form through the UI, land on review
    await page.goto("/");
    await expect(page.getByText("What are you planning?")).toBeVisible();
    await page.fill("#eventName", "Voice Submit Show");
    await page.selectOption("#eventType", { label: "Concert" });
    await page.fill("#startDate", "2026-12-20");
    await page.fill("#endDate", "2026-12-20");
    await page.fill("#location", "Hyderabad");
    await page.getByText("Performer", { exact: true }).click();
    await page.click("button:has-text('Continue')");

    const inputs = page.locator("input[placeholder]");
    await inputs.nth(0).fill("DJ");
    await inputs.nth(2).fill("2");
    await inputs.nth(3).fill("60");
    await inputs.nth(4).fill("10000");
    await page.click("button:has-text('Continue')");
    await page.click("button:has-text('Continue')");
    await expect(page.getByRole("heading", { name: "Review your requirement" })).toBeVisible();

    // Say the word: no manual submit click
    await page.getByRole("button", { name: "Start voice assistant" }).click();
    await expect(page.getByText("Your requirement is in!")).toBeVisible({ timeout: 30000 });
    await expect(page.getByText("req_voice_submit_001")).toBeVisible();
  });
});
