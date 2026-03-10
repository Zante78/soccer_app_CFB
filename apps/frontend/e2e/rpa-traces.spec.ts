import { test, expect } from "@playwright/test";

test.describe("RPA Traces Page", () => {
  test("page loads with heading", async ({ page }) => {
    await page.goto("/rpa-traces");
    await expect(
      page.getByRole("heading", { name: "RPA Visual Regression" })
    ).toBeVisible();
    await expect(
      page.getByText("Screenshot-Vergleich von Bot-Ausführungen").or(
        page.getByText(/Screenshot-Unterschied/)
      )
    ).toBeVisible();
  });

  test("shows either traces or success message", async ({ page }) => {
    await page.goto("/rpa-traces");
    // Wait for loading to finish
    await expect(
      page.getByRole("heading", { name: "RPA Visual Regression" })
    ).toBeVisible();

    // Either "Keine Visual Regression Errors" or trace cards
    await expect(
      page
        .getByText("Keine Visual Regression Errors")
        .or(page.getByText("Neue Baseline akzeptieren"))
    ).toBeVisible({ timeout: 15000 });
  });
});
