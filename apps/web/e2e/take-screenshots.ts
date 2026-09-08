import { chromium } from "@playwright/test";

const DIR = "/home/shawmein/Downloads";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto("http://localhost:3000");
  await page.waitForSelector("text=What are you planning?");

  await page.screenshot({ path: `${DIR}/01-step1-empty.png`, fullPage: true });
  console.log("Captured: 01-step1-empty.png");

  await page.fill("#eventName", "Concert karan aujla");
  await page.selectOption("#eventType", { label: "Corporate Event" });
  await page.fill("#startDate", "2026-09-10");
  await page.fill("#endDate", "2026-09-18");
  await page.fill("#location", "Hyderabad");
  await page.getByText("Performer", { exact: true }).click();

  await page.screenshot({ path: `${DIR}/02-step1-filled.png`, fullPage: true });
  console.log("Captured: 02-step1-filled.png");

  await page.click("button:has-text('Continue')");
  await page.waitForSelector("text=What do you need for the performance?");

  await page.screenshot({ path: `${DIR}/03-step2-requirements.png`, fullPage: true });
  console.log("Captured: 03-step2-requirements.png");

  const step2Inputs = page.locator("input[placeholder]");
  await step2Inputs.nth(0).fill("Live Band");
  await step2Inputs.nth(1).fill("Indie / Pop");
  await step2Inputs.nth(2).fill("5");
  await step2Inputs.nth(3).fill("90");
  await step2Inputs.nth(4).fill("75000");
  await page.click("button:has-text('Continue')");

  await page.waitForSelector("text=Technical requirements and portfolio");
  await page.screenshot({ path: `${DIR}/04-step3-details.png`, fullPage: true });
  console.log("Captured: 04-step3-details.png");

  await page.locator("textarea").fill("PA system + monitors");
  await page.locator("input[type='url']").fill("https://example.com/portfolio");
  await page.click("button:has-text('Continue')");

  await page.waitForSelector("text=Review your requirement");
  await page.screenshot({ path: `${DIR}/05-step4-review.png`, fullPage: true });
  console.log("Captured: 05-step4-review.png");

  await browser.close();
  console.log("All screenshots saved to:", DIR);
}

main().catch((err) => { console.error(err); process.exit(1); });
