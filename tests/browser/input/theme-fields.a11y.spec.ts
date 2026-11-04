import { readLocalUrl } from "../../../config/local-urls.cjs";
import { auditAccessibility } from "../accessibility";
import { expect, test } from "../fixtures";

const storybookUrl = readLocalUrl("PLAYWRIGHT_STORYBOOK_URL");

for (const theme of ["light", "dark"]) {
  test(`Erro, ajuda e contraste dos campos no tema ${theme}`, async ({ page }, testInfo) => {
    for (const { id, args } of [
      { id: "componentes-input-input--id-e-ajuda", args: "" },
      { id: "componentes-textarea--com-erro-e-ajuda", args: "" },
      { id: "componentes-input-inputfile--vazio", args: "variant:gray" },
    ]) {
      await page.goto(new URL(`/iframe.html?id=${id}&embed=true&globals=theme:${theme}&args=${args}`, storybookUrl).href);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await auditAccessibility(page, testInfo, `${id}-${theme}`);
    }
  });
}
