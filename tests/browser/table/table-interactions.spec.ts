import { test, expect } from "../fixtures";
import { readLocalUrl } from "../../../config/local-urls.cjs";

test.use({ baseURL: readLocalUrl("PLAYWRIGHT_STORYBOOK_URL").origin });

test("Table: busca, filtros, paginação e reflow", async ({ page }) => {
  // Storybook 10.6 embed mode disables autoplay: Playwright owns these interactions.
  await page.goto("/iframe.html?id=componentes-table--composicao-completa&viewMode=story&embed=true");
  await expect(page.getByRole("heading", { name: "Gestão de membros" })).toBeVisible();
  await expect(page.getByLabel("Página 1 de 2", { exact: true })).toBeVisible();

  const search = page.getByRole("searchbox", { name: "Buscar membros" });
  await expect(search).toBeInViewport();
  await search.fill("Ana");
  await expect(page.getByText("Ana Souza", { exact: true }).filter({ visible: true })).toBeVisible();
  await expect(page.getByText("João Passos", { exact: true }).filter({ visible: true })).toHaveCount(0);
  await search.press("Tab");
  const clear = page.getByRole("button", { name: "Limpar busca" });
  await expect(clear).toBeFocused();
  await clear.press("Enter");
  await expect(search).toHaveValue("");

  await page.getByRole("combobox", { name: "Filtrar por status" }).selectOption("Inativo");
  await expect(page.getByText("Marcos Rocha", { exact: true }).filter({ visible: true })).toBeVisible();
  await expect(page.getByText("Ana Souza", { exact: true }).filter({ visible: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Limpar filtros" }).click();

  if (page.viewportSize()!.width < 1024) {
    await expect(page.getByRole("table")).toHaveCount(0);
    const row = page.getByRole("button", { name: /Nome João Passos/ });
    await row.focus();
    await row.press("Enter");
    await expect(row).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByText("Presidente", { exact: true }).filter({ visible: true })).toBeVisible();
    await row.press("Space");
    await expect(row).toHaveAttribute("aria-expanded", "false");
  } else {
    await expect(page.getByRole("table")).toBeVisible();
    await page.getByRole("button", { name: "Não ordenado por Nome, clique para ordenar", exact: true }).click();
    await expect(page.getByRole("table").getByRole("row").nth(1)).toContainText("Ana Souza");
  }
  await page.getByRole("button", { name: "Próxima página", exact: true }).click();
  await expect(page.getByLabel("Página 2 de 2", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Próxima página", exact: true })).toBeDisabled();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
