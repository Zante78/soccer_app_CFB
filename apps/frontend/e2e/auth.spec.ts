import { test, expect } from "@playwright/test";
import { TEST_ADMIN, UNAUTHENTICATED_STATE } from "./fixtures/test-data";

test.describe("Authentication", () => {
  test.use({ storageState: UNAUTHENTICATED_STATE });

  test("login with valid credentials redirects to dashboard", async ({
    page,
  }) => {
    await page.goto("/sign-in");
    await page.getByLabel("E-Mail").fill(TEST_ADMIN.email);
    await page.getByLabel("Passwort").fill(TEST_ADMIN.password);
    await page.getByRole("button", { name: "Anmelden" }).click();
    await page.waitForURL("**/dashboard");
    await expect(
      page.getByRole("heading", { name: "Dashboard" })
    ).toBeVisible();
  });

  test("login with wrong password shows error", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByLabel("E-Mail").fill(TEST_ADMIN.email);
    await page.getByLabel("Passwort").fill("WrongPassword123!");
    await page.getByRole("button", { name: "Anmelden" }).click();
    // Error message appears in a red div
    await expect(page.locator(".bg-red-50")).toBeVisible();
  });

  test("sign-in page renders form elements", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(
      page.getByRole("heading", { name: "CFB Digitale Passstelle" })
    ).toBeVisible();
    await expect(page.getByLabel("E-Mail")).toBeVisible();
    await expect(page.getByLabel("Passwort")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Anmelden" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Registrieren" })
    ).toBeVisible();
  });
});
