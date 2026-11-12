import { test, expect } from '../fixtures';
import { readLocalUrl } from '../../../config/local-urls.cjs';
const storybook = readLocalUrl('PLAYWRIGHT_STORYBOOK_URL');
// IDs discovered by `storybook tools stories changed`, not derived from filenames.
for (const theme of ['light', 'dark']) {
    test(`galeria retida usa teclado, ordem e capa em ${theme}`, async ({ page }) => {
        await page.goto(new URL(`/iframe.html?id=publicações-galeria--retidas&viewMode=story&embed=true&globals=theme:${theme}`, storybook).href);
        const list = page.getByRole('grid', { name: 'Imagens da publicação' });
        await expect(list.getByText('Capa', { exact: true })).toBeVisible();
        const handle = page.getByRole('button', { name: 'Reordenar logo_grande.jpg' });
        await handle.focus();
        await expect(handle).toBeFocused();
        await page.keyboard.press('ArrowUp');
        await expect(list.getByRole('row').first()).toContainText('logo_grande.jpg');
        await expect(list.getByRole('row').first()).toContainText('Capa');
        await page.getByRole('button', { name: 'Remover imagem 1', exact: true }).click();
        await expect(list.getByRole('row')).toHaveCount(1);
        await expect(list.getByRole('row').first()).toContainText('Capa');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
    test(`cobranças isoladas preservam ID fora da página em ${theme}`, async ({ page }) => {
        await page.goto(new URL(`/iframe.html?id=publicações-cobranças-de-evento--existente-fora-da-pagina&viewMode=story&embed=true&globals=theme:${theme}`, storybook).href);
        await expect(page.getByRole('combobox', { name: 'Definição de cobrança' })).toContainText('Definição #99');
        await page.getByRole('button', { name: 'Próximo catálogo' }).click();
        await expect(page.getByText('Catálogo: página 2 de 2')).toBeVisible();
        await expect(page.getByRole('combobox', { name: 'Definição de cobrança' })).toContainText('Definição #99');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
}

for (const theme of ['light', 'dark']) {
    test(`estados documentados de galeria, cobrança e dashboard em ${theme}`, async ({ page }, info) => {
        const cases = [
            { id: 'publicações-galeria--erro', text: 'Envie pelo menos uma imagem.' },
            { id: 'publicações-galeria--limite', text: 'Limite de cinco imagens atingido.' },
            { id: 'publicações-galeria--retida-e-nova', text: 'nova.png' },
            { id: 'publicações-galeria--bloqueada', text: 'Galeria de imagens' },
            { id: 'publicações-cobranças-de-evento--inline', text: 'Nome da definição' },
            { id: 'publicações-cobranças-de-evento--bloqueada', text: 'Regras de cobrança' },
            { id: 'publicações-dashboard-de-evento--vazio', text: 'Nenhuma inscrição.' },
            { id: 'publicações-dashboard-de-evento--cancelada-e-validacao', text: 'Participação confirmada indica inscrição confirmada' },
        ];
        for (const example of cases) {
            await page.goto(new URL(`/iframe.html?id=${example.id}&viewMode=story&embed=true&globals=theme:${theme}`, storybook).href);
            await expect(page.getByText(example.text, { exact: false }).first()).toBeVisible();
            if (example.id === 'publicações-galeria--bloqueada') await expect(page.getByRole('button', { name: /Reordenar/ }).first()).toBeDisabled();
            if (example.id === 'publicações-cobranças-de-evento--bloqueada') await expect(page.getByRole('button', { name: 'Adicionar cobrança' })).toBeDisabled();
            expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
            await info.attach(example.id, { body: await page.screenshot({ fullPage: true, animations: 'disabled' }), contentType: 'image/png' });
        }
    });
}
