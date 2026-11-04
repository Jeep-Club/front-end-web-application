import { test, expect } from "../fixtures";
import { auditAccessibility } from "../accessibility";

test("Login: acessibilidade inicial e mensagens de validação", async ({ page }, testInfo) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "LOGIN", exact: true })).toBeVisible();
  await auditAccessibility(page, testInfo, "login-initial");

  // Empty submission exercises client validation without calling authentication.
  const submit = page.getByRole("button", { name: "Entrar", exact: true });
  await submit.focus();
  await submit.press("Enter");
  await expect(page.getByRole("textbox", { name: /^CPF/ })).toHaveAccessibleDescription("O CPF é obrigatório");
  await expect(page.getByLabel(/^Senha/)).toHaveAccessibleDescription("A senha é obrigatória");
  await auditAccessibility(page, testInfo, "login-validation");
});
