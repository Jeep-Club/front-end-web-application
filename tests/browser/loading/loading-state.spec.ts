import { test, expect } from "../fixtures";
import { readLocalUrl } from "../../../config/local-urls.cjs";

test.use({ baseURL: readLocalUrl("PLAYWRIGHT_STORYBOOK_URL").origin });

test("Loading: apresenta o estado e respeita movimento reduzido", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/iframe.html?id=componentes-loading--carregando&viewMode=story&embed=true");

  const status = page.getByRole("status");
  await expect(status).toHaveText("Carregando...");
  const spinner = status.locator("svg");
  const animationDuration = await spinner.evaluate((element) => parseFloat(getComputedStyle(element).animationDuration));
  expect(animationDuration).toBeLessThan(0.001);
});
