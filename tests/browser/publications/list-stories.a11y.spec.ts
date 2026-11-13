import { test, expect } from '../fixtures';
import { readLocalUrl } from '../../../config/local-urls.cjs';
import { auditAccessibility } from '../accessibility';
const storybook = readLocalUrl('PLAYWRIGHT_STORYBOOK_URL');
for (const theme of ['light', 'dark']) {
    test(`listagem e filtros administrativos acessíveis em ${theme}`, async ({ page }, info) => {
        for (const id of ['publicações-listagem-administrativa--lista', 'publicações-listagem-administrativa--grade', 'publicações-pesquisa-e-filtros--eventos', 'publicações-pesquisa-e-filtros--avisos']) {
            await page.goto(new URL(`/iframe.html?id=${id}&viewMode=story&embed=true&globals=theme:${theme}`, storybook).href);
            if (id.includes('pesquisa')) {
                await expect(page.getByRole('button', { name: 'Buscar', exact: true })).toBeVisible();
                await page.getByRole('button', { name: 'Buscar', exact: true }).click();
                await expect(page.getByText('Informe um ID positivo válido.')).toBeVisible();
            } else await expect(page.getByText('ID #7', { exact: true })).toBeVisible();
            await auditAccessibility(page, info, `${id}-${theme}`);
        }
    });
}
