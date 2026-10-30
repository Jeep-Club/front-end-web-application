import { test, expect } from './fixtures';

test('lista é padrão e alternância preserva página sem nova consulta', async ({ page, api }) => {
    await page.goto('/admin/publications/event?page=1&size=12');
    await expect(page.getByRole('button', { name: 'Lista', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('ID #7', { exact: true })).toBeVisible();
    await expect(page.getByText('Rascunho', { exact: true })).toBeVisible();
    const count = api.calls.filter(call => call.url.pathname === '/admin/events').length;
    await page.getByRole('button', { name: 'Grade', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Grade', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page).toHaveURL(/page=1/);
    await expect(page.getByRole('heading', { name: 'Passeio administrativo' })).toBeVisible();
    expect(api.calls.filter(call => call.url.pathname === '/admin/events')).toHaveLength(count);
    await page.getByRole('button', { name: 'Lista', exact: true }).click();
    expect(api.calls.filter(call => call.url.pathname === '/admin/events')).toHaveLength(count);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('busca por ID abre aviso em rascunho ausente do feed e valida entrada', async ({ page, api }) => {
    await page.goto('/admin/publications/notice');
    const field = page.getByRole('textbox', { name: 'Pesquisar por título ou ID' });
    await page.getByRole('button', { name: 'Buscar', exact: true }).click();
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    await field.fill('8'); await field.press('Enter');
    await expect(page).toHaveURL(/notice\/8$/);
    await expect(page.getByText('Estado editorial: DRAFT')).toBeVisible();
    expect(api.calls.some(call => call.url.pathname === '/admin/notices/8')).toBe(true);
});

test('busca global por título e filtros sem contrato ficam indisponíveis', async ({ page, api }) => {
    await page.goto('/admin/publications/notice');
    await page.getByRole('combobox', { name: 'Pesquisar por', exact: true }).click();
    await page.getByRole('option', { name: 'Título', exact: true }).click();
    const field = page.getByRole('textbox', { name: 'Pesquisar por título ou ID' });
    await field.fill('123');
    await expect(page.getByRole('button', { name: 'Buscar', exact: true })).toBeDisabled();
    await expect(page.getByText('Pesquisa global por título ainda não disponível na API.')).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Prioridade', exact: true })).toBeDisabled();
    await expect(page.getByRole('combobox', { name: 'Validade', exact: true })).toBeDisabled();
    await expect(page.getByRole('combobox', { name: 'Estado editorial', exact: true })).toBeDisabled();
    await field.press('Enter');
    expect(api.calls.some(call => call.url.pathname === '/admin/notices/123')).toBe(false);
    await page.getByRole('button', { name: 'Limpar pesquisa' }).click();
    await expect(field).toHaveValue('');
});

test('ordenar eventos usa API, reinicia página e mantém visualização', async ({ page, api }) => {
    await page.goto('/admin/publications/event?page=1&view=grid');
    await page.getByRole('combobox', { name: 'Ordenação', exact: true }).click();
    await page.getByRole('option', { name: 'Início: ordem crescente' }).click();
    await expect(page).toHaveURL(/page=0/);
    await expect.poll(() => api.calls.filter(call => call.url.pathname === '/admin/events').at(-1)?.url.searchParams.getAll('sort')).toEqual(['startsAt,asc', 'id,desc']);
    await expect(page.getByRole('button', { name: 'Grade', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'Limpar filtros', exact: true }).click();
    await expect.poll(() => api.calls.filter(call => call.url.pathname === '/admin/events').at(-1)?.url.searchParams.get('sort')).toBe('id,desc');
});

test('período publicado aplica limite real e limpar remove filtros e rascunhos', async ({ page, api }) => {
    api.feedItems = [{ id: 8, type: 'NOTICE', title: 'Aviso publicado', content: 'Conteúdo', authorUserId: 7, primaryImage: null, publishedAt: '2026-10-30T12:00:00Z', likeCount: 0, commentCount: 0, likedByMe: false, details: {} }];
    await page.goto('/admin/publications/notice?view=grid');
    const start = page.getByLabel('Período de publicação — data inicial');
    await start.fill('01112026');
    await page.getByRole('button', { name: 'Abrir calendário: Período de publicação' }).click();
    await page.getByRole('button', { name: 'Aplicar', exact: true }).click();
    await expect.poll(() => api.calls.filter(call => call.url.pathname === '/publications/feed').at(-1)?.url.searchParams.get('publishedFrom')).toBe('2026-11-01T03:00:00.000000000Z');
    await expect(page.getByText('Nenhuma publicação encontrada', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Limpar filtros', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Aviso publicado', exact: true })).toBeVisible();
    await expect(page).not.toHaveURL(/publishedFrom/);
    await expect(page.getByRole('button', { name: 'Grade', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('ID inexistente mantém tratamento de erro e ausência de READ bloqueia busca', async ({ page, api }) => {
    api.missing = true;
    await page.goto('/admin/publications/service');
    await page.getByRole('textbox', { name: 'Pesquisar por título ou ID' }).fill('999');
    await page.getByRole('button', { name: 'Buscar', exact: true }).click();
    await expect(page.getByText('Serviço não encontrado.', { exact: true })).toBeVisible();
    await api.grant(['EVENT_CREATE']);
    await page.goto('/admin/publications/event');
    await expect(page.getByRole('button', { name: 'Buscar', exact: true })).toBeDisabled();
    expect(api.calls.some(call => call.url.pathname === '/admin/events/999')).toBe(false);
});
