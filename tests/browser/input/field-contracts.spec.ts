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

for (const story of ["radio-isolado", "registrados"]) {
  for (const [theme, gray] of [["light", "rgb(89, 89, 89)"], ["dark", "rgb(186, 199, 217)"]]) {
    test(`Radio ${story}: ponto cinza no tema ${theme}`, async ({ page }) => {
      await page.goto(new URL(`/iframe.html?id=componentes-input-checkbox-e-radio--${story}&embed=true`, storybookUrl).href);
      const email = page.getByRole("radio", { name: "E-mail", exact: true });
      const phone = page.getByRole("radio", { name: "Telefone", exact: true });
      const indicator = (radio: typeof email) => radio.locator("+ span");
      await expect(email).toBeChecked();
      await page.evaluate((value) => document.documentElement.setAttribute("data-theme", value), theme);
      await expect(indicator(email)).toHaveCSS("border-color", "rgb(236, 191, 13)");
      await expect(indicator(email).locator("span")).toHaveCSS("background-color", gray);
      await expect(indicator(email).locator("span")).toHaveCSS("opacity", "1");
      await email.focus();
      await email.press("ArrowRight");
      await expect(phone).toBeChecked();
      await expect(indicator(phone).locator("span")).toHaveCSS("opacity", "1");
      await expect(indicator(email).locator("span")).toHaveCSS("opacity", "0");
    });
  }
}
