import { test, expect } from "@playwright/test";

test.describe("Registrations List", () => {
  test("shows heading and subheading", async ({ page }) => {
    await page.goto("/registrations");
    await expect(
      page.getByRole("heading", { name: "Registrierungen" })
    ).toBeVisible();
    await expect(
      page.getByText("Verwalte alle Spielerpass-Anträge")
    ).toBeVisible();
  });

  test("shows filter bar with search and dropdowns", async ({ page }) => {
    await page.goto("/registrations");
    await expect(
      page.getByPlaceholder("Spielername oder DFB-ID suchen...")
    ).toBeVisible();
    await expect(page.getByText("Alle Status")).toBeVisible();
    await expect(page.getByText("Alle Teams")).toBeVisible();
  });

  test("shows table or empty state", async ({ page }) => {
    await page.goto("/registrations");
    // Wait for loading to finish, then either table data or empty state
    await expect(
      page
        .getByText("Keine Registrierungen gefunden")
        .or(page.getByText("Spieler").first())
    ).toBeVisible({ timeout: 15000 });
  });

  test("search input accepts text", async ({ page }) => {
    await page.goto("/registrations");
    const searchInput = page.getByPlaceholder(
      "Spielername oder DFB-ID suchen..."
    );
    await searchInput.fill("Test");
    await expect(searchInput).toHaveValue("Test");
  });

  test("status dropdown opens with options", async ({ page }) => {
    await page.goto("/registrations");
    await page.getByText("Alle Status").click();
    await expect(page.getByRole("option", { name: "Entwurf" })).toBeVisible();
    await expect(
      page.getByRole("option", { name: "Abgeschlossen" })
    ).toBeVisible();
  });
});
