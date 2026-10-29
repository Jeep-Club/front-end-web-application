import { readLocalUrl } from "../../../config/local-urls.cjs";
import { expect, test } from "../fixtures";

const storybookUrl = readLocalUrl("PLAYWRIGHT_STORYBOOK_URL");

test("Input preserva ID externo, ajuda e erro associados", async ({ page }) => {
  await page.goto(new URL("/iframe.html?id=componentes-input-input--id-e-ajuda&embed=true", storybookUrl).href);
  const input = page.getByRole("textbox", { name: "Nome" });
  await expect(input).toHaveAttribute("id", "member-name");
  await expect(input).toHaveAccessibleDescription("Use o nome completo. Informe o nome.");
  await page.getByText("Nome", { exact: true }).click();
  await expect(input).toBeFocused();
});

test("Textarea associa ajuda e erro por IDs válidos", async ({ page }) => {
  await page.goto(new URL("/iframe.html?id=componentes-textarea--com-erro-e-ajuda&embed=true", storybookUrl).href);
  const input = page.getByRole("textbox", { name: "Observações" });
  await expect(input).toHaveAttribute("id", "notes");
  await expect(input).toHaveAccessibleDescription("Não inclua dados sensíveis. Descreva o motivo.");
  await expect(input).toHaveAttribute("aria-invalid", "true");
});

test("Radio mantém indicador visual de seleção coerente com o valor nativo", async ({ page }) => {
  await page.goto(new URL("/iframe.html?id=componentes-input-checkbox-e-radio--radio-isolado&embed=true", storybookUrl).href);
  const selected = page.getByRole("radio", { name: "E-mail", exact: true });
  await expect(selected).toBeChecked();
  // A opacidade é parte do requisito visual; o estado nativo sozinho não prova o indicador.
  await expect(selected.locator("..").locator("span span")).toHaveCSS("opacity", "1");
  await selected.press("ArrowRight");
  await expect(page.getByRole("radio", { name: "Telefone", exact: true })).toBeChecked();
  await expect(selected.locator("..").locator("span span")).toHaveCSS("opacity", "0");
});
