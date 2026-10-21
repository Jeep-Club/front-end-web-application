import { test as base, expect } from "@playwright/test";

// Both pilots must stay local and must not call Server Actions or backend APIs.
const test = base.extend<{ runtimeChecks: void }>({
  runtimeChecks: [async ({ page }, use) => {
    const errors: string[] = [];
    const forbiddenRequests: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (!["http://127.0.0.1:3100", "http://127.0.0.1:6106"].includes(url.origin)
        || request.method() !== "GET" || url.pathname.startsWith("/api/")) {
        forbiddenRequests.push(`${request.method()} ${url.origin}${url.pathname}`);
        await route.abort();
        return;
      }
      await route.continue();
    });
    await use();
    expect(errors, "Erros de execução no navegador").toEqual([]);
    expect(forbiddenRequests, "Requisições fora do escopo do piloto").toEqual([]);
  }, { auto: true }],
});

test.afterEach(async ({ page }, testInfo) => {
  if (!page.isClosed()) {
    const path = testInfo.outputPath("exploratory.png");
    await page.screenshot({ path, fullPage: true, animations: "disabled" });
    await testInfo.attach("Captura exploratória", { path, contentType: "image/png" });
  }
});

test("Table: busca, filtros, paginação e reflow", async ({ page }) => {
  // Storybook 10.6 embed mode disables autoplay: Playwright owns these interactions.
  await page.goto("http://127.0.0.1:6106/iframe.html?id=componentes-table--composicao-completa&viewMode=story&embed=true");
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
