import { test, expect } from './fixtures';
import type { Page } from '@playwright/test';

async function openAction(page: Page, label: string) {
    await page.getByRole('button', { name: /^Ações:/ }).click();
    await page.getByRole('menuitem', { name: label, exact: true }).click();
}


test('central usa página real, mantém URL e consulta aviso por ID', async ({ page, api }) => {
    await page.goto('/admin/publications/event?page=1&size=12');
    await expect(page.getByRole('link', { name: 'Passeio administrativo' })).toBeVisible();
    expect(api.calls.filter(call => call.url.pathname === '/admin/events')).toHaveLength(1);
    expect(api.calls.some(call => call.url.pathname.includes('export'))).toBe(false);
    await page.getByRole('link', { name: 'Passeio administrativo' }).click();
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
    await expect(page.getByText('Estado editorial: Rascunho')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('edição editorial omite agenda e preserva galeria; Escape devolve foco', async ({ page, api }) => {
    await page.goto('/admin/publications/event/7');
    await openAction(page, 'Editar');
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('textbox', { name: 'Título', exact: true }).fill('Título editado');
    await dialog.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Título editado' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'breadcrumb' }).getByText('Título editado', { exact: true })).toBeVisible();
    expect(api.calls.find(call => call.method === 'PATCH')?.body).toEqual({ title: 'Título editado' });
    await openAction(page, 'Editar');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^Ações:/ })).toBeFocused();
});

test('galeria retida reordena e muda capa sem upload', async ({ page, api }) => {
    await page.goto('/admin/publications/notice/8');
    await openAction(page, 'Editar');
    const dialog = page.getByRole('dialog');
    const gallery = dialog.getByRole('grid', { name: 'Imagens da publicação' });
    await gallery.getByRole('row').nth(1).getByRole('button', { name: 'Definir como capa' }).click();
    const handle = gallery.getByRole('row').nth(1).getByRole('button', { name: /Reordenar/ });
    await handle.focus();
    await expect(handle).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await expect(gallery.getByRole('row').first()).toContainText('Capa do aviso');
    await dialog.getByRole('button', { name: 'Salvar alterações' }).click();
    await expect(dialog).toHaveCount(0);
    const body = api.calls.find(call => call.method === 'PATCH')!.body;
    expect(body).not.toHaveProperty('title');
    expect((body.images as { primary: boolean; position: number }[]).map(image => [image.position, image.primary])).toEqual([[0, true], [1, false]]);
    expect(api.calls.some(call => call.method === 'POST' && call.url.pathname === '/media/images')).toBe(false);
});

