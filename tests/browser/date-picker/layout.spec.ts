import { readLocalUrl } from '../../../config/local-urls.cjs';
import { expect, test } from '../fixtures';

const storybook = readLocalUrl('PLAYWRIGHT_STORYBOOK_URL');

test('campos separados e rótulos do calendário acompanham o intervalo', async ({ page }) => {
    await page.goto(new URL('/iframe.html?id=componentes-datepicker-intervalo--intervalo-vazio&embed=true', storybook).href);
    const start = page.getByRole('spinbutton', { name: /dia, Data inicial/ });
    const end = page.getByRole('spinbutton', { name: /dia, Data final/ });
    const first = await start.boundingBox();
    const second = await end.boundingBox();
    expect(first).not.toBeNull(); expect(second).not.toBeNull();
    expect(first!.x + first!.width).toBeLessThanOrEqual(second!.x);
    await page.getByRole('button', { name: 'Abrir calendário: Período' }).click();
    const dialog = page.getByRole('dialog', { name: 'Período' });
    await expect(dialog.getByRole('spinbutton', { name: /dia, Data inicial/ })).toBeVisible();
    await expect(dialog.getByRole('spinbutton', { name: /dia, Data final/ })).toBeVisible();
});

test('painel móvel cabe na tela baixa e mantém ações alcançáveis', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 420 });
    await page.goto(new URL('/iframe.html?id=componentes-datepicker-intervalo--intervalo-vazio&embed=true', storybook).href);
    const trigger = page.getByRole('button', { name: 'Abrir calendário: Período' });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Período' });
    await expect(dialog.getByRole('spinbutton', { name: /dia, Data inicial/ })).toBeVisible();
    const box = await dialog.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(320);
    expect(box!.y + box!.height).toBeLessThanOrEqual(420);
    await expect(dialog.getByRole('button', { name: 'Concluir', exact: true })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Limpar', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
});

test('popover desktop mostra o calendário completo em janela baixa', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 420 });
    await page.goto(new URL('/iframe.html?id=componentes-datepicker-intervalo--intervalo-vazio&embed=true', storybook).href);
    await page.getByRole('button', { name: 'Abrir calendário: Período' }).click();
    const dialog = page.getByRole('dialog', { name: 'Período' });
    await expect(dialog.getByRole('grid')).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Limpar', exact: true })).toBeAttached();
});

test('intervalo mostra calendário completo e datas lado a lado', async ({ page }) => {
    await page.goto(new URL('/iframe.html?id=componentes-datepicker-intervalo--intervalo-preenchido&embed=true', storybook).href);
    await page.getByRole('button', { name: 'Abrir calendário: Período de publicação' }).click();
    const popover = page.locator('.jeep-range-popover');
    await expect(popover).toBeVisible();
    const layout = await popover.evaluate(element => {
        const fields = element.querySelectorAll('.jeep-calendar-fields .date-input-group');
        const first = fields[0].getBoundingClientRect();
        const second = fields[1].getBoundingClientRect();
        return { firstRight: first.right, secondLeft: second.left, scrollHeight: element.scrollHeight, clientHeight: element.clientHeight, overflow: getComputedStyle(element).overflowY };
    });
    expect(layout.firstRight).toBeLessThanOrEqual(layout.secondLeft);
    expect(layout.scrollHeight).toBeLessThanOrEqual(layout.clientHeight + 1);
    expect(layout.overflow).toBe('visible');
});

test('horário do intervalo avança para o fim e permite limpar', async ({ page }) => {
    await page.goto(new URL('/iframe.html?id=componentes-datepicker-intervalo--com-horario&embed=true', storybook).href);
    await page.getByRole('button', { name: 'Abrir calendário: Período de publicação' }).click();
    const popover = page.locator('.jeep-range-popover');
    await expect.poll(async () => {
        const calendarHeight = await popover.locator('.range-calendar').evaluate(element => element.getBoundingClientRect().height);
        const panelHeight = await popover.locator('.jeep-time-panel').evaluate(element => element.getBoundingClientRect().height);
        return Math.abs(calendarHeight - panelHeight);
    }).toBeLessThan(2);
    await expect(popover.getByRole('button', { name: /^Horas \d\d$/ })).toHaveCount(24);
    await expect(popover.getByRole('button', { name: /^Minutos \d\d$/ })).toHaveCount(60);
    const start = popover.getByRole('button', { name: 'Início', exact: true });
    const end = popover.getByRole('button', { name: 'Fim', exact: true });
    await expect(start).toHaveAttribute('aria-pressed', 'true');
    await popover.getByRole('button', { name: 'Minutos 31', exact: true }).click();
    await expect(end).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('output[aria-label="Intervalo selecionado"]')).toContainText('14:31');
    await popover.getByRole('button', { name: 'Limpar', exact: true }).click();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('status', { name: 'Intervalo selecionado' })).toHaveText('Nenhum intervalo');
    await page.goto(new URL('/iframe.html?id=componentes-datepicker-data-%C3%BAnica--com-horario&embed=true', storybook).href);
    await page.getByRole('button', { name: 'Abrir calendário: Data de publicação' }).click();
    const single = page.locator('.jeep-calendar-popover');
    await single.getByRole('button', { name: 'Horas 15', exact: true }).click();
    await expect(page.locator('output[aria-label="Data selecionada"]')).toContainText('15:30');
    await single.getByRole('button', { name: 'Limpar', exact: true }).click();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('status', { name: 'Data selecionada' })).toHaveText('Nenhuma data');
});

