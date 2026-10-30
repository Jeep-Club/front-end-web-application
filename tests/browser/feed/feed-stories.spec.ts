import { test, expect } from '../fixtures';
import { readLocalUrl } from '../../../config/local-urls.cjs';

const storyUrl = readLocalUrl('PLAYWRIGHT_STORYBOOK_URL');
// IDs discovered with `storybook tools stories changed`; embed disables autoplay.
for (const theme of ['light', 'dark']) {
    test(`formulário temporal isolado em tema ${theme}`, async ({ page }) => {
        await page.goto(new URL(`/iframe.html?id=publications-feedperiodfilters--exact-interval&viewMode=story&embed=true&globals=theme:${theme}`, storyUrl).href);
        await expect(page.getByLabel('Publicada a partir de (UTC)')).toHaveValue('2026-10-29T12:00:00.123456Z');
        await page.getByLabel('Publicada até (UTC)').fill('2026-10-29T12:00:00.123455Z');
        await page.getByRole('button', { name: 'Aplicar período' }).click();
        await expect(page.getByText('O fim deve ser igual ou posterior ao início.')).toBeVisible();
        await page.getByRole('button', { name: 'Limpar período' }).click();
        await expect(page.getByLabel('Publicada a partir de (UTC)')).toBeEmpty();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    });
}

test('galeria isolada ordena fotos e permite teclado', async ({ page }) => {
    await page.goto(new URL('/iframe.html?id=publications-publicationphotocarousel--multiple&viewMode=story&embed=true', storyUrl).href);
    const photo = page.getByRole('img', { name: 'Fotos da publicação — foto 1 de 2' });
    await expect(photo).toBeVisible();
    await expect.poll(() => photo.evaluate(element => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await page.getByRole('button', { name: 'Próxima foto' }).click();
    await expect(page.getByText('Foto 2 de 2')).toBeVisible();
    await page.getByRole('button', { name: 'Mostrar foto 1' }).click();
    await expect(page.getByText('Foto 1 de 2')).toBeVisible();
});
