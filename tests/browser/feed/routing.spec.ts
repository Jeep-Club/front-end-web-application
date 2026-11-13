import { test, expect } from './fixtures';

test('criação interceptada mantém o feed e acesso direto fecha sem histórico', async ({ page, api }) => {
    await api.grant(['NOTICE_CREATE']);
    await page.goto('/feed?type=NOTICE');
    await page.getByRole('button', { name: 'Criar aviso', exact: true }).click();
    await expect(page).toHaveURL(/\/feed\/new\?type=NOTICE/);
    await expect(page.locator('article')).toHaveCount(1);
    await expect(page.getByRole('dialog').getByRole('heading', { name: 'Criar aviso' })).toBeVisible();
    await page.getByRole('dialog').getByRole('button', { name: 'Cancelar', exact: true }).click();
    await expect(page).toHaveURL(/\/feed\?type=NOTICE$/);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.goto('/feed/new?type=NOTICE');
    await page.getByRole('dialog').getByRole('button', { name: 'Fechar', exact: true }).click();
    await expect(page).toHaveURL(/\/feed\?type=NOTICE$/);
    await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('edição interceptada usa endpoint editorial e retorna ao detalhe', async ({ page, api }) => {
    await api.grant(['NOTICE_READ', 'NOTICE_UPDATE']);
    await page.goto('/feed');
    await page.getByRole('link', { name: 'Editar: Aviso do clube', exact: true }).click();
    await expect(page).toHaveURL(/\/feed\/1\/edit$/);
    await expect(page.locator('article')).toHaveCount(3);
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Editar publicação' })).toBeVisible();
    await dialog.getByRole('textbox', { name: 'Título', exact: true }).fill('Aviso atualizado');
    await dialog.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
    await expect(page).toHaveURL(/\/feed\/1$/);
    await expect(page.getByRole('dialog').getByRole('heading', { name: 'Aviso atualizado' })).toBeVisible();
    await page.getByRole('button', { name: 'Fechar publicação' }).click();
    await expect(page).toHaveURL(/\/feed$/);
    await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('ações de criação e edição respeitam permissões e SERVICE', async ({ page, api }) => {
    await api.grant([]);
    await page.goto('/feed');
    await expect(page.getByRole('button', { name: /Criar (publicação|aviso|evento)/ })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /^Editar:/ })).toHaveCount(0);
    await page.goto('/feed/1/edit');
    await expect(page.getByRole('alert').filter({ hasText: 'não tem permissão' })).toBeVisible();
    await page.goto('/feed/3/edit');
    await expect(page.getByRole('alert').filter({ hasText: 'não tem permissão' })).toBeVisible();
});

test('inscrição interceptada e acesso direto preservam filtros e tratam ausência de inscrição', async ({ page, api }) => {
    api.eventOpen = true;
    await api.grant(['EVENT_REGISTER', 'EVENT_REGISTRATION_READ']);
    await page.goto('/feed/2?type=EVENT&page=0');
    await page.getByRole('button', { name: 'Participar do evento', exact: true }).click();
    await expect(page).toHaveURL(/\/feed\/2\/register\?type=EVENT&page=0$/);
    await expect(page.getByRole('heading', { name: 'Como você vai participar?', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page).toHaveURL(/\/feed\/2\?type=EVENT&page=0$/);
    await expect(page.getByRole('dialog')).toHaveCount(1);
    await page.goto('/feed/2/register?type=EVENT&page=0');
    await page.getByRole('button', { name: 'Fechar', exact: true }).click();
    await expect(page).toHaveURL(/\/feed\/2\?type=EVENT&page=0$/);
    expect(api.calls.some(url => url.pathname === '/events/2/registrations/me')).toBe(true);
});

test('404 de evento na inscrição continua sendo erro recuperável', async ({ page, api }) => {
    api.eventOpen = true;
    api.registrationErrorCode = 'EVENT_NOT_FOUND';
    await api.grant(['EVENT_REGISTER', 'EVENT_REGISTRATION_READ']);
    await page.goto('/feed/2');
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('alert')).toContainText('Não foi possível verificar sua inscrição');
    await expect(dialog.getByRole('button', { name: 'Participar do evento', exact: true })).toHaveCount(0);
    api.registrationErrorCode = 'EVENT_REGISTRATION_NOT_FOUND';
    await dialog.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
    await expect(dialog.getByRole('button', { name: 'Participar do evento', exact: true })).toBeVisible();
});
