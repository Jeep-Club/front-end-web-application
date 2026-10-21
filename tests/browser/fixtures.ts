import { test as base, expect } from "@playwright/test";

// Both pilots must stay local and must not call Server Actions or backend APIs.
export const test = base.extend<{ runtimeChecks: void }>({
  runtimeChecks: [async ({ page }, use, testInfo) => {
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
