import { readLocalUrl } from "../../../config/local-urls.cjs";
import { expect, test } from "../fixtures";

const storybookUrl = readLocalUrl("PLAYWRIGHT_STORYBOOK_URL");

for (const theme of ["light", "dark"]) {
  test(`Campos seguem data-theme ${theme} sem escolher variantes`, async ({ page }) => {
    for (const id of ["componentes-input-input--padrao", "componentes-textarea--padrao", "componentes-select--padrao"]) {
      await page.goto(new URL(`/iframe.html?id=${id}&embed=true&globals=theme:${theme}`, storybookUrl).href);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      const control = page.locator("#storybook-root").getByRole(id.includes("select") ? "combobox" : "textbox");
      await expect(control).toHaveCSS("background-color", theme === "dark" ? "rgb(17, 28, 46)" : "rgb(255, 255, 255)");
      await expect(control).toHaveCSS("color", theme === "dark" ? "rgb(241, 245, 249)" : "rgb(26, 26, 26)");
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });
}

test("Button mantém cursor de ação e de bloqueio", async ({ page }) => {
  await page.goto(new URL("/iframe.html?id=componentes-button--padrao&embed=true", storybookUrl).href);
  await expect(page.getByRole("button", { name: "Salvar alterações" })).toHaveCSS("cursor", "pointer");
  await page.goto(new URL("/iframe.html?id=componentes-button--desabilitado&embed=true", storybookUrl).href);
  await expect(page.getByRole("button", { name: "Salvar alterações" })).toHaveCSS("cursor", "not-allowed");
});

test("Arquivo preserva a superfície cinza legada nos dois temas", async ({ page }) => {
  for (const theme of ["light", "dark"]) {
    await page.goto(new URL(`/iframe.html?id=componentes-input-inputfile--vazio&embed=true&args=variant:gray&globals=theme:${theme}`, storybookUrl).href);
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await expect(page.getByRole("button", { name: "Anexos", exact: true }))
      .toHaveCSS("background-color", theme === "light" ? "rgb(89, 89, 89)" : "rgb(24, 36, 56)");
  }
});
