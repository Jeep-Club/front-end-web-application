import { readLocalUrl } from "../../../config/local-urls.cjs";
import { auditAccessibility } from "../accessibility";
import { test } from "../fixtures";

const storybookUrl = readLocalUrl("PLAYWRIGHT_STORYBOOK_URL");
for (const id of [
  "componentes-input-input--padrao",
  "componentes-input-input--gray",
  "componentes-input-input--com-erro",
  "componentes-input-inputpassword--com-requisitos",
  "componentes-input-inputdate--padrao",
  "componentes-input-checkbox-e-radio--registrados",
  "componentes-input-inputsearch--padrao",
  "componentes-input-inputfile--vazio",
]) {
  test(`Inputs acessíveis: ${id}`, async ({ page }, testInfo) => {
    await page.goto(new URL(`/iframe.html?id=${id}&viewMode=story&embed=true`, storybookUrl).href);
    await page.locator("#storybook-root").waitFor();
    await auditAccessibility(page, testInfo, "inicial");
  });
}
