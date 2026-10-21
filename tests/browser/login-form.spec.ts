import { test, expect } from "./fixtures";

test("Login: campos, teclado e validação sem autenticação", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "LOGIN", exact: true })).toBeVisible();
  const cpf = page.getByRole("textbox", { name: /^CPF/ });
  const password = page.getByLabel(/^Senha/);
  const submit = page.getByRole("button", { name: "Entrar", exact: true });
  await expect(cpf).toBeInViewport();
  await expect(password).toBeVisible();
  await expect(submit).toBeInViewport();
  await cpf.fill("00000000000");
  await expect(cpf).toHaveValue("000.000.000-00");
  await cpf.press("Tab");
  await expect(password).toBeFocused();
  await expect(password).toHaveCSS("outline-style", "solid");
  await expect(password).toHaveCSS("outline-width", "2px");
  await password.fill("senha-piloto");
  await password.press("Tab");
  const showPassword = page.getByRole("button", { name: "Mostrar senha", exact: true });
  await expect(showPassword).toBeFocused();
  await showPassword.press("Space");
  await expect(password).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Ocultar senha", exact: true }).press("Space");
  await expect(password).toHaveAttribute("type", "password");
  await page.keyboard.press("Tab");
  await expect(submit).toBeFocused();
  // Invalid CPF exercises the real Zod/RHF validation and must never call loginAction.
  await submit.press("Enter");
  await expect(cpf).toHaveAttribute("aria-invalid", "true");
  await expect(cpf).toHaveAccessibleDescription("O CPF é inválido");
  await expect(page).toHaveURL(/\/login$/);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
