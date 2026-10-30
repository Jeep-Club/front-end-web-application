import { test, expect } from './fixtures';
import { auditAccessibility } from '../accessibility';

test('feed, validação e detalhe mantêm semântica acessível', async ({ page }, testInfo) => {
    await page.goto('/feed');
    await expect(page.getByRole('link', { name: 'Ver publicação completa: Aviso do clube', exact: true })).toBeVisible();
    await auditAccessibility(page, testInfo, 'feed');
    await page.getByLabel('Publicada a partir de (UTC)').fill('inválido');
    await page.getByRole('button', { name: 'Aplicar período' }).click();
    await expect(page.getByLabel('Publicada a partir de (UTC)')).toHaveAttribute('aria-invalid', 'true');
    await auditAccessibility(page, testInfo, 'validation');
    await page.getByRole('link', { name: 'Ver publicação completa: Aviso do clube', exact: true }).click();
    await expect(page.getByRole('dialog').getByText('Autor — identificação #7')).toBeVisible();
    await auditAccessibility(page, testInfo, 'detail');
});

for (const theme of ['light', 'dark']) {
    test(`erro do detalhe mantém contraste e ações acessíveis em ${theme}`, async ({ page, api }, testInfo) => {
        api.detailStatus = 503;
        await page.addInitScript(value => localStorage.setItem('jeep-clube-theme', value), theme);
        await page.goto('/feed?publication=1');
        await expect(page.getByRole('dialog').getByRole('alert')).toContainText('temporariamente indisponível');
        await auditAccessibility(page, testInfo, `detail-error-${theme}`);
    });
    for (const { id, type } of [{ id: 2, type: 'EVENT' }, { id: 3, type: 'SERVICE' }]) {
        test(`detalhe ${type} mantém contraste e semântica em ${theme}`, async ({ page }, testInfo) => {
            await page.addInitScript(value => localStorage.setItem('jeep-clube-theme', value), theme);
            await page.goto(`/feed?publication=${id}`);
            await expect(page.getByRole('dialog').getByText('Autor — identificação #7')).toBeVisible();
            await auditAccessibility(page, testInfo, `detail-${type}-${theme}`);
        });
    }
}
