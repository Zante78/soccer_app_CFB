import { test, expect } from "@playwright/test";
import { UNAUTHENTICATED_STATE } from "./fixtures/test-data";

test.describe("Register Wizard", () => {
  // Wizard is public — no auth required
  test.use({ storageState: UNAUTHENTICATED_STATE });

  test("Step 1: Welcome page renders and starts", async ({ page }) => {
    await page.goto("/register");
    await expect(
      page.getByRole("heading", {
        name: "Willkommen zur digitalen Passstelle",
      })
    ).toBeVisible();
    await expect(page.getByText("CfB Ford Niehl e.V.")).toBeVisible();
    await expect(page.getByText("Demo-Modus")).toBeVisible();

    // Start registration
    await page
      .getByRole("button", { name: "Registrierung starten" })
      .click();

    // Should advance to Step 2
    await expect(
      page.getByRole("heading", { name: "Spielerauswahl" })
    ).toBeVisible();
  });

  test("Step 2: Player selection and navigation", async ({ page }) => {
    await page.goto("/register");
    await page
      .getByRole("button", { name: "Registrierung starten" })
      .click();
    await expect(
      page.getByRole("heading", { name: "Spielerauswahl" })
    ).toBeVisible();

    // "Weiter" should be disabled without selection
    const weiterBtn = page.getByRole("button", { name: "Weiter" });
    await expect(weiterBtn).toBeDisabled();

    // Select "Neuer Spieler"
    await page.getByText("Neuer Spieler").click();
    await expect(weiterBtn).toBeEnabled();

    // Go back
    await page.getByRole("button", { name: "Zurück" }).click();
    await expect(
      page.getByRole("heading", {
        name: "Willkommen zur digitalen Passstelle",
      })
    ).toBeVisible();
  });

  test("Step 3: Player data form with validation", async ({ page }) => {
    // Navigate to Step 3
    await page.goto("/register");
    await page
      .getByRole("button", { name: "Registrierung starten" })
      .click();
    await page.getByText("Neuer Spieler").click();
    await page.getByRole("button", { name: "Weiter" }).click();

    // Step 3 heading
    await expect(
      page.getByRole("heading", { name: "Spielerdaten" })
    ).toBeVisible();

    // Submit empty form → validation errors
    await page.getByRole("button", { name: "Weiter" }).click();
    await expect(
      page.getByText("Vorname muss mindestens 2 Zeichen lang sein")
    ).toBeVisible();

    // Fill valid data
    await page.getByLabel("Vorname").fill("Test");
    await page.getByLabel("Nachname").fill("Spieler");
    await page.locator("#birth_date").fill("2010-05-15");
    await page.getByLabel("Mannschaft").selectOption({ label: "U11" });

    // Nationality field should exist (placeholder is "Deutschland")
    await expect(page.getByLabel("Nationalität")).toBeVisible();
  });

  test("Step 3: Validation clears on valid input", async ({ page }) => {
    await page.goto("/register");
    await page
      .getByRole("button", { name: "Registrierung starten" })
      .click();
    await page.getByText("Neuer Spieler").click();
    await page.getByRole("button", { name: "Weiter" }).click();

    // Trigger validation
    await page.getByRole("button", { name: "Weiter" }).click();
    await expect(
      page.getByText("Vorname muss mindestens 2 Zeichen lang sein")
    ).toBeVisible();

    // Fill first name — error should disappear
    await page.getByLabel("Vorname").fill("Valid");
    await expect(
      page.getByText("Vorname muss mindestens 2 Zeichen lang sein")
    ).toBeHidden();
  });
});
