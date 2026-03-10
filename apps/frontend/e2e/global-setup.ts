import { test as setup, expect } from "@playwright/test";
import { TEST_ADMIN } from "./fixtures/test-data";

const authFile = "e2e/.auth/admin.json";

setup("authenticate as admin", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("E-Mail").fill(TEST_ADMIN.email);
  await page.getByLabel("Passwort").fill(TEST_ADMIN.password);
  await page.getByRole("button", { name: "Anmelden" }).click();
  await page.waitForURL("**/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await page.context().storageState({ path: authFile });
});
