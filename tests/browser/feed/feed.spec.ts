import { test, expect } from './fixtures';

test('agenda mantém resumo e detalhe compartilhado por provider', async ({ page, api }) => {
    await page.goto('/agenda');
    await expect.poll(() => api.completed.some(url => url.pathname === '/publications/feed' && url.searchParams.get('size') === '48')).toBe(true);
    // Navigate the real calendar rather than changing only the client's clock,
    // which would deliberately diverge from the server-rendered current month.
    const currentMonth = await page.evaluate(() => new Date().getFullYear() * 12 + new Date().getMonth());
    const delta = 2027 * 12 + 10 - currentMonth;
    for (let month = 0; month < Math.abs(delta); month++) {
        await page.getByRole('button', { name: delta > 0 ? 'Próximo mês' : 'Mês anterior' }).click();
    }
    await page.getByRole('button', { name: /Passeio cancelado/ }).click();
    await expect(page.getByRole('heading', { name: 'Passeio cancelado' })).toBeVisible();
    await page.getByRole('button', { name: 'Ver evento e comentários' }).click();
    await expect(page.getByRole('dialog').getByText('Autor — identificação #7')).toBeVisible();
    await page.getByRole('button', { name: 'Fechar publicação' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page).toHaveURL(/\/agenda$/);
});

test('criação contextual existente continua disponível sem executar escrita', async ({ page, api }) => {
    await api.grant(['FEED_READ', 'NOTICE_CREATE']);
    await page.goto('/feed?type=NOTICE');
    await page.getByRole('button', { name: 'Criar aviso', exact: true }).click();
    await expect(page.getByRole('dialog').getByRole('heading', { name: 'Criar aviso' })).toBeVisible();
    await page.getByRole('dialog').getByRole('button', { name: 'Fechar', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page).toHaveURL(/type=NOTICE/);
});

test('participação existente recebe foco e Escape retorna ao detalhe', async ({ page, api }) => {
    api.eventOpen = true;
    await api.grant(['PUBLICATION_READ', 'EVENT_REGISTER']);
    await page.goto('/feed?publication=2');
    await expect(page.getByRole('dialog').getByText('Autor — identificação #7')).toBeVisible();
    await page.getByRole('dialog').getByRole('button', { name: 'Participar do evento' }).click();
    await expect(page.getByRole('heading', { name: 'Como você vai participar?' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog').getByText('Autor — identificação #7')).toBeVisible();
    await expect(page).toHaveURL(/publication=2/);
});

test('sidebar distingue erro de consulta e usa tamanho solicitado', async ({ page, api }) => {
    api.feedStatus = 503;
    await page.goto('/feed');
    await expect(page.getByRole('complementary', { name: 'Informações do clube' }).getByRole('alert').first()).toContainText('temporariamente indisponível');
    expect(api.calls.some(url => url.searchParams.get('type') === 'NOTICE' && url.searchParams.get('size') === '3')).toBe(true);
});

test('falha de imagem conserva leitura e galeria navegável', async ({ page, api }) => {
    api.mediaFails = true;
    await page.goto('/feed?publication=1');
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Imagem indisponível.')).toBeVisible();
    await expect(dialog.getByText('Conteúdo completo para os associados.')).toBeVisible();
    await dialog.getByRole('button', { name: 'Próxima foto' }).click();
    await expect(dialog.getByText('Foto 2 de 2')).toBeVisible();
});

test('período exato, tipos, deep link e retorno preservam contexto', async ({ page, api }) => {
    await page.goto('/feed');
    await expect(page.getByRole('link', { name: 'Ver publicação completa: Aviso do clube', exact: true })).toBeVisible();
    await page.getByLabel('Publicada a partir de (UTC)').fill('2026-10-29T12:00:00.123456Z');
    await page.getByRole('button', { name: 'Aplicar período' }).click();
    await expect.poll(() => api.calls.some(url => url.searchParams.get('publishedFrom') === '2026-10-29T12:00:00.123456Z')).toBe(true);
    await page.getByRole('button', { name: 'Serviços', exact: true }).click();
    const link = page.getByRole('link', { name: 'Ver publicação completa: Serviço anunciado', exact: true });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/publication=3/);
    await expect(page.getByRole('dialog').getByText('Autor — identificação #7')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page).not.toHaveURL(/publication=/);
    await expect(page).toHaveURL(/publishedFrom=/);
    await link.click();
    await page.goBack();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.goForward();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.reload();
    await expect(page.getByRole('dialog').getByText('Serviço anunciado', { exact: true })).toBeVisible();
});

for (const [status, message] of [[402, 'Acesso restrito pela Membership.'], [403, 'Acesso negado'], [404, 'Publicação não encontrada'], [503, 'temporariamente indisponível']] as const) {
    test(`detalhe ${status} não vira vazio nem logout`, async ({ page, api }) => {
        api.detailStatus = status;
        await page.goto('/feed?publication=1');
        await expect(page.getByRole('dialog').getByRole('alert')).toContainText(message);
        await expect(page).toHaveURL(/\/feed/);
        await expect(page.getByRole('dialog').getByText('Conteúdo completo para os associados.')).toHaveCount(0);
        await page.getByRole('button', { name: 'Fechar publicação' }).click();
        await expect(page.getByRole('dialog')).toHaveCount(0);
    });
}

test('intervalo inválido não consulta e pode ser corrigido', async ({ page, api }) => {
    await page.goto('/feed?type=ALL');
    await expect(page.getByText('Revise os filtros da URL.', { exact: false })).toBeVisible();
    expect(api.calls.filter(url => url.pathname === '/publications/feed' && url.searchParams.get('size') === '12')).toHaveLength(0);
    await page.getByRole('button', { name: 'Limpar filtros' }).click();
    await expect(page.getByRole('link', { name: 'Ver publicação completa: Aviso do clube', exact: true })).toBeVisible();
    await page.getByLabel('Publicada a partir de (UTC)').fill('2026-10-30T12:00:00Z');
    await page.getByLabel('Publicada até (UTC)').fill('2026-10-29T12:00:00Z');
    await page.getByRole('button', { name: 'Aplicar período' }).click();
    await expect(page.getByText('O fim deve ser igual ou posterior ao início.')).toBeVisible();
});

test('permission de detalhe é independente de feed e não consulta lista', async ({ page, api }) => {
    await api.grant(['PUBLICATION_READ']);
    await page.goto('/feed?publication=1');
    await expect(page.getByRole('dialog').getByText('Autor — identificação #7')).toBeVisible();
    expect(api.calls.filter(url => url.pathname === '/publications/feed')).toHaveLength(0);
    await page.getByRole('button', { name: 'Fechar publicação' }).click();
    await expect(page.getByText('Seu usuário não possui permissão para acessar o feed.')).toBeVisible();
});

test('permission de feed não autoriza detalhe direto', async ({ page, api }) => {
    await api.grant(['FEED_READ']);
    await page.goto('/feed?publication=1');
    await expect(page.getByRole('dialog').getByRole('alert')).toContainText('não possui permissão');
    expect(api.calls.filter(url => url.pathname === '/publications/1')).toHaveLength(0);
});

test('foco fica contido no diálogo e retorna ao link acionador', async ({ page }) => {
    await page.goto('/feed');
    const link = page.getByRole('link', { name: 'Ver publicação completa: Aviso do clube', exact: true });
    await link.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Aviso do clube' })).toBeVisible();
    for (let i = 0; i < 8; i++) {
        await page.keyboard.press('Tab');
        await expect.poll(() => dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press('Shift+Tab');
    await expect.poll(() => dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(link).toBeFocused();
});

test('paginação falha sem apagar cards e retoma sem duplicar IDs', async ({ page, api }) => {
    api.pages = 2;
    api.failPage = 1;
    await page.goto('/feed');
    await expect(page.getByRole('link', { name: 'Ver publicação completa: Aviso do clube', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Carregar mais publicações' }).scrollIntoViewIfNeeded();
    await expect(page.getByText('Não foi possível carregar mais publicações.')).toBeVisible();
    await expect(page.locator('article')).toHaveCount(3);
    api.failPage = -1;
    await page.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
    await expect(page.locator('article')).toHaveCount(6);
    await expect(page.getByRole('button', { name: 'Carregar mais publicações' })).toHaveCount(0);
    await expect.poll(() => api.calls.filter(url => url.searchParams.get('page') === '1').length).toBeGreaterThan(0);
});

test('resposta atrasada de filtro anterior não substitui seleção atual', async ({ page, api }) => {
    await page.goto('/feed');
    await expect(page.getByRole('link', { name: 'Ver publicação completa: Aviso do clube', exact: true })).toBeVisible();
    api.delay = 1000;
    await page.getByRole('button', { name: 'Avisos', exact: true }).click();
    await expect.poll(() => api.calls.some(url => url.searchParams.get('type') === 'NOTICE' && url.searchParams.get('size') === '12')).toBe(true);
    await page.getByRole('button', { name: 'Serviços', exact: true }).click();
    await expect(page.getByRole('link', { name: 'Ver publicação completa: Serviço anunciado', exact: true })).toBeVisible();
    await expect.poll(() => api.completed.some(url => url.searchParams.get('type') === 'NOTICE' && url.searchParams.get('size') === '12')).toBe(true);
    await expect(page.locator('article')).toHaveCount(1);
    await expect(page.locator('article')).toContainText('Serviço anunciado');
    await expect(page).toHaveURL(/type=SERVICE/);
});

test('revalidação 404 retira detalhe previamente disponível', async ({ page, api }) => {
    await page.goto('/feed?publication=1');
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Conteúdo completo para os associados.')).toBeVisible();
    api.detailStatus = 404;
    await dialog.getByRole('button', { name: 'Atualizar publicação' }).click();
    await expect(dialog.getByRole('alert')).toContainText('Publicação não encontrada');
    await expect(dialog.getByText('Conteúdo completo para os associados.')).toHaveCount(0);
});

for (const theme of ['light', 'dark']) {
    test(`tema ${theme} e conteúdo cabem no viewport`, async ({ page }) => {
        await page.addInitScript(value => localStorage.setItem('jeep-clube-theme', value), theme);
        await page.goto('/feed');
        await expect(page.getByRole('link', { name: 'Ver publicação completa: Aviso do clube', exact: true })).toBeVisible();
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        await page.getByRole('link', { name: 'Ver publicação completa: Aviso do clube', exact: true }).click();
        await expect(page.getByRole('dialog')).toBeVisible();
        expect(await page.getByRole('dialog').evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
    });
}

test('401 recuperável renova sessão sem perder o detalhe', async ({ page, api }) => {
    api.unauthorizedOnce = true;
    await page.goto('/feed?publication=1');
    await expect(page.getByRole('dialog').getByText('Autor — identificação #7')).toBeVisible();
    expect(api.calls.some(url => url.pathname === '/authentication/refresh')).toBe(true);
    await expect(page).toHaveURL(/publication=1/);
});

test('sessão expirada usa recuperação transversal e retorna à entrada pública', async ({ page, api }) => {
    api.unauthorizedOnce = true;
    api.refreshFails = true;
    await page.goto('/feed?publication=1');
    await expect(page).toHaveURL(new URL('/', page.url()).href);
    const cookies = await page.context().cookies();
    expect(cookies.some(cookie => ['AuthAccessToken', 'AuthRefreshToken', 'Me', 'Permissions'].includes(cookie.name))).toBe(false);
});

test('feed vazio e nenhum resultado são diferentes de falha', async ({ page, api }) => {
    api.empty = true;
    await page.goto('/feed');
    await expect(page.getByRole('heading', { name: 'Nenhuma publicação por aqui' })).toBeVisible();
    await page.getByRole('button', { name: 'Avisos', exact: true }).click();
    await expect(page.getByText('Nenhum resultado para os filtros selecionados.')).toBeVisible();
    await expect(page.locator('article')).toHaveCount(0);
});

test('URL inválida desabilita continuação mesmo com páginas no cache', async ({ page, api }) => {
    api.pages = 2;
    await page.goto('/feed');
    await expect(page.getByRole('link', { name: 'Ver publicação completa: Aviso do clube', exact: true })).toBeVisible();
    await page.evaluate(() => window.history.replaceState(null, '', '/feed?type=ALL'));
    await expect(page.getByText('Revise os filtros da URL.', { exact: false })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Atualizar publicações' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Carregar mais publicações' })).toHaveCount(0);
});

for (const status of [400, 500]) {
    test(`falha ${status} do feed oferece recuperação sem vazio`, async ({ page, api }) => {
        api.feedStatus = status;
        await page.goto('/feed');
        await expect(page.getByRole('button', { name: 'Tentar novamente', exact: true })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Nenhuma publicação por aqui' })).toHaveCount(0);
        api.feedStatus = 200;
        await page.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
        await expect(page.getByRole('link', { name: 'Ver publicação completa: Aviso do clube', exact: true })).toBeVisible();
    });
}
