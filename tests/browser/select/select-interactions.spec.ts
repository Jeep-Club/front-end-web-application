import { readLocalUrl } from "../../../config/local-urls.cjs";
import { expect, test } from "../fixtures";

const storybookUrl = readLocalUrl("PLAYWRIGHT_STORYBOOK_URL");

function storyUrl(id: string) {
    return new URL(`/iframe.html?id=${id}&viewMode=story&embed=true`, storybookUrl).href;
}

test.describe("Select", () => {
    test('preserva label JSX, portais no dialog e valores do formulário', async ({ page }) => {
        await page.goto(storyUrl('componentes-select--dentro-de-dialog'));
        await page.getByRole('button', { name: 'Abrir formulário' }).click();
        const dialog = page.getByRole('dialog', { name: 'Formulário de categorias', exact: true });
        const category = dialog.getByRole('combobox', { name: 'Categoria' });
        await category.click();
        await dialog.getByRole('option', { name: 'Trilhas', exact: true }).click();
        await expect(category.locator('strong')).toHaveText('Trilhas');
        await dialog.getByRole('combobox', { name: 'Interesses' }).click();
        await dialog.getByRole('searchbox', { name: 'Pesquisar Interesses' }).fill('eventos');
        await dialog.getByRole('option', { name: 'Eventos', exact: true }).click();
        await page.keyboard.press('Escape');
        await dialog.getByRole('button', { name: 'Enviar exemplo' }).click();
        await expect(dialog.getByRole('status', { name: 'Valores enviados' })).toHaveText('trilhas / eventos');
        await dialog.getByRole('button', { name: 'Fechar formulário' }).click();
        await expect(dialog).not.toBeVisible();
    });
    test("busca navega por teclado pulando opções desabilitadas", async ({ page }) => {
        await page.goto(storyUrl("componentes-select--com-opcoes-desabilitadas"));
        const trigger = page.getByRole("combobox").first();
        await trigger.click();
        await expect(page.getByRole("option", { name: "Indisponível no início" })).toHaveCSS("opacity", "0.5");
        await page.getByRole("searchbox").press("ArrowDown");
        await expect(page.getByRole("option", { name: "Trilhas", exact: true })).toBeFocused();
        await page.keyboard.press("ArrowDown");
        await expect(page.getByRole("option", { name: "Eventos", exact: true })).toBeFocused();
        await page.keyboard.press("Home");
        await expect(page.getByRole("option", { name: "Trilhas", exact: true })).toBeFocused();
        await page.keyboard.press("End");
        await expect(page.getByRole("option", { name: "Eventos", exact: true })).toBeFocused();
        await page.keyboard.press("Enter");
        await expect(page.getByRole("option", { name: "Eventos", exact: true })).toHaveAttribute("aria-selected", "true");
        await page.keyboard.press("Escape");
        await expect(trigger).toBeFocused();
    });
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
