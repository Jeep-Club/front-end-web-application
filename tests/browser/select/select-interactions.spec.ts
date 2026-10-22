import { readLocalUrl } from "../../../config/local-urls.cjs";
import { expect, test } from "../fixtures";

const storybookUrl = readLocalUrl("PLAYWRIGHT_STORYBOOK_URL");

function storyUrl(id: string) {
    return new URL(`/iframe.html?id=${id}&viewMode=story&embed=true`, storybookUrl).href;
}

test.describe("Select", () => {
    test("abre a seleção simples, permite escolher por teclado e fecha devolvendo o foco", async ({ page }) => {
        await page.goto(storyUrl("componentes-select--padrao"));

        const trigger = page.getByRole("combobox", { name: "Categoria" });
        await expect(trigger).toHaveCSS("cursor", "pointer");
        await trigger.focus();
        await page.keyboard.press("Enter");
        await expect(page.getByRole("option", { name: "Trilhas" })).toBeVisible();
        await page.keyboard.press("Home");
        await page.keyboard.press("Enter");

        await expect(trigger).toContainText("Trilhas");
        await expect(trigger).toBeFocused();
    });

    test("filtra localmente e alterna opções na seleção múltipla", async ({ page }) => {
        await page.goto(storyUrl("componentes-select--multiplas-com-busca"));

        const trigger = page.getByRole("combobox").first();
        await trigger.click();
        const search = page.getByRole("searchbox", { name: "Pesquisar Categoria" });
        await search.fill("passeio");

        const option = page.getByRole("option", { name: "Passeios familiares" });
        await expect(option).toBeVisible();
        await expect(page.getByRole("option", { name: "Trilhas" })).toBeHidden();
        await option.click();
        await expect(option).toHaveAttribute("aria-selected", "true");
        await option.click();
        await expect(option).toHaveAttribute("aria-selected", "false");
    });

    test("informa quando a busca não encontra opções", async ({ page }) => {
        await page.goto(storyUrl("componentes-select--sem-resultados"));

        await page.getByRole("combobox", { name: "Categoria" }).click();
        await page.getByRole("searchbox", { name: "Pesquisar Categoria" }).fill("xyz");
        await expect(page.getByRole("status")).toHaveText("Nenhuma opção encontrada.");
    });

    test("apresenta a versão White com check sem sobrepor o texto", async ({ page }) => {
        await page.goto(storyUrl("componentes-select--white"));

        const trigger = page.getByRole("combobox", { name: "Categoria" });
        await trigger.press("Enter");
        const selectedOption = page.getByRole("option", { name: "Eventos" });
        await expect(selectedOption).toBeVisible();
        await page.keyboard.press("ArrowDown");
        await expect(selectedOption).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
        const checkBox = await selectedOption.locator("svg").boundingBox();
        const textBox = await selectedOption.getByText("Eventos", { exact: true }).boundingBox();
        if (!checkBox || !textBox) throw new Error("O check e o texto selecionados devem estar visíveis.");
        expect(checkBox.x + checkBox.width).toBeLessThanOrEqual(textBox.x);
    });
});
