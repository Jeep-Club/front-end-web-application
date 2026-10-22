import { readLocalUrl } from "../../../config/local-urls.cjs";
import { auditAccessibility } from "../accessibility";
import { expect, test } from "../fixtures";

const storybookUrl = readLocalUrl("PLAYWRIGHT_STORYBOOK_URL");

function storyUrl(id: string) {
    return new URL(`/iframe.html?id=${id}&viewMode=story&embed=true`, storybookUrl).href;
}

test.describe("Select accessibility", () => {
    test("mantém nome, foco e estados acessíveis fechado e aberto", async ({ page }, testInfo) => {
        await page.goto(storyUrl("componentes-select--multiplas-com-busca"));
        await auditAccessibility(page, testInfo, "fechado");

        const trigger = page.getByRole("combobox").first();
        await trigger.focus();
        await expect(trigger).toHaveAttribute("aria-expanded", "false");
        await trigger.press("Enter");
        await expect(page.getByRole("listbox", { name: "Categoria" })).toBeVisible();
        await auditAccessibility(page, testInfo, "aberto");
    });

    test("mantém contraste na versão White", async ({ page }, testInfo) => {
        await page.goto(storyUrl("componentes-select--white"));
        await auditAccessibility(page, testInfo, "white-fechado");
    });
});
