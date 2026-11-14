import { test, expect } from "../fixtures";
import { auditAccessibility } from "../accessibility";
import { readLocalUrl } from "../../../config/local-urls.cjs";

for (const theme of ["light", "dark"]) {
    test(`Comprovante: formulário acessível no tema ${theme}`, async ({ page }, testInfo) => {
        const url = new URL("/iframe.html", readLocalUrl("PLAYWRIGHT_STORYBOOK_URL"));
        url.search = new URLSearchParams({ id: "páginas-financeiro-envio-de-comprovante--enviar", viewMode: "story", embed: "true", globals: `theme:${theme}` }).toString();
        await page.goto(url.href);
        const trigger = page.getByRole("button", { name: "Enviar comprovante", exact: true });
        await expect(trigger).toBeVisible();
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await trigger.click();
        await auditAccessibility(page, testInfo, "formulario");
        await page.getByLabel(/^Comprovante/).setInputFiles({ name: "invalido.txt", mimeType: "text/plain", buffer: Buffer.from("invalid") });
        await expect(page.getByLabel(/^Comprovante/)).toHaveAccessibleDescription(/Envie um comprovante em PDF/);
        await auditAccessibility(page, testInfo, "arquivo-invalido");
    });
}
