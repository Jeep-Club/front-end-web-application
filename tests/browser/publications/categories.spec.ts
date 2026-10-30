import { test, expect } from './fixtures';

for (const [type, route, title] of [['NOTICE', 'notice', 'Aviso publicado'], ['SERVICE', 'service', 'Serviço publicado']] as const) {
    test(`${route} lista publicações do feed e mantém consulta por ID`, async ({ page, api }) => {
        const shared = { authorUserId: 7, content: '<p>Conteúdo sintético.</p>', primaryImage: null, publishedAt: '2026-10-30T12:00:00Z', likeCount: 0, commentCount: 0, likedByMe: false };
        api.feedItems = [
            { ...shared, id: 13, type: 'NOTICE', title: 'Aviso publicado', details: {} },
            { ...shared, id: 12, type: 'SERVICE', title: 'Serviço publicado', details: { amount: 150, contactPhone: '12999999999' } },
        ];
        await page.goto(`/admin/publications/${route}`);
        await expect(page.getByRole('heading', { name: title })).toBeVisible();
        const link = page.getByRole('link', { name: type === 'NOTICE' ? 'Administrar aviso' : 'Administrar serviço' });
        await expect(link).toHaveAttribute('href', new RegExp(`/admin/publications/${route}/`));
        await expect(page.getByLabel('Pesquisar por título ou ID')).toBeVisible();
        expect(api.calls.some(call => call.url.pathname === '/publications/feed' && call.url.searchParams.get('type') === type)).toBe(true);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
}

test('sem permissão de feed não consulta a lista e mantém pesquisa por ID', async ({ page, api }) => {
    await api.grant(['NOTICE_READ']);
    await page.goto('/admin/publications/notice');
    await expect(page.getByText('Você não possui permissão para consultar as publicações do feed.')).toBeVisible();
    await expect(page.getByLabel('Pesquisar por título ou ID')).toBeVisible();
    expect(api.calls.some(call => call.url.pathname === '/publications/feed')).toBe(false);
});

test('abas mantêm contraste ao passar o mouse no tema escuro', async ({ page }) => {
    await page.goto('/admin/publications');
    await page.evaluate(() => { document.documentElement.dataset.theme = 'dark'; });
    const tab = page.getByRole('button', { name: 'Eventos', exact: true });
    await expect(tab).toHaveCSS('color', 'rgb(241, 245, 249)');
    const before = await tab.evaluate(element => getComputedStyle(element).color);
    await tab.hover();
    await expect.poll(() => tab.evaluate(element => getComputedStyle(element).color)).toBe(before);
    const active = page.getByRole('button', { name: 'Visão geral', exact: true });
    await expect(active).toHaveAttribute('aria-pressed', 'true');
});
