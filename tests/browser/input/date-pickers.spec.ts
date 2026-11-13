import { readLocalUrl } from '../../../config/local-urls.cjs';
import { expect, test } from '../fixtures';

const storybookUrl = readLocalUrl('PLAYWRIGHT_STORYBOOK_URL');

for (const theme of ['light', 'dark']) {
    test(`DatePicker seleciona por teclado e acompanha o tema ${theme}`, async ({ page }) => {
        await page.goto(new URL(`/iframe.html?id=componentes-datepicker-data-única--data-unica&embed=true&globals=theme:${theme}`, storybookUrl).href);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        const group = page.locator('.date-input-group');
        await expect(group).toHaveCSS('background-color', theme === 'dark' ? 'rgb(17, 28, 46)' : 'rgb(255, 255, 255)');
        const trigger = page.getByRole('button', { name: 'Abrir calendário: Data de publicação' });
        await trigger.focus();
        await trigger.press('Enter');
        const date = page.getByRole('button', { name: /15 de novembro de 2026/ });
        await expect(date).toBeVisible();
        await expect(page.locator('.jeep-calendar-popover')).toHaveCSS('background-color', theme === 'dark' ? 'rgb(17, 28, 46)' : 'rgb(255, 255, 255)');
        await date.focus();
        await date.press('Enter');
        await expect(page.getByRole('status', { name: 'Data selecionada' })).toHaveText('2026-11-15');
        await expect(trigger).toBeFocused();
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });

    test(`DateRangePicker conclui intervalo apenas na segunda seleção no tema ${theme}`, async ({ page }) => {
        await page.goto(new URL(`/iframe.html?id=componentes-datepicker-intervalo--intervalo-vazio&embed=true&globals=theme:${theme}`, storybookUrl).href);
        const trigger = page.getByRole('button', { name: 'Abrir calendário: Período de publicação' });
        await trigger.click();
        await page.getByRole('button', { name: /15 de novembro de 2026/ }).click();
        await expect(page.getByRole('status', { name: 'Intervalo selecionado' })).toHaveText('Nenhum intervalo');
        await page.getByRole('button', { name: /20 de novembro de 2026/ }).click();
        await expect(page.getByRole('status', { name: 'Intervalo selecionado' })).toHaveText('2026-11-15 / 2026-11-20');
        await expect(page.getByRole('grid')).toBeHidden();
        await trigger.press('Enter');
        await expect(page.getByRole('grid')).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(trigger).toBeFocused();
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
}

test('calendário bloqueia datas fora dos limites e campo disabled não abre', async ({ page }) => {
    await page.goto(new URL('/iframe.html?id=componentes-datepicker-data-única--limites&embed=true', storybookUrl).href);
    await page.getByRole('button', { name: 'Abrir calendário: Data de publicação' }).click();
    await expect(page.getByRole('button', { name: /segunda-feira, 9 de novembro de 2026/ })).toHaveAttribute('aria-disabled', 'true');
    await expect(page.getByRole('button', { name: /15 de novembro de 2026/ })).not.toHaveAttribute('aria-disabled', 'true');
    await page.goto(new URL('/iframe.html?id=componentes-datepicker-data-única--desabilitada&embed=true', storybookUrl).href);
    await expect(page.getByRole('button', { name: 'Abrir calendário: Data de publicação' })).toBeDisabled();
});


test('campos do popover refletem o intervalo e normalizam segundos ao editar horário', async ({ page }) => {
    await page.goto(new URL('/iframe.html?id=componentes-datepicker-intervalo--com-horario&embed=true', storybookUrl).href);
    const trigger = page.getByRole('button', { name: /Abrir calend/ });
    await trigger.click();
    const fields = page.locator('.jeep-calendar-fields');
    await expect(fields.locator('[data-type="second"]')).toHaveCount(0);
    await expect(fields.locator('[data-type="hour"]')).toHaveCount(2);
    const endHour = fields.locator('[data-type="hour"]').nth(1);
    await endHour.focus();
    await page.keyboard.press('ArrowUp');
    await expect(page.getByRole('status', { name: 'Intervalo selecionado' })).toHaveText('2026-11-15T14:30:00 / 2026-11-16T19:45:00');
});
