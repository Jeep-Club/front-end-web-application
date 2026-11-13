import { test, expect } from './fixtures';
import { auditAccessibility } from '../accessibility';

for (const theme of ['light', 'dark']) {
    test(`visão geral e ajuda dos filtros em ${theme}`, async ({ page }, info) => {
        await page.goto('/admin/publications');
        await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
        await expect(page.getByRole('heading', { name: 'Eventos administrativos' })).toBeVisible();
        await page.getByRole('button', { name: 'Rascunhos', exact: true }).focus();
        await expect(page.getByRole('button', { name: 'Rascunhos', exact: true })).toHaveAttribute('title', 'Filtros ainda não implementados.');
        await auditAccessibility(page, info, `overview-${theme}`);
    });
}