test('configuração mantém regras fora da página, adiciona inline e remove explicitamente', async ({ page, api }) => {
    await page.goto('/admin/publications/event/7');
    await page.getByRole('button', { name: 'Configurar associação' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Próximo catálogo' }).click();
    await expect(dialog.getByText('Catálogo: página 2 de 2')).toBeVisible();
    await dialog.getByRole('button', { name: 'Adicionar cobrança' }).click();
    const row = dialog.getByRole('group', { name: 'Cobrança 2', exact: true });
    await row.getByRole('combobox', { name: 'Origem da definição' }).click();
    await page.getByRole('option', { name: 'Criar definição inline' }).click();
    await row.getByRole('textbox', { name: 'Nome da definição' }).fill('Transporte especial');
    await row.getByRole('textbox', { name: 'Valor da definição' }).fill('25,123');
    const required = row.getByRole('checkbox', { name: 'Cobrança obrigatória' });
    await required.focus(); await page.keyboard.press('Space');
    await expect(required).toBeChecked();
    await dialog.getByRole('button', { name: 'Salvar regras financeiras', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    const charges = api.calls.find(call => call.method === 'PATCH')!.body.charges as Record<string, unknown>[];
    expect(charges).toHaveLength(2); expect(charges[0].chargeDefinitionId).toBe(4); expect(charges[1]).toMatchObject({ name: 'Transporte especial', amount: 25.123, billingRequired: true, requiredForParticipation: false });
    await page.getByRole('button', { name: 'Configurar associação' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Remover cobrança 2', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Remover cobrança 1', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Salvar regras financeiras', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(api.calls.filter(call => call.method === 'PATCH').at(-1)!.body).toEqual({ charges: [] });
});

test('conflito mantém edição e relê recurso sem repetir PATCH', async ({ page, api }) => {
    await page.goto('/admin/publications/event/7');
    await openAction(page, 'Editar');
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
    await openAction(page, 'Publicar');
    api.holdWrites = true;
    await page.getByRole('dialog').getByRole('button', { name: 'Publicar', exact: true }).click();
    await expect(page.getByRole('dialog').getByRole('button', { name: 'Processando...' })).toBeDisabled();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect.poll(() => api.calls.some(call => call.method === 'POST' && call.url.pathname.endsWith('/publish'))).toBe(true);
    api.holdWrites = false; api.release();
    await expect(page.getByText('Estado editorial: Publicado')).toBeVisible();
    await openAction(page, 'Arquivar');
    await expect(page.getByRole('dialog')).toContainText('arquivamento é terminal');
    await page.getByRole('dialog').getByRole('button', { name: 'Arquivar', exact: true }).click();
    await expect(page.getByText('Estado editorial: Arquivado')).toBeVisible();
    await page.getByRole('button', { name: /^Ações:/ }).click();
    await expect(page.getByRole('menuitem', { name: 'Editar' })).toHaveCount(0);
    await page.getByRole('menuitem', { name: 'Excluir', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Excluir', exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/publications\/notice$/);
    expect(api.calls.filter(call => call.method === 'POST' && call.url.pathname.endsWith('/publish'))).toHaveLength(1);
    expect(api.deletedNotice).toBe(true);
});

test('DRAFT operacional encerra sem arquivar e serviço só oferece exclusão', async ({ page, api }) => {
    api.event.eventStatus = 'IN_PROGRESS';
    await page.goto('/admin/publications/event/7');
    await openAction(page, 'Encerrar evento');
    await page.getByRole('dialog').getByRole('button', { name: 'Encerrar evento', exact: true }).click();
    await expect(page.getByText('Estado operacional: Finalizado')).toBeVisible();
    await expect(page.getByText('Estado editorial: Rascunho')).toBeVisible();
    await page.goto('/admin/publications/service/9');
    await expect(page.getByText('Solicitação de origem', { exact: true }).locator('..')).toContainText('#80');
    await page.getByRole('button', { name: /^Ações:/ }).click();
    await expect(page.getByRole('menuitem', { name: /Editar|Publicar|Arquivar/ })).toHaveCount(0);
    await page.getByRole('menuitem', { name: 'Excluir', exact: true }).click();
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
    await expect(page.getByRole('button', { name: 'Configurar associação' })).toBeDisabled();
    await openAction(page, 'Editar');
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
    await expect(page.getByRole('button', { name: /^Ações:/ })).toHaveCount(0);
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
    await expect(dialog.getByText('Capa do aviso', { exact: true })).toBeVisible();
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
    await openAction(page, 'Editar');
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
    await openAction(page, 'Editar');
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
    const date = dialog.getByRole('group', { name: 'Início', exact: true });
    const segments = date.getByRole('spinbutton');
    for (const [index, value] of ['15', '11', '2099', '11', '00'].entries()) {
        await segments.nth(index).fill(value);
    }
    await dialog.locator('input[type=file]').setInputFiles({ name: 'synthetic.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64') });
    await page.getByRole('button', { name: 'Usar foto', exact: true }).click();
    await dialog.getByRole('button', { name: 'Continuar para cobranças' }).click();
    await expect(dialog.getByText('Regras de cobrança', { exact: true })).toBeVisible();
    expect(api.created).toBe(0);
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
    const opener = page.getByRole('button', { name: /^Ações:/ });
    await openAction(page, 'Editar');
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

test('criação mantém campos e erros roláveis e alterna o tema', async ({ page, api }) => {
    await api.grant(['EVENT_READ_ADMIN', 'EVENT_CREATE', 'NOTICE_READ', 'NOTICE_CREATE', 'SERVICE_ADMIN_READ', 'SERVICE_REQUEST_CREATE']);
    await page.setViewportSize({ width: 800, height: 650 });
    await page.goto('/admin/publications');
    const theme = page.getByRole('button', { name: 'Alternar tema' });
    await theme.click();
    const selectedTheme = await page.locator('html').getAttribute('data-theme');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', selectedTheme!);
    for (const route of ['event', 'notice', 'service', '']) {
        await page.goto('/admin/publications' + (route ? '/' + route : ''));
        await page.getByRole('button', { name: 'Criar publicação', exact: true }).click();
        const dialog = page.getByRole('dialog');
        const scroll = dialog.locator('form > div.overflow-y-auto');
        if (route === 'event') {
            await dialog.getByRole('button', { name: 'Abrir calendário: Início' }).click();
            await expect(dialog.locator('.jeep-calendar-popover')).toBeVisible();
            await page.keyboard.press('Escape');
        }
        await expect.poll(() => scroll.evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true);
        const action = route === 'event' || route === '' ? dialog.getByRole('button', { name: 'Continuar para cobranças' }) : dialog.locator('button[type=submit]');
        await action.click();
        await expect(dialog.getByText('Campo obrigatório.').first()).toBeVisible();
        await scroll.evaluate(element => { element.scrollTop = element.scrollHeight; });
        await expect(dialog.getByText('Galeria de imagens')).toBeVisible();
        const bounds = await dialog.evaluate(element => {
            const footer = element.querySelector('form > div:last-child')!.getBoundingClientRect();
            const area = element.querySelector('form > div.overflow-y-auto')!.getBoundingClientRect();
            return { areaBottom: area.bottom, footerTop: footer.top };
        });
        expect(bounds.areaBottom).toBeLessThanOrEqual(bounds.footerTop);
        await page.mouse.click(1, 1);
        await expect(dialog).not.toBeVisible();
    }
});

test('cadastro móvel mantém o seletor acima do modal e protege o rascunho', async ({ page, api }) => {
    await api.grant(['EVENT_CREATE']);
    await page.setViewportSize({ width: 390, height: 700 });
    await page.goto('/admin/publications/event');
    await page.getByRole('button', { name: 'Criar publicação', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Criar evento', exact: true });
    const bounds = (await dialog.boundingBox())!;
    expect(bounds.height).toBeGreaterThan(650);
    expect(bounds.y).toBeGreaterThan(0);
    await dialog.getByRole('textbox', { name: 'Título', exact: true }).fill('Rascunho preservado');
    await dialog.getByRole('button', { name: 'Abrir calendário: Início' }).click();
    const sheet = page.locator('.jeep-calendar-popover');
    await expect(sheet.getByRole('button', { name: 'Concluir' })).toBeVisible();
    await page.mouse.click(2, 2);
    await expect(sheet).toBeHidden();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('textbox', { name: 'Título', exact: true })).toHaveValue('Rascunho preservado');
});

test('menu de ações da listagem respeita estado e confirma publicação', async ({ page, api }) => {
    await page.goto('/admin/publications/event');
    const item = page.getByRole('article').filter({ has: page.getByRole('link', { name: 'Passeio administrativo' }) });
    await item.getByRole('button', { name: /Ações:/ }).click();
    await expect(page.getByRole('menuitem', { name: 'Acessar' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Editar' })).toBeVisible();
    await page.getByRole('menuitem', { name: 'Publicar' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Publicar', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect.poll(() => api.calls.some(call => call.method === 'POST' && call.url.pathname.endsWith('/publish'))).toBe(true);
});

test('exclusão pela listagem confirma e atualiza os resultados', async ({ page, api }) => {
    await page.goto('/admin/publications/event');
    const item = page.getByRole('article').filter({ has: page.getByRole('link', { name: 'Passeio administrativo' }) });
    await item.getByRole('button', { name: /Ações:/ }).click();
    await page.getByRole('menuitem', { name: 'Excluir', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('Exclusão irreversível');
    await dialog.getByRole('button', { name: 'Excluir', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Passeio administrativo' })).toHaveCount(0);
    expect(api.deletedEvent).toBe(true);
});

test('menu de ações suporta teclado e telas reduzidas nos dois temas', async ({ page }) => {
    for (const [width, theme] of [[320, 'light'], [768, 'dark'], [1280, 'light']] as const) {
        await page.setViewportSize({ width, height: 720 });
        await page.goto('/admin/publications/event');
        await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
        const item = page.getByRole('article').filter({ has: page.getByRole('link', { name: 'Passeio administrativo' }) });
        const trigger = item.getByRole('button', { name: /Ações:/ });
        await trigger.focus();
        await page.keyboard.press('Enter');
        await expect(page.getByRole('menuitem', { name: 'Acessar' })).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(trigger).toBeFocused();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
});

test('edição pela listagem carrega o detalhe antes de abrir o formulário', async ({ page, api }) => {
    await page.goto('/admin/publications/event');
    const item = page.getByRole('article').filter({ has: page.getByRole('link', { name: 'Passeio administrativo' }) });
    await item.getByRole('button', { name: /Ações:/ }).click();
    await page.getByRole('menuitem', { name: 'Editar', exact: true }).click();
    await expect(page.getByRole('dialog').getByRole('textbox', { name: 'Título', exact: true })).toHaveValue('Passeio administrativo');
    expect(api.calls.some(call => call.url.pathname === '/admin/events/7')).toBe(true);
});

test('detalhes organizam conteúdo e informações em desktop e celular', async ({ page }, testInfo) => {
    for (const [route, title] of [['event/7', 'Passeio administrativo'], ['notice/8', 'Aviso administrativo'], ['service/9', 'Serviço administrativo']] as const) {
        for (const [width, theme] of [[390, 'light'], [768, 'dark'], [1024, 'dark']] as const) {
            await page.setViewportSize({ width, height: 850 });
            await page.goto(`/admin/publications/${route}`);
            await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
            await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
            const information = page.getByRole('complementary', { name: 'Informações gerais' });
            const gallery = page.getByRole('region', { name: 'Galeria de imagens' });
            await expect(page.getByRole('region', { name: 'Conteúdo', exact: true })).toBeVisible();
            const infoBounds = (await information.boundingBox())!;
            const galleryBounds = (await gallery.boundingBox())!;
            if (width >= 1024) expect(infoBounds.x).toBeGreaterThan(galleryBounds.x + galleryBounds.width - 1);
            else expect(infoBounds.y + infoBounds.height).toBeLessThanOrEqual(galleryBounds.y);
            await expect(page.getByRole('button', { name: /^Ações:/ })).toBeVisible();
            expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
            if (route === 'event/7') await page.screenshot({ path: testInfo.outputPath(`detalhe-${width}.png`), animations: 'disabled' });
        }
    }
});
