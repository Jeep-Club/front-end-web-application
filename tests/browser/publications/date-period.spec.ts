import { test, expect } from './fixtures';

test('período preserva instantes precisos ao abrir e aplicar', async ({ page, api }) => {
    const from = '2026-11-15T17:30:45.123456789Z';
    const to = '2026-11-16T21:45:12.123456Z';
    await page.goto(`/admin/publications/notice?publishedFrom=${from}&publishedTo=${to}&view=grid&page=1`);
    await page.getByRole('button', { name: 'Abrir calendário: Período de publicação' }).click();
    await expect(page.getByRole('dialog').getByLabel('Data inicial', { exact: true })).toHaveValue('15/11/2026');
    await expect(page.getByRole('dialog').getByLabel('Data final', { exact: true })).toHaveValue('16/11/2026');
    await page.getByRole('button', { name: 'Aplicar', exact: true }).click();
    await expect.poll(() => new URL(page.url()).searchParams.get('publishedFrom')).toBe(from);
    await expect.poll(() => new URL(page.url()).searchParams.get('publishedTo')).toBe(to);
    expect(new URL(page.url()).searchParams.get('view')).toBe('grid');
    expect(new URL(page.url()).searchParams.get('page')).toBe('1');
    expect(api.calls.some(call => call.url.pathname === '/publications/feed')).toBe(true);
});
