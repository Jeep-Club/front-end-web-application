import { readLocalUrl } from '../../../config/local-urls.cjs';
import { expect, test } from '../fixtures';

const storybook = readLocalUrl('PLAYWRIGHT_STORYBOOK_URL');

test('campos separados e rótulos do calendário acompanham o intervalo', async ({ page }) => {
    await page.goto(new URL('/iframe.html?id=componentes-datepicker-intervalo--intervalo-vazio&embed=true', storybook).href);
    const start = page.getByRole('textbox', { name: 'Período — data inicial' });
    await page.getByRole('button', { name: 'Adicionar data final' }).click();
    const end = page.getByRole('textbox', { name: 'Período — data final' });
    const first = await start.boundingBox();
    const second = await end.boundingBox();
    expect(first).not.toBeNull(); expect(second).not.toBeNull();
    expect(first!.x + first!.width).toBeLessThanOrEqual(second!.x);
    await page.getByRole('button', { name: 'Abrir calendário: Período' }).click();
    const dialog = page.getByRole('dialog', { name: 'Período' });
    await expect(dialog.getByRole('textbox', { name: 'Data inicial', exact: true })).toBeVisible();
    await expect(dialog.getByRole('textbox', { name: 'Data final', exact: true })).toBeVisible();
});

test('painel móvel cabe na tela baixa e mantém ações alcançáveis', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 420 });
    await page.goto(new URL('/iframe.html?id=componentes-datepicker-intervalo--intervalo-vazio&embed=true', storybook).href);
    const trigger = page.getByRole('button', { name: 'Abrir calendário: Período' });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Período' });
    await expect(dialog.getByRole('textbox', { name: 'Data', exact: true })).toBeVisible();
    const box = await dialog.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(320);
    expect(box!.y + box!.height).toBeLessThanOrEqual(420);
    await dialog.getByRole('button', { name: 'Aplicar', exact: true }).scrollIntoViewIfNeeded();
    await expect(dialog.getByRole('button', { name: 'Aplicar', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
});

test('popover em janela desktop baixa mantém controles acessíveis', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 420 });
    await page.goto(new URL('/iframe.html?id=componentes-datepicker-intervalo--intervalo-vazio&embed=true', storybook).href);
    await page.getByRole('button', { name: 'Abrir calendário: Período' }).click();
    const dialog = page.getByRole('dialog', { name: 'Período' });
    const box = await dialog.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(420);
    await dialog.getByRole('button', { name: 'Aplicar', exact: true }).scrollIntoViewIfNeeded();
    await expect(dialog.getByRole('button', { name: 'Aplicar', exact: true })).toBeVisible();
});
