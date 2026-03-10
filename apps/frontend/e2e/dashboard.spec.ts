import { test, expect } from "@playwright/test";
import { TEST_ADMIN } from "./fixtures/test-data";

test.describe("Dashboard", () => {
  test("loads with welcome message and heading", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(
      page.getByRole("heading", { name: "Dashboard" })
    ).toBeVisible();
    // Welcome message shows either fullName or email
    await expect(page.getByText(/Willkommen zurück,/)).toBeVisible();
  });

  test("displays metric cards", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Gesamt Registrierungen")).toBeVisible();
    await expect(page.getByText("Zahlungen")).toBeVisible();
    await expect(page.getByText("Bot Erfolgsrate")).toBeVisible();
    await expect(page.getByText("Bereit für Bot")).toBeVisible();
  });

  test("sidebar shows navigation items", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(
      page.getByRole("link", { name: "Dashboard" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Registrierungen" })
    ).toBeVisible();
  });

  test("sidebar navigation works between pages", async ({ page }) => {
    await page.goto("/dashboard");

    // Navigate to Registrierungen
    await page.getByRole("link", { name: "Registrierungen" }).click();
    await page.waitForURL("**/registrations");
    await expect(
      page.getByRole("heading", { name: "Registrierungen" })
    ).toBeVisible();

    // Navigate back to Dashboard
    await page.getByRole("link", { name: "Dashboard" }).click();
    await page.waitForURL("**/dashboard");
    await expect(
      page.getByRole("heading", { name: "Dashboard" })
    ).toBeVisible();
  });
});
