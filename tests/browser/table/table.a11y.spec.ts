import { test, expect } from "../fixtures";
import { auditAccessibility } from "../accessibility";

test("Table: acessibilidade da composição e estados interativos", async ({ page }, testInfo) => {
  await page.goto("http://127.0.0.1:6106/iframe.html?id=componentes-table--composicao-completa&viewMode=story&embed=true");
  await expect(page.getByRole("heading", { name: "Gestão de membros" })).toBeVisible();
  await auditAccessibility(page, testInfo, "table-initial");

  if (page.viewportSize()!.width < 1024) {
    const row = page.getByRole("button", { name: /Nome João Passos/ });
    await row.focus();
    await row.press("Enter");
    await expect(row).toHaveAttribute("aria-expanded", "true");
  } else {
    await page.getByRole("combobox", { name: "Filtrar por status" }).selectOption("Inativo");
    await expect(page.getByRole("button", { name: "Limpar filtros" })).toBeVisible();
  }
  await auditAccessibility(page, testInfo, "table-interactive");

  await page.getByRole("searchbox", { name: "Buscar membros" }).fill("sem-correspondencia");
  await expect(page.getByText("Nenhum membro corresponde à busca ou aos filtros.", { exact: true })).toBeVisible();
  await auditAccessibility(page, testInfo, "table-empty");
});
