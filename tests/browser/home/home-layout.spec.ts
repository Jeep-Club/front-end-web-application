import { test, expect } from "../fixtures";

test("Home: marca à esquerda, ações à direita e sem seção de créditos", async ({ page }) => {
  await page.goto("/");

  const logo = page.getByRole("link", { name: "logo" });
  const help = page.getByRole("button", { name: "Como funciona?" });
  const login = page.getByRole("button", { name: "Entrar" });
  await expect(logo).toBeVisible();
  await expect(help).toBeVisible();
  await expect(login).toBeVisible();
  await expect(page.getByRole("heading", { name: "Créditos", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /entre em contato/i })).toHaveCount(0);

  const [logoBox, helpBox, loginBox] = await Promise.all([logo.boundingBox(), help.boundingBox(), login.boundingBox()]);
  expect(logoBox).not.toBeNull();
  expect(helpBox).not.toBeNull();
  expect(loginBox).not.toBeNull();
  expect(logoBox!.x + logoBox!.width).toBeLessThan(helpBox!.x);
  expect(loginBox!.x).toBeGreaterThan(page.viewportSize()!.width / 2);
});
