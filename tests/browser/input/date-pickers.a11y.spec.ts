import { readLocalUrl } from '../../../config/local-urls.cjs';
import { auditAccessibility } from '../accessibility';
import { expect, test } from '../fixtures';

const storybookUrl = readLocalUrl('PLAYWRIGHT_STORYBOOK_URL');

for (const theme of ['light', 'dark']) {
    test(`calendários têm labels e contraste nos estados fechado e aberto em ${theme}`, async ({ page }, testInfo) => {
        for (const id of ['componentes-datepicker-data-única--limites', 'componentes-datepicker-intervalo--intervalo-preenchido']) {
            await page.goto(new URL(`/iframe.html?id=${id}&embed=true&globals=theme:${theme}`, storybookUrl).href);
            await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
            await auditAccessibility(page, testInfo, `${id}-fechado`);
            await page.getByRole('button', { name: /Abrir calendário:/ }).click();
            await expect(page.getByRole('grid')).toBeVisible();
            await auditAccessibility(page, testInfo, `${id}-aberto`);
        }
    });
}
