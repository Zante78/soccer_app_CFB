import { test, expect } from "@playwright/test";
import { UNAUTHENTICATED_STATE } from "./fixtures/test-data";

test.describe("Route Protection (unauthenticated)", () => {
  test.use({ storageState: UNAUTHENTICATED_STATE });

  test("unauthenticated user on /dashboard is redirected to /sign-in", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/sign-in");
    await expect(page.getByLabel("E-Mail")).toBeVisible();
  });

  test("unauthenticated user on /registrations is redirected to /sign-in", async ({
    page,
  }) => {
    await page.goto("/registrations");
    await page.waitForURL("**/sign-in");
  });

  test("unauthenticated user on /rpa-traces is redirected to /sign-in", async ({
    page,
  }) => {
    await page.goto("/rpa-traces");
    await page.waitForURL("**/sign-in");
  });
});

test.describe("Route Protection (authenticated)", () => {
  // Uses default storageState (admin session from global-setup)

  test("authenticated user on /sign-in is redirected to /dashboard", async ({
    page,
  }) => {
    await page.goto("/sign-in");
    await page.waitForURL("**/dashboard");
    await expect(
      page.getByRole("heading", { name: "Dashboard" })
    ).toBeVisible();
  });
});
