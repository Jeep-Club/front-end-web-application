import { readLocalUrl } from "../../../config/local-urls.cjs";
import { auditAccessibility } from "../accessibility";
import { expect, test } from "../fixtures";

const storybookUrl = readLocalUrl("PLAYWRIGHT_STORYBOOK_URL");

function storyUrl(id: string, theme: string) {
    return new URL(`/iframe.html?id=${id}&viewMode=story&embed=true&globals=theme:${theme}`, storybookUrl).href;
}

for (const theme of ["light", "dark"]) {
test.describe(`Select accessibility ${theme}`, () => {
    test("mantém nome, foco e estados acessíveis fechado e aberto", async ({ page }, testInfo) => {
        await page.goto(storyUrl("componentes-select--multiplas-com-busca", theme));
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await auditAccessibility(page, testInfo, "fechado");

        const trigger = page.getByRole("combobox").first();
        await trigger.focus();
        await expect(trigger).toHaveAttribute("aria-expanded", "false");
        await trigger.press("Enter");
        await expect(page.getByRole("listbox", { name: "Categoria" })).toBeVisible();
        await auditAccessibility(page, testInfo, "aberto");
    });

    test("mantém contraste na versão White", async ({ page }, testInfo) => {
        await page.goto(storyUrl("componentes-select--white", theme));
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await auditAccessibility(page, testInfo, "white-fechado");
        await page.getByRole("combobox", { name: "Categoria" }).click();
        await expect(page.getByRole("option", { name: "Eventos", exact: true })).toBeFocused();
        await auditAccessibility(page, testInfo, "simples-aberto");
        await page.keyboard.press("Escape");
        await expect(page.getByRole("combobox", { name: "Categoria" })).toBeFocused();
    });
});
}
