import { test, expect } from './fixtures';

test('central usa página real, mantém URL e consulta aviso por ID', async ({ page, api }) => {
    await page.goto('/admin/publications/event?page=1&size=12');
    await expect(page.getByRole('link', { name: 'Administrar evento' })).toBeVisible();
    expect(api.calls.filter(call => call.url.pathname === '/admin/events')).toHaveLength(1);
    expect(api.calls.some(call => call.url.pathname.includes('export'))).toBe(false);
    await page.getByRole('link', { name: 'Administrar evento' }).click();
    await expect(page.getByRole('heading', { name: 'Passeio administrativo' })).toBeVisible();
    await page.getByRole('link', { name: 'Voltar aos eventos' }).click();
    await expect(page).toHaveURL(/page=1/);
    await page.getByRole('button', { name: 'Avisos', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Avisos', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Buscar', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'Pesquisar por título ou ID' })).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText('Informe um ID positivo válido.')).toBeVisible();
    await page.getByRole('textbox', { name: 'Pesquisar por título ou ID' }).fill('8');
    await page.getByRole('button', { name: 'Buscar', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Aviso administrativo' })).toBeVisible();
    await page.reload();
    await expect(page.getByText('Estado editorial: DRAFT')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('edição editorial omite agenda e preserva galeria; Escape devolve foco', async ({ page, api }) => {
    await page.goto('/admin/publications/event/7');
    const edit = page.getByRole('button', { name: 'Editar evento', exact: true });
    await edit.click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('textbox', { name: 'Título', exact: true }).fill('Título editado');
    await dialog.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Título editado' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'breadcrumb' }).getByText('Título editado', { exact: true })).toBeVisible();
    expect(api.calls.find(call => call.method === 'PATCH')?.body).toEqual({ title: 'Título editado' });
    await edit.click();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(edit).toBeFocused();
});

test('galeria retida reordena e muda capa sem upload', async ({ page, api }) => {
    await page.goto('/admin/publications/notice/8');
    await page.getByRole('button', { name: 'Editar aviso' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('radio', { name: 'Capa da imagem 2' }).check();
    await dialog.getByRole('button', { name: 'Mover imagem 2 para cima' }).click();
    await dialog.getByRole('button', { name: 'Salvar alterações' }).click();
    await expect(dialog).toHaveCount(0);
    const body = api.calls.find(call => call.method === 'PATCH')!.body;
    expect(body).not.toHaveProperty('title');
    expect((body.images as { primary: boolean; position: number }[]).map(image => [image.position, image.primary])).toEqual([[0, true], [1, false]]);
    expect(api.calls.some(call => call.method === 'POST' && call.url.pathname === '/media/images')).toBe(false);
});

test('configuração mantém regras fora da página, adiciona inline e remove explicitamente', async ({ page, api }) => {
    await page.goto('/admin/publications/event/7');
    await page.getByRole('button', { name: 'Configurar cobranças' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Próximo catálogo' }).click();
    await expect(dialog.getByText('Catálogo: página 2 de 2')).toBeVisible();
    await dialog.getByRole('button', { name: 'Adicionar cobrança' }).click();
    const row = dialog.getByRole('group', { name: 'Cobrança 2', exact: true });
    await row.getByRole('combobox', { name: 'Origem da definição' }).click();
    await page.getByRole('option', { name: 'Criar definição inline' }).click();
    await row.getByRole('textbox', { name: 'Nome da definição' }).fill('Transporte especial');
    await row.getByRole('textbox', { name: 'Valor da definição' }).fill('25,123');
    const required = row.getByRole('checkbox', { name: 'Obrigação financeira (billingRequired)' });
    await required.focus(); await page.keyboard.press('Space');
    await expect(required).toBeChecked();
    await dialog.getByRole('button', { name: 'Salvar regras financeiras', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    const charges = api.calls.find(call => call.method === 'PATCH')!.body.charges as Record<string, unknown>[];
    expect(charges).toHaveLength(2); expect(charges[0].chargeDefinitionId).toBe(4); expect(charges[1]).toMatchObject({ name: 'Transporte especial', amount: 25.123, billingRequired: true, requiredForParticipation: false });
    await page.getByRole('button', { name: 'Configurar cobranças' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Remover cobrança 2', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Remover cobrança 1', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Salvar regras financeiras', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(api.calls.filter(call => call.method === 'PATCH').at(-1)!.body).toEqual({ charges: [] });
});

test('conflito mantém edição e relê recurso sem repetir PATCH', async ({ page, api }) => {
    await page.goto('/admin/publications/event/7');
    await page.getByRole('button', { name: 'Editar evento' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('textbox', { name: 'Título', exact: true }).fill('Preservado em conflito');
    api.patchStatus = 409;
    const reads = api.calls.filter(call => call.method === 'GET' && call.url.pathname === '/admin/events/7').length;
    await dialog.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
    await expect(dialog.getByRole('alert')).toContainText('Os dados foram relidos');
    await expect(dialog.getByRole('textbox', { name: 'Título', exact: true })).toHaveValue('Preservado em conflito');
    expect(api.calls.filter(call => call.method === 'PATCH')).toHaveLength(1);
    await expect.poll(() => api.calls.filter(call => call.method === 'GET' && call.url.pathname === '/admin/events/7').length).toBeGreaterThan(reads);
    api.patchStatus = 200;
    await dialog.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Preservado em conflito' })).toBeVisible();
});

test('aviso publica, arquiva e exclui; pending impede fechar ou repetir', async ({ page, api }) => {
    await page.goto('/admin/publications/notice/8');
    await page.getByRole('button', { name: 'Publicar aviso', exact: true }).click();
    api.holdWrites = true;
    await page.getByRole('dialog').getByRole('button', { name: 'Publicar', exact: true }).click();
    await expect(page.getByRole('dialog').getByRole('button', { name: 'Processando...' })).toBeDisabled();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect.poll(() => api.calls.some(call => call.method === 'POST' && call.url.pathname.endsWith('/publish'))).toBe(true);
    api.holdWrites = false; api.release();
    await expect(page.getByText('Estado editorial: PUBLISHED')).toBeVisible();
    await page.getByRole('button', { name: 'Arquivar aviso' }).click();
    await expect(page.getByRole('dialog')).toContainText('arquivamento é terminal');
    await page.getByRole('dialog').getByRole('button', { name: 'Arquivar', exact: true }).click();
    await expect(page.getByText('Estado editorial: ARCHIVED')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Editar aviso' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Excluir aviso' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Excluir', exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/publications\/notice$/);
    expect(api.calls.filter(call => call.method === 'POST' && call.url.pathname.endsWith('/publish'))).toHaveLength(1);
    expect(api.deletedNotice).toBe(true);
});

test('DRAFT operacional encerra sem arquivar e serviço só oferece exclusão', async ({ page, api }) => {
    api.event.eventStatus = 'IN_PROGRESS';
    await page.goto('/admin/publications/event/7');
    await page.getByRole('button', { name: 'Encerrar evento', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Encerrar evento', exact: true }).click();
    await expect(page.getByText('Estado operacional: FINISHED')).toBeVisible();
    await expect(page.getByText('Estado editorial: DRAFT')).toBeVisible();
    await page.goto('/admin/publications/service/9');
    await expect(page.getByText(/Solicitação de origem #80/)).toBeVisible();
    await expect(page.getByRole('button', { name: /Editar serviço|Publicar serviço|Arquivar serviço/ })).toHaveCount(0);
    await page.getByRole('button', { name: 'Excluir serviço' }).click();
    await expect(page.getByRole('dialog')).toContainText('Serviços mantêm pedidos e propostas');
    await page.getByRole('dialog').getByRole('button', { name: 'Excluir', exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/publications\/service$/);
    expect(api.deletedService).toBe(true);
    expect(api.calls.some(call => call.method === 'DELETE' && call.url.pathname.includes('requests'))).toBe(false);
});

test('dashboard bloqueia agenda por inscrição cancelada; erro regional preserva editorial', async ({ page, api }) => {
    api.locked = true;
    await page.goto('/admin/publications/event/7');
    await expect(page.getByText(/Agenda e cobranças bloqueadas:/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Configurar cobranças' })).toBeDisabled();
    await page.getByRole('button', { name: 'Editar evento' }).click();
    await expect(page.getByRole('dialog').getByLabel('Início', { exact: true })).toBeDisabled();
    await expect(page.getByRole('dialog').getByRole('textbox', { name: 'Título', exact: true })).toBeEnabled();
    await page.keyboard.press('Escape');
    api.dashboardStatus = 500;
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Passeio administrativo' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tentar dashboard novamente' })).toBeVisible();
});

test('leitura e criação isoladas não liberam rotas ou chamadas alheias', async ({ page, api }) => {
    await api.grant(['NOTICE_READ']);
    await page.goto('/admin/publications/notice/8');
    await expect(page.getByRole('heading', { name: 'Aviso administrativo' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Editar aviso' })).toHaveCount(0);
    expect(api.calls.some(call => call.url.pathname.startsWith('/admin/events'))).toBe(false);
    await api.grant(['EVENT_CREATE']);
    await page.goto('/admin/publications/event');
    await expect(page.getByText('Você pode criar eventos, mas não possui permissão para consultar a lista.')).toBeVisible();
    await page.getByRole('button', { name: 'Criar publicação', exact: true }).click();
    await expect(page.getByRole('dialog').getByRole('heading', { name: 'Criar evento' })).toBeVisible();
    await expect.poll(() => api.calls.some(call => call.url.pathname === '/admin/events/charge-catalog')).toBe(true);
    await page.keyboard.press('Escape');
    await page.goto('/admin/publications/event/7');
    await expect(page.getByRole('heading', { name: 'Administrar evento' })).toHaveCount(0);
});

test('criação de aviso mantém ID para criador sem READ e upload real isolado', async ({ page, api }) => {
    await api.grant(['NOTICE_CREATE']);
    await page.goto('/admin/publications/notice');
    await page.getByRole('button', { name: 'Criar publicação', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Criar aviso', exact: true });
    await dialog.getByRole('textbox', { name: 'Título', exact: true }).fill('Novo aviso');
    await dialog.getByRole('textbox', { name: /^Conteúdo/ }).fill('Conteúdo do cadastro.');
    await dialog.locator('input[type=file]').setInputFiles({ name: 'synthetic.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64') });
    await page.getByRole('button', { name: 'Usar foto', exact: true }).click();
    await expect(dialog.getByRole('radio', { name: 'Capa da imagem 1' })).toBeChecked();
    await dialog.getByRole('button', { name: 'Criar rascunho', exact: true }).click();
    await expect(dialog).toContainText('salva com ID');
    await expect(dialog.getByRole('link', { name: /Administrar publicação/ })).toHaveCount(0);
    expect(api.created).toBe(1);
    const writes = api.calls.filter(call => call.method === 'POST');
    expect(writes.map(call => call.url.pathname)).toEqual(['/media/images', '/admin/notices']);
    expect(writes[1].body).not.toHaveProperty('type');
    expect(writes[1].body).not.toHaveProperty('startsAt');
});

test('404 tem recuperação e 403 de escrita mantém sessão e dados', async ({ page, api }) => {
    api.missing = true;
    await page.goto('/admin/publications/notice/8');
    await expect(page.getByText('Aviso não encontrado.', { exact: true })).toBeVisible();
    api.missing = false;
    await page.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Aviso administrativo' })).toBeVisible();
    await page.getByRole('button', { name: 'Editar aviso' }).click();
    await page.getByRole('dialog').getByRole('textbox', { name: 'Título', exact: true }).fill('Preservar após 403');
    api.patchStatus = 403;
    await page.getByRole('dialog').getByRole('button', { name: 'Salvar alterações' }).click();
    await expect(page.getByRole('dialog').getByRole('alert')).toBeVisible();
    await expect(page.getByRole('dialog').getByRole('textbox', { name: 'Título', exact: true })).toHaveValue('Preservar após 403');
    await expect(page).toHaveURL(/notice\/8/);
});

test('remoção do término envia null e preserva início intocado', async ({ page, api }) => {
    api.event.endsAt = '2099-11-15T13:00:00Z';
    await page.goto('/admin/publications/event/7');
    await page.getByRole('button', { name: 'Editar evento' }).click();
    await page.getByRole('dialog').getByLabel('Término (opcional)', { exact: true }).fill('');
    await page.getByRole('dialog').getByRole('button', { name: 'Salvar alterações' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(api.calls.find(call => call.method === 'PATCH')!.body).toEqual({ endsAt: null });
});

test('falha de publish após criar evento conserva ID e não repete cadastro', async ({ page, api }) => {
    await api.grant(['EVENT_CREATE', 'EVENT_PUBLISH', 'FEED_READ']);
    api.publishStatus = 409;
    await page.goto('/feed?type=EVENT');
    await page.getByRole('button', { name: 'Criar evento', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Criar evento', exact: true });
    await dialog.getByRole('textbox', { name: 'Título', exact: true }).fill('Evento recuperável');
    await dialog.getByRole('textbox', { name: /^Conteúdo/ }).fill('Conteúdo recuperável.');
    await dialog.getByLabel('Início').fill('2099-11-15T11:00');
    await dialog.locator('input[type=file]').setInputFiles({ name: 'synthetic.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64') });
    await page.getByRole('button', { name: 'Usar foto', exact: true }).click();
    await dialog.getByRole('button', { name: 'Criar e publicar evento', exact: true }).click();
    await expect(dialog).toContainText('salva com ID');
    await expect(dialog).toContainText('Não crie novamente');
    await expect(dialog.getByRole('link')).toHaveCount(0);
    expect(api.created).toBe(1);
    expect(api.calls.filter(call => call.method === 'POST' && call.url.pathname === '/admin/events')).toHaveLength(1);
    expect(api.calls.filter(call => call.method === 'POST' && call.url.pathname.endsWith('/publish'))).toHaveLength(1);
    await page.keyboard.press('Escape');
    expect(api.created).toBe(1);
});

test('modal contém Tab e Shift+Tab e devolve foco ao fechar', async ({ page }) => {
    await page.goto('/admin/publications/event/7');
    const opener = page.getByRole('button', { name: 'Editar evento', exact: true });
    await opener.click();
    const dialog = page.getByRole('dialog');
    const first = dialog.getByRole('button', { name: 'Fechar', exact: true });
    const last = dialog.getByRole('button', { name: 'Salvar alterações', exact: true });
    await last.focus(); await page.keyboard.press('Tab');
    await expect(first).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(last).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(opener).toBeFocused();
});

for (const [route, title] of [['notice', 'Criar aviso'], ['event', 'Criar evento'], ['service', 'Criar serviço']] as const) {
    test('rota ' + route + ' fixa o tipo de criação após recarregar', async ({ page, api }) => {
        await api.grant(['NOTICE_CREATE', 'EVENT_CREATE', 'SERVICE_REQUEST_CREATE']);
        await page.goto('/admin/publications/' + route + '?type=NOTICE');
        await page.reload();
        await page.getByRole('button', { name: 'Criar publicação', exact: true }).click();
        const dialog = page.getByRole('dialog');
        await expect(dialog.getByRole('heading', { name: title, exact: true })).toBeVisible();
        await expect(dialog.getByRole('combobox', { name: 'Tipo de publicação' })).toHaveCount(0);
        await page.keyboard.press('Escape');
        await expect(dialog).toHaveCount(0);
    });
}

test('permissão de criar eventos não oferece criação na área de avisos', async ({ page, api }) => {
    await api.grant(['NOTICE_READ', 'EVENT_CREATE']);
    await page.goto('/admin/publications/notice');
    await expect(page.getByRole('heading', { name: 'Avisos', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Criar publicação', exact: true })).toHaveCount(0);
});