test('no celular seleciona datas e horários do intervalo em sequência', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(new URL('/iframe.html?id=componentes-datepicker-intervalo--com-horario&embed=true', storybook).href);
    await page.getByRole('button', { name: 'Abrir calendário: Período de publicação' }).click();
    const popover = page.locator('.jeep-range-popover');
    await popover.getByRole('button', { name: /17 de novembro de 2026/ }).click();
    await popover.getByRole('button', { name: /20 de novembro de 2026/ }).click();
    const start = popover.getByRole('region', { name: 'Horário de início' });
    await expect(start).toBeVisible();
    const startClock = start.getByRole('listbox', { name: /Selecione horas/ });
    await startClock.focus();
    await startClock.press('ArrowUp');
    await startClock.press('Enter');
    const startMinutes = start.getByRole('listbox', { name: /Selecione minutos/ });
    await startMinutes.focus();
    await startMinutes.press('ArrowUp');
    await startMinutes.press('Enter');
    await expect(popover.getByRole('button', { name: 'Minuto', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await popover.getByRole('button', { name: 'Fim', exact: true }).click();
    await popover.getByRole('button', { name: 'Hora', exact: true }).click();
    const end = popover.getByRole('region', { name: 'Horário de fim' });
    await expect(end).toBeVisible();
    const endClock = end.getByRole('listbox', { name: /Selecione horas/ });
    await endClock.focus();
    await endClock.press('Enter');
    await end.getByRole('listbox', { name: /Selecione minutos/ }).press('Enter');
    await popover.getByRole('button', { name: 'Concluir' }).click();
    await expect(page.locator('output[aria-label="Intervalo selecionado"]')).toContainText('15:31');
    await expect(page.locator('output[aria-label="Intervalo selecionado"]')).toContainText('18:45');
});

test('no celular seleciona uma data e horário pelo relógio', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(new URL('/iframe.html?id=componentes-datepicker-data-%C3%BAnica--com-horario&embed=true', storybook).href);
    await page.getByRole('button', { name: 'Abrir calendário: Data de publicação' }).click();
    const popover = page.locator('.jeep-calendar-popover');
    await popover.getByRole('button', { name: /17 de novembro de 2026/ }).click();
    const clock = popover.getByRole('region', { name: 'Selecionar horário' });
    await expect(clock).toBeVisible();
    const hour = clock.getByRole('listbox', { name: /Selecione horas/ });
    await hour.focus();
    await hour.press('ArrowUp');
    await hour.press('Enter');
    const minutes = clock.getByRole('listbox', { name: /Selecione minutos/ });
    await minutes.focus();
    await minutes.press('ArrowUp');
    await minutes.press('ArrowUp');
    await minutes.press('Enter');
    await popover.getByRole('button', { name: 'Concluir' }).click();
    await expect(page.locator('output[aria-label="Data selecionada"]')).toContainText('15:32');
});

test('sheet móvel descarta alterações ao fechar e confirma limpeza', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(new URL('/iframe.html?id=componentes-datepicker-data-%C3%BAnica--com-horario&embed=true', storybook).href);
    const output = page.locator('output[aria-label="Data selecionada"]');
    const original = await output.textContent();
    const trigger = page.getByRole('button', { name: 'Abrir calendário: Data de publicação' });
    await trigger.click();
    const sheet = page.locator('.jeep-calendar-popover');
    await sheet.getByRole('button', { name: /17 de novembro de 2026/ }).click();
    await expect(output).toHaveText(original!);
    await sheet.getByRole('button', { name: 'Fechar seletor de data' }).click();
    await expect(output).toHaveText(original!);
    await trigger.click();
    await sheet.getByRole('button', { name: 'Limpar', exact: true }).click();
    await expect(output).toHaveText(original!);
    await sheet.getByRole('button', { name: 'Concluir', exact: true }).click();
    await expect(output).toHaveText('Nenhuma data');
});

