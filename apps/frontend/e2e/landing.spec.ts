import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("renders hero section with heading and CTA", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "CFB Digitale Passstelle" })
    ).toBeVisible();
    await expect(
      page.getByText("Spielerpass-Anträge des CfB Ford Niehl e.V.")
    ).toBeVisible();
  });

  test("shows feature cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Schnell")).toBeVisible();
    await expect(page.getByText("Sicher")).toBeVisible();
    await expect(page.getByText("Transparent")).toBeVisible();
  });

  test("CTA link navigates to /register", async ({ page }) => {
    await page.goto("/");
    const cta = page.getByRole("link", {
      name: "Jetzt Spielerpass beantragen",
    });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/register");
  });

  test("shows footer", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText("CfB Ford Niehl e.V. •")
    ).toBeVisible();
  });
});
