import { readLocalUrl } from "../../../config/local-urls.cjs";
import { expect, test } from "../fixtures";

const storybookUrl = readLocalUrl("PLAYWRIGHT_STORYBOOK_URL");

test("Temas do Storybook e dos componentes são independentes e podem acompanhar um ao outro", async ({ page }) => {
  await page.goto(new URL("/?path=/story/componentes-input-input--padrao", storybookUrl).href);
  const preview = page.frameLocator("#storybook-preview-iframe");
  const input = preview.getByRole("textbox", { name: "Nome" });
  const storybookTheme = page.getByRole("button", { name: "Tema do Storybook" });
  const componentTheme = page.getByRole("button", { name: "Tema dos componentes" });

  await expect(input).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await storybookTheme.click();
  await page.getByRole("option", { name: "Escuro", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-storybook-theme", "dark");
  await expect(input).toHaveCSS("background-color", "rgb(255, 255, 255)");

  await componentTheme.click();
  await page.getByRole("option", { name: "Storybook", exact: true }).click();
  await expect(input).toHaveCSS("background-color", "rgb(17, 28, 46)");
  await storybookTheme.click();
  await page.getByRole("option", { name: "Claro", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-storybook-theme", "light");
  await expect(input).toHaveCSS("background-color", "rgb(255, 255, 255)");

  await componentTheme.click();
  await page.getByRole("option", { name: "Escuro", exact: true }).click();
  await expect(input).toHaveCSS("background-color", "rgb(17, 28, 46)");
  await expect(page.locator("html")).toHaveAttribute("data-storybook-theme", "light");

  await page.emulateMedia({ colorScheme: "dark" });
  await storybookTheme.click();
  await page.getByRole("option", { name: "Sistema", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-storybook-theme", "dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-storybook-theme", "light");
  await expect(input).toHaveCSS("background-color", "rgb(17, 28, 46)");
});

test("Documentação acompanha o Storybook e mantém o tema explícito dos exemplos", async ({ page }) => {
  await page.goto(new URL("/?path=/docs/componentes-input-input--docs", storybookUrl).href);
  const preview = page.frameLocator("#storybook-preview-iframe");
  const docs = preview.locator(".sbdocs-wrapper");
  await expect(docs).toBeVisible();
  const lightBackground = await docs.evaluate((element) => getComputedStyle(element).backgroundColor);
  await page.getByRole("button", { name: "Tema do Storybook" }).click();
  await page.getByRole("option", { name: "Escuro", exact: true }).click();
  await expect(docs).not.toHaveCSS("background-color", lightBackground);
  const input = preview.getByRole("textbox", { name: "Nome", exact: true }).first();
  const canvas = preview.locator(".docs-story").filter({ has: input }).first();
  await expect(canvas).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(input).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await page.getByRole("button", { name: "Tema dos componentes" }).click();
  await page.getByRole("option", { name: "Storybook", exact: true }).click();
  await expect(input).toHaveCSS("background-color", "rgb(17, 28, 46)");
  await expect(canvas).toHaveCSS("background-color", "rgb(11, 18, 32)");
  await page.reload();
  await expect(docs).not.toHaveCSS("background-color", lightBackground);
  await expect(input).toHaveCSS("background-color", "rgb(17, 28, 46)");
  await expect(canvas).toHaveCSS("background-color", "rgb(11, 18, 32)");
});

