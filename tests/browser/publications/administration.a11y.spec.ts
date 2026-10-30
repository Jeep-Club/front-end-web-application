import { test, expect } from './fixtures';
import { auditAccessibility } from '../accessibility';
for (const theme of ['light', 'dark']) {
    test(`edição e confirmação administrativas em ${theme}`, async ({ page }, info) => {
        await page.goto('/admin/publications/notice/8');
        await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
        await page.getByRole('button', { name: 'Editar aviso' }).click();
        await expect(page.getByRole('dialog').getByRole('textbox', { name: 'Título', exact: true })).toBeVisible();
        await auditAccessibility(page, info, `edicao-${theme}`);
        await page.getByRole('dialog').getByRole('textbox', { name: 'Título', exact: true }).fill('');
        await page.getByRole('dialog').getByRole('button', { name: 'Salvar alterações' }).click();
        await expect(page.getByRole('dialog').getByText('Informe o título.')).toBeVisible();
        await auditAccessibility(page, info, `validacao-${theme}`);
        await page.keyboard.press('Escape');
        await page.getByRole('button', { name: 'Excluir aviso' }).click();
        await auditAccessibility(page, info, `confirmacao-${theme}`);
    });
}
