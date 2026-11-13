import { test, expect } from './fixtures';
import { auditAccessibility } from '../accessibility';

test('feed, validação e detalhe mantêm semântica acessível', async ({ page }, testInfo) => {
    await page.goto('/feed');
    await expect(page.getByRole('link', { name: 'Ver publicação completa: Aviso do clube', exact: true })).toBeVisible();
    await auditAccessibility(page, testInfo, 'feed');
    await page.getByRole('button', { name: 'Filtrar por período' }).click();
    for (const [label, day] of [['Publicada a partir de', '30'], ['Publicada até', '29']] as const) {
        const segments = page.getByRole('group', { name: label, exact: true }).getByRole('spinbutton');
        for (const [index, value] of [day, '10', '2026', '12', '00'].entries()) await segments.nth(index).fill(value);
    }
    await page.getByRole('button', { name: 'Aplicar período' }).click();
    await expect(page.getByText('O fim deve ser igual ou posterior ao início.')).toBeVisible();
    await auditAccessibility(page, testInfo, 'validation');
    await page.keyboard.press('Escape');
    await page.getByRole('link', { name: 'Ver publicação completa: Aviso do clube', exact: true }).click();
    await expect(page.getByRole('dialog').getByText('Autor — identificação #7')).toBeVisible();
    await auditAccessibility(page, testInfo, 'detail');
});

for (const theme of ['light', 'dark']) {
    test(`erro do detalhe mantém contraste e ações acessíveis em ${theme}`, async ({ page, api }, testInfo) => {
        api.detailStatus = 503;
        await page.addInitScript(value => localStorage.setItem('jeep-clube-theme', value), theme);
        await page.goto('/feed/1');
        await expect(page.getByRole('dialog').getByRole('alert')).toContainText('temporariamente indisponível');
        await auditAccessibility(page, testInfo, `detail-error-${theme}`);
    });
    for (const { id, type } of [{ id: 2, type: 'EVENT' }, { id: 3, type: 'SERVICE' }]) {
        test(`detalhe ${type} mantém contraste e semântica em ${theme}`, async ({ page }, testInfo) => {
            await page.addInitScript(value => localStorage.setItem('jeep-clube-theme', value), theme);
            await page.goto(`/feed/${id}`);
            await expect(page.getByRole('dialog').getByText('Autor — identificação #7')).toBeVisible();
            await auditAccessibility(page, testInfo, `detail-${type}-${theme}`);
        });
    }
}
