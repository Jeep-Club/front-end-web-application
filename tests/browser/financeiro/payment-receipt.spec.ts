import { test, expect } from "../fixtures";
import { readLocalUrl } from "../../../config/local-urls.cjs";

const storyIds = {
    send: "páginas-financeiro-envio-de-comprovante--enviar",
    expired: "páginas-financeiro-envio-de-comprovante--expirada",
    canceled: "páginas-financeiro-envio-de-comprovante--cancelada",
    error: "páginas-financeiro-envio-de-comprovante--erro-de-envio",
};

function storyUrl(id: string, theme = "light") {
    const url = new URL("/iframe.html", readLocalUrl("PLAYWRIGHT_STORYBOOK_URL"));
    url.search = new URLSearchParams({ id, viewMode: "story", embed: "true", globals: `theme:${theme}` }).toString();
    return url.href;
}

const receipt = { name: "comprovante.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4\ncomprovante sintético") };

for (const theme of ["light", "dark"]) {
    test(`Comprovante: envio para análise no tema ${theme}`, async ({ page }) => {
        await page.goto(storyUrl(storyIds.send, theme));
        const trigger = page.getByRole("button", { name: "Enviar comprovante", exact: true });
        await expect(trigger).toBeVisible();
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await trigger.focus();
        await trigger.press("Enter");
        await expect(page.getByRole("button", { name: "Fechar envio", exact: true })).toHaveAttribute("aria-expanded", "true");
        await expect(page.getByRole("textbox", { name: "Valor do pagamento (R$)" })).toHaveValue("250,00");
        await page.getByLabel(/^Comprovante/).setInputFiles(receipt);
        await page.getByRole("textbox", { name: "Observações (opcional)" }).fill("Pagamento de teste");
        await page.getByRole("button", { name: "Enviar para análise" }).click();
        await expect(page.getByRole("status")).toContainText("Aguardando validação da gestão");
        await expect(page.getByRole("status")).toContainText("não libera o acesso");
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
}

test("Comprovante: cancelamento restaura foco e formato inválido impede envio", async ({ page }) => {
    await page.goto(storyUrl(storyIds.send));
    const trigger = page.getByRole("button", { name: "Enviar comprovante", exact: true });
    await trigger.click();
    await page.getByLabel(/^Comprovante/).setInputFiles({ name: "recibo.txt", mimeType: "text/plain", buffer: Buffer.from("inválido") });
    await expect(page.getByLabel(/^Comprovante/)).toHaveAccessibleDescription(/Envie um comprovante em PDF/);
    await expect(page.getByRole("button", { name: "Enviar para análise" })).toBeDisabled();
    await page.getByRole("button", { name: "Cancelar", exact: true }).click();
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("Comprovante: falha preserva dados para tentar novamente", async ({ page }) => {
    await page.goto(storyUrl(storyIds.error));
    await page.getByRole("button", { name: "Enviar comprovante", exact: true }).click();
    await page.getByLabel(/^Comprovante/).setInputFiles(receipt);
    const notes = page.getByRole("textbox", { name: "Observações (opcional)" });
    await notes.fill("Manter observação");
    await page.getByRole("button", { name: "Enviar para análise" }).click();
    await expect(page.getByRole("alert")).toContainText("Tente novamente");
    await expect(notes).toHaveValue("Manter observação");
    await expect(page.getByRole("button", { name: "Enviar para análise" })).toBeEnabled();
});

test("Comprovante: cobranças expiradas e canceladas explicam a indisponibilidade", async ({ page }) => {
    for (const id of [storyIds.expired, storyIds.canceled]) {
        await page.goto(storyUrl(id));
        const trigger = page.getByRole("button", { name: "Enviar comprovante", exact: true });
        await expect(trigger).toBeDisabled();
        await expect(trigger).toHaveAccessibleDescription(id === storyIds.expired ? /prazo de envio expirou/ : /cancelada não aceita/);
    }
});
