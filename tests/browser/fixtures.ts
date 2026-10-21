import { test as base, expect } from "@playwright/test";
import { readLocalUrl } from "../../config/local-urls.cjs";

/**
 * Base dos testes locais: cada cenário recebe sua própria coleta de erros e requisições proibidas.
 * A fixture automática aceita somente GET nas origens locais do .env, sem rotas /api/.
 * Após o cenário, captura a página se estiver aberta e reprova erros JavaScript ou tráfego proibido.
 * A interceptação cobre a página do navegador; chamadas do servidor Next dependem do isolamento
 * de ambiente em playwright.config.ts. Não representa uma fixture de integração com backend.
 */
export const test = base.extend<{ runtimeChecks: void }>({
  runtimeChecks: [async ({ page }, use, testInfo) => {
    const errors: string[] = [];
    const forbiddenRequests: string[] = [];
    const allowedOrigins = [readLocalUrl("PLAYWRIGHT_APP_URL").origin, readLocalUrl("PLAYWRIGHT_STORYBOOK_URL").origin];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (!allowedOrigins.includes(url.origin)
        || request.method() !== "GET" || url.pathname.startsWith("/api/")) {
        forbiddenRequests.push(`${request.method()} ${url.origin}${url.pathname}`);
        await route.abort();
        return;
      }
      await route.continue();
    });
    // Cede a execução ao cenário; captura e verificações finais ocorrem antes de liberar a página.
    await use();
    if (!page.isClosed()) {
      const path = testInfo.outputPath("exploratory.png");
      await page.screenshot({ path, fullPage: true, animations: "disabled" });
      await testInfo.attach("Captura exploratória", { path, contentType: "image/png" });
    }
    expect(errors, "Erros de execução no navegador").toEqual([]);
    expect(forbiddenRequests, "Requisições fora do escopo do piloto").toEqual([]);
  }, { auto: true }],
});

export { expect };
