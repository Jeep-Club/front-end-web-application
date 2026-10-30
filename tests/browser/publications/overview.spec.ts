import { test, expect } from './fixtures';

test('visão geral reúne publicados, eventos administrativos e filtros indisponíveis', async ({ page, api }) => {
    const shared = { authorUserId: 7, content: '<p>Conteúdo para teste.</p>', primaryImage: null, likeCount: 0, commentCount: 0, likedByMe: false };
    api.feedItems = [
        { ...shared, id: 14, type: 'EVENT', title: 'Evento publicado recente', publishedAt: '2026-10-30T12:00:00Z', details: { startsAt: '2099-10-30T12:00:00Z', endsAt: null, status: 'OPEN' } },
        { ...shared, id: 13, type: 'NOTICE', title: 'Aviso publicado recente', publishedAt: '2026-10-29T12:00:00Z', details: {} },
        { ...shared, id: 12, type: 'SERVICE', title: 'Serviço publicado recente', publishedAt: '2026-10-28T12:00:00Z', details: { amount: 150, contactPhone: '12999999999' } },
    ];
    await page.goto('/admin/publications');
    await expect(page.getByRole('heading', { name: 'Evento publicado mais recente' })).toBeVisible();
    await expect(page.getByText('Evento publicado recente').first()).toBeVisible();
    await expect(page.getByText('Aviso publicado recente').first()).toBeVisible();
    await expect(page.getByText('Serviço publicado recente').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Eventos administrativos' })).toBeVisible();
    await expect(page.getByText('Rascunho · Aberto')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Administrar Aviso publicado recente' }).first()).toHaveAttribute('href', '/admin/publications/notice/13');
    const status = page.getByRole('button', { name: 'Rascunhos', exact: true });
    await status.focus();
    await expect(status).toHaveAttribute('title', 'Filtros ainda não implementados.');
    await status.click();
    await expect(page.getByText('Filtros ainda não implementados.', { exact: true })).toBeVisible();
    expect(api.calls.filter(call => call.url.pathname === '/publications/feed' && !call.url.searchParams.has('type'))).toHaveLength(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('erro de uma categoria preserva as demais e oferece nova tentativa', async ({ page, api }) => {
    api.feedFailure = 'NOTICE';
    await page.goto('/admin/publications');
    await expect(page.getByRole('alert').filter({ hasText: 'serviço está temporariamente indisponível' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Eventos administrativos' })).toBeVisible();
    api.feedFailure = '';
    await page.getByRole('alert').getByRole('button', { name: 'Tentar novamente' }).click();
    await expect(page.getByText('Nenhuma publicação nesta categoria.')).toHaveCount(3);
});

test('sem permissão de feed mantém eventos e não consulta publicações', async ({ page, api }) => {
    await api.grant(['EVENT_READ_ADMIN']);
    await page.goto('/admin/publications');
    await expect(page.getByText('Você não possui permissão para consultar o feed de publicações.')).toBeVisible();
    await expect(page.getByText('Rascunho · Aberto')).toBeVisible();
    expect(api.calls.some(call => call.url.pathname === '/publications/feed')).toBe(false);
});

test('paginação consulta outras publicações e preserva o total do feed', async ({ page, api }) => {
    api.feedItems = Array.from({ length: 13 }, (_, index) => ({ id: 30 - index, type: 'NOTICE' as const, title: `Aviso ${index + 1}`, content: 'Conteúdo', authorUserId: 7, primaryImage: null, publishedAt: '2026-10-30T12:00:00Z', likeCount: 0, commentCount: 0, likedByMe: false, details: {} }));
    await page.goto('/admin/publications');
    await expect(page.getByText('12 de 13 itens')).toBeVisible();
    await page.getByRole('button', { name: 'Próxima página' }).click();
    await expect(page).toHaveURL(/page=1/);
    await expect(page.getByText('1 de 13 itens')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Administrar Aviso 13' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Indicadores de publicações' }).getByText('13').first()).toBeVisible();
});