test('sheet móvel permite fechar pelo fundo e gesto, com rodapé fixo', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(new URL('/iframe.html?id=componentes-datepicker-data-%C3%BAnica--com-horario&embed=true', storybook).href);
    const output = page.locator('output[aria-label="Data selecionada"]');
    const original = await output.textContent();
    const trigger = page.getByRole('button', { name: 'Abrir calendário: Data de publicação' });
    await trigger.click();
    const sheet = page.locator('.jeep-calendar-popover');
    const box = (await sheet.boundingBox())!;
    expect(box.height / 640).toBeGreaterThanOrEqual(0.65);
    expect(box.height / 640).toBeLessThanOrEqual(0.92);
    expect(box.y + box.height).toBeLessThanOrEqual(641);
    const footer = await sheet.locator('.jeep-sheet-footer').boundingBox();
    expect(footer!.y + footer!.height).toBeLessThanOrEqual(641);
    await page.mouse.click(3, 3);
    await expect(sheet).toBeHidden();
    await expect(output).toHaveText(original!);
    await trigger.click();
    const handle = sheet.locator('.jeep-sheet-handle-area');
    const handleBox = (await handle.boundingBox())!;
    await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + 8);
    await page.mouse.down();
    await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + 100, { steps: 5 });
    await page.mouse.up();
    await expect(sheet).toBeHidden();
    await expect(output).toHaveText(original!);
});

test('sheet móvel começa em zero e permite edição manual nos dois temas', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(new URL('/iframe.html?id=componentes-datepicker-data-%C3%BAnica--horario-vazio&embed=true', storybook).href);
    for (const theme of ['light', 'dark']) {
        await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
        const trigger = page.getByRole('button', { name: 'Abrir calendário: Data de publicação' });
        await trigger.click();
        const sheet = page.locator('.jeep-calendar-popover');
        await sheet.getByRole('button', { name: /17 de novembro de 2026/ }).click();
        await expect(sheet.getByRole('region', { name: 'Selecionar horário' })).toBeVisible();
        await expect(sheet.getByRole('listbox', { name: /Selecione horas/ })).toContainText('00');
        await sheet.getByRole('button', { name: 'Data', exact: true }).click();
        const day = sheet.getByRole('spinbutton', { name: /dia.*Data de publicação/ });
        await day.fill('18');
        await expect(sheet.getByRole('button', { name: 'Data', exact: true })).toHaveAttribute('aria-pressed', 'true');
        await sheet.getByRole('button', { name: 'Hora', exact: true }).click();
        await sheet.getByRole('button', { name: 'Minuto', exact: true }).click();
        await sheet.getByRole('button', { name: 'Concluir', exact: true }).click();
        await expect(page.locator('output[aria-label="Data selecionada"]')).toContainText('2026-11-18T00:00');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await trigger.click();
        await page.locator('.jeep-calendar-popover').getByRole('button', { name: 'Limpar', exact: true }).click();
        await page.locator('.jeep-calendar-popover').getByRole('button', { name: 'Concluir', exact: true }).click();
    }
});

test('sheet de intervalo não aplica seleção parcial e permite reiniciá-la', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(new URL('/iframe.html?id=componentes-datepicker-intervalo--intervalo-vazio&embed=true', storybook).href);
    const trigger = page.getByRole('button', { name: 'Abrir calendário: Período de publicação' });
    const output = page.locator('output[aria-label="Intervalo selecionado"]');
    await trigger.click();
    const sheet = page.locator('.jeep-range-popover');
    await sheet.getByRole('button', { name: /15 de novembro de 2026/ }).click();
    await expect(sheet.getByRole('button', { name: 'Concluir' })).toBeDisabled();
    await sheet.getByRole('button', { name: 'Limpar', exact: true }).click();
    await sheet.getByRole('button', { name: /17 de novembro de 2026/ }).click();
    await sheet.getByRole('button', { name: /20 de novembro de 2026/ }).click();
    await expect(output).toHaveText('Nenhum intervalo');
    await sheet.getByRole('button', { name: 'Concluir' }).click();
    await expect(output).toContainText('2026-11-17');
    await expect(output).toContainText('2026-11-20');
});

