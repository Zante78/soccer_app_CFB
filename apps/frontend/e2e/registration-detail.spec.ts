import { test, expect } from "@playwright/test";
import { SEED_REGISTRATIONS } from "./fixtures/test-data";

test.describe("Registration Detail", () => {
  test("navigates from list to detail via link", async ({ page }) => {
    await page.goto("/registrations");
    // Wait for page to load
    await expect(
      page.getByRole("heading", { name: "Registrierungen" })
    ).toBeVisible();

    // If there are registrations, click the first "Details ansehen" link
    const detailLinks = page.getByText("Details ansehen");
    const count = await detailLinks.count();
    if (count > 0) {
      await detailLinks.first().click();
      await page.waitForURL("**/registrations/**");
      // Should show back link
      await expect(
        page.getByRole("link", { name: /Zurück zur Übersicht/ })
      ).toBeVisible();
    }
  });

  test("shows 404 for non-existent registration", async ({ page }) => {
    await page.goto("/registrations/00000000-0000-0000-0000-000000000000");
    await expect(
      page.getByText("Registrierung nicht gefunden")
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Zurück zur Übersicht/ })
    ).toBeVisible();
  });

  test("back link returns to registrations list", async ({ page }) => {
    await page.goto("/registrations/00000000-0000-0000-0000-000000000000");
    await expect(
      page.getByText("Registrierung nicht gefunden")
    ).toBeVisible();

    await page.getByRole("link", { name: /Zurück zur Übersicht/ }).click();
    await page.waitForURL("**/registrations");
    await expect(
      page.getByRole("heading", { name: "Registrierungen" })
    ).toBeVisible();
  });
});