for (const story of ['componentes-datepicker-data-%C3%BAnica--horario-vazio', 'componentes-datepicker-intervalo--intervalo-vazio']) {
    test(`calendário móvel usa toda a superfície disponível: ${story}`, async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto(new URL(`/iframe.html?id=${story}&embed=true`, storybook).href);
        await page.getByRole('button', { name: /Abrir calendário/ }).click();
        const dialog = page.getByRole('dialog');
        const body = dialog.locator('.jeep-sheet-body');
        const calendar = dialog.locator('.calendar, .range-calendar');
        const sizes = await body.evaluate((element) => {
            const calendarElement = element.querySelector('.calendar, .range-calendar')!;
            return { bodyBackground: getComputedStyle(element).backgroundColor, sheetBackground: getComputedStyle(element.closest('.jeep-calendar-popover')!).backgroundColor, width: calendarElement.getBoundingClientRect().width, available: element.clientWidth - 32 };
        });
        expect(sizes.bodyBackground).toBe(sizes.sheetBackground);
        expect(sizes.width).toBeGreaterThanOrEqual(sizes.available - 2);
        await expect(calendar).toBeVisible();
    });
}

test('relógio móvel ampliado permanece centralizado e seleciona pelo toque', async ({ page }) => {
    await page.setViewportSize({ width: 440, height: 844 });
    await page.goto(new URL('/iframe.html?id=componentes-datepicker-data-%C3%BAnica--horario-vazio&embed=true', storybook).href);
    await page.getByRole('button', { name: /Abrir calendário/ }).click();
    const sheet = page.locator('.jeep-calendar-popover');
    await sheet.getByRole('button', { name: /17 de novembro de 2026/ }).click();
    const body = sheet.locator('.jeep-sheet-body');
    const clock = sheet.locator('.MuiClock-squareMask');
    const bounds = await clock.boundingBox();
    const bodyBounds = await body.boundingBox();
    expect(bounds).not.toBeNull(); expect(bodyBounds).not.toBeNull();
    expect(bounds!.width).toBeGreaterThan(250);
    expect(Math.abs(bounds!.x + bounds!.width / 2 - bodyBounds!.x - bodyBounds!.width / 2)).toBeLessThan(2);
    await clock.click({ position: { x: bounds!.width * 0.9, y: bounds!.height * 0.5 } });
    await expect(sheet.getByRole('button', { name: 'Minuto', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await clock.click({ position: { x: bounds!.width * 0.5, y: bounds!.height * 0.9 } });
    await sheet.getByRole('button', { name: 'Concluir' }).click();
    await expect(page.locator('output[aria-label="Data selecionada"]')).toContainText('03:30');
});

test('seletor em celular baixo aproveita altura e mantém relógio e ações visíveis', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 600 });
    await page.goto(new URL('/iframe.html?id=componentes-datepicker-data-%C3%BAnica--horario-vazio&embed=true', storybook).href);
    await page.getByRole('button', { name: /Abrir calendário/ }).click();
    const sheet = page.locator('.jeep-calendar-popover');
    const sheetBox = (await sheet.boundingBox())!;
    expect(sheetBox.height).toBeGreaterThanOrEqual(540);
    await sheet.getByRole('button', { name: /17 de novembro de 2026/ }).click();
    const bodyBox = (await sheet.locator('.jeep-sheet-body').boundingBox())!;
    const clock = sheet.locator('.MuiClock-squareMask');
    const clockBox = (await clock.boundingBox())!;
    expect(clockBox.y).toBeGreaterThanOrEqual(bodyBox.y);
    expect(clockBox.y + clockBox.height).toBeLessThanOrEqual(bodyBox.y + bodyBox.height);
    await expect(sheet.getByRole('button', { name: 'Concluir' })).toBeVisible();
    await clock.click({ position: { x: clockBox.width * 0.9, y: clockBox.height * 0.5 } });
    await expect(sheet.getByRole('button', { name: 'Minuto', exact: true })).toHaveAttribute('aria-pressed', 'true');
    const minuteBox = (await clock.boundingBox())!;
    await clock.click({ position: { x: minuteBox.width * 0.5, y: minuteBox.height * 0.9 } });
    await sheet.getByRole('button', { name: 'Concluir' }).click();
    await expect(page.locator('output[aria-label="Data selecionada"]')).toContainText('03:30');
});
