import { test, expect } from './fixtures';

const socialActions = ['INTERACTION_LIKE', 'COMMENT_READ', 'COMMENT_CREATE'];
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');

for (const publication of [{ id: 1, type: 'NOTICE', title: 'Aviso do clube' }, { id: 2, type: 'EVENT', title: 'Passeio cancelado' }]) {
    test(`${publication.type}: curtir/descurtir reconcilia detalhe e feed com POST 200 e DELETE 204`, async ({ page, api }) => {
        await api.grant(socialActions);
        api.social[publication.id] = { likeCount: 8, commentCount: 0, likedByMe: false };
        await page.goto('/feed');
        const article = page.getByRole('article').filter({ has: page.getByRole('link', { name: `Ver publicação completa: ${publication.title}`, exact: true }) });
        await article.getByRole('button', { name: 'Curtir publicação', exact: true }).click();
        const liked = article.getByRole('button', { name: 'Remover curtida', exact: true });
        await expect(liked).toHaveAttribute('aria-pressed', 'true');
        await expect(liked).toHaveText('9');
        await article.getByRole('link', { name: `Ver publicação completa: ${publication.title}`, exact: true }).click();
        await expect(page).toHaveURL(new RegExp('/feed/' + publication.id + '$'));
        const detail = page.getByRole('dialog');
        await expect(detail.getByRole('button', { name: 'Remover curtida', exact: true })).toHaveText('9');
        await detail.getByRole('button', { name: 'Remover curtida', exact: true }).click();
        await expect(detail.getByRole('button', { name: 'Curtir publicação', exact: true })).toHaveText('8');
        await expect(detail.getByRole('button', { name: 'Curtir publicação', exact: true })).toHaveAttribute('aria-pressed', 'false');
        await detail.getByRole('button', { name: 'Fechar publicação', exact: true }).click();
        await expect(article.getByRole('button', { name: 'Curtir publicação', exact: true })).toHaveText('8');
        expect(api.writes.filter(call => call.pathname.includes('/likes')).map(call => call.method)).toEqual(['POST', 'DELETE']);
    });
}

test('operações idempotentes usam os totais relidos sem somar/subtrair o ID da curtida', async ({ page, api }) => {
    await api.grant(socialActions);
    api.idempotentLikes = true;
    api.social[1] = { likeCount: 41, commentCount: 0, likedByMe: false };
    await page.goto('/feed/1');
    await page.getByRole('button', { name: 'Curtir publicação', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Remover curtida', exact: true })).toHaveText('41');
    await page.getByRole('button', { name: 'Remover curtida', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Curtir publicação', exact: true })).toHaveText('41');
});

test('curtida confirmada permite recuperar contadores sem repetir a escrita', async ({ page, api }) => {
    await api.grant(socialActions);
    await page.goto('/feed/1');
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('button', { name: 'Curtir publicação', exact: true })).toBeVisible();
    api.detailStatus = 500;
    await dialog.getByRole('button', { name: 'Curtir publicação', exact: true }).click();
    await expect(dialog.getByRole('button', { name: 'Remover curtida', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(dialog.getByRole('alert')).toContainText('Não foi possível atualizar os contadores');
    api.detailStatus = 200;
    await dialog.getByRole('button', { name: 'Atualizar contadores', exact: true }).click();
    await expect(dialog.getByRole('button', { name: 'Remover curtida', exact: true })).toHaveText('1');
    expect(api.writes.filter(call => call.pathname.includes('/likes')).map(call => call.method)).toEqual(['POST']);
});

test('comentários bloqueiam vazio e aceitam texto, imagens e ambos com storageKey e ordem contínua', async ({ page, api }) => {
    await api.grant(socialActions);
    await page.goto('/feed/1');
    const comments = page.getByRole('region', { name: 'Comentários', exact: true });
    const submit = comments.getByRole('button', { name: 'Comentar', exact: true });
    await expect(submit).toBeDisabled();
    await comments.getByLabel('Seu comentário').fill('   ');
    await expect(submit).toBeDisabled();
    expect(api.writes.filter(call => call.pathname.endsWith('/comments'))).toHaveLength(0);
    await comments.getByLabel('Seu comentário').fill('Primeiro comentário de texto');
    await submit.click();
    await expect(comments.getByText('Primeiro comentário de texto', { exact: true })).toBeVisible();
    await expect(comments.getByLabel('Seu comentário')).toHaveValue('');
    // Use the browser chooser rather than interacting with the hidden file input.
    const chooser = page.waitForEvent('filechooser');
    await comments.getByRole('button', { name: /Adicionar imagens/ }).click();
    await (await chooser).setFiles([{ name: 'remover.png', mimeType: 'image/png', buffer: png }, { name: 'trilha.png', mimeType: 'image/png', buffer: png }]);
    await comments.getByRole('button', { name: 'Remover remover.png', exact: true }).click();
    await submit.click();
    await expect(comments.getByRole('img', { name: 'Imagem do comentário', exact: true })).toHaveCount(1);
    const secondChooser = page.waitForEvent('filechooser');
    await comments.getByRole('button', { name: /Adicionar imagens/ }).click();
    await (await secondChooser).setFiles({ name: 'grupo.png', mimeType: 'image/png', buffer: png });
    await comments.getByLabel('Seu comentário').fill('Foto e texto juntos');
    await submit.click();
    await expect(comments.getByText('Foto e texto juntos', { exact: true })).toBeVisible();
    await expect(comments.getByLabel('Seu comentário')).toHaveValue('');
    await expect(comments.getByText('Associado sintético', { exact: true }).first()).toBeVisible();
    const payloads = api.writes.filter(call => call.pathname === '/publications/1/comments').map(call => call.body);
    expect(payloads).toEqual([
        { text: 'Primeiro comentário de texto', images: [] },
        { text: null, images: [{ storageKey: api.uploadedKeys[0], position: 0 }] },
        { text: 'Foto e texto juntos', images: [{ storageKey: api.uploadedKeys[1], position: 0 }] },
    ]);
    expect(api.uploadedKeys).toHaveLength(2);
    expect(api.social[1].commentCount).toBe(3);
});

test('comentários paginam autoria, texto e imagens e apresentam carregamento, erro recuperável e vazio', async ({ page, api }) => {
    await api.grant(['COMMENT_READ']);
    api.comments[1] = Array.from({ length: 12 }, (_, index) => ({ id: index + 1, publicationId: 1, authorUserId: 7, text: `Comentário paginado ${index + 1}`, images: index === 10 ? [{ storageKey: 'images/comentario.jpg', position: 0 }] : [], createdAt: '2026-10-29T12:00:00Z' }));
    api.social[1] = { likedByMe: false, likeCount: 0, commentCount: 12 };
    api.commentsDelay = 800;
    await page.goto('/feed/1');
    const comments = page.getByRole('region', { name: 'Comentários', exact: true });
    await expect(comments.getByRole('status')).toContainText('Carregando comentários');
    await expect(comments.getByText('Comentário paginado 1', { exact: true })).toBeVisible();
    await expect(comments.getByLabel('Seu comentário')).toHaveCount(0);
    await comments.getByRole('button', { name: 'Próxima', exact: true }).click();
    await expect(comments.getByText('Comentário paginado 11', { exact: true })).toBeVisible();
    await expect(comments.getByRole('img', { name: 'Imagem do comentário', exact: true })).toBeVisible();
    await expect(comments.getByText('Comentário paginado 1', { exact: true })).toHaveCount(0);
    await expect(comments.getByRole('button', { name: 'Próxima', exact: true })).toBeDisabled();
    api.commentsStatus = 500;
    await comments.getByRole('button', { name: 'Anterior', exact: true }).click();
    await expect(comments.getByRole('alert')).toBeVisible();
    api.commentsStatus = 200; api.comments[1] = []; api.commentsDelay = 0;
    await comments.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
    await expect(comments.getByText('Ainda não há comentários.', { exact: true })).toBeVisible();
    expect(api.calls.some(url => url.pathname === '/publications/1/comments' && url.searchParams.get('page') === '1' && url.searchParams.get('size') === '10')).toBe(true);
});

test('permissões de ler/criar são independentes e SERVICE não exibe interação social', async ({ page, api }) => {
    await api.grant(['COMMENT_CREATE']);
    await page.goto('/feed/1');
    const comments = page.getByRole('region', { name: 'Comentários', exact: true });
    await expect(comments.getByLabel('Seu comentário')).toBeVisible();
    await expect(comments.getByText('Ainda não há comentários.', { exact: true })).toHaveCount(0);
    expect(api.calls.filter(url => url.pathname === '/publications/1/comments')).toHaveLength(0);
    await comments.getByLabel('Seu comentário').fill('Criar sem ler');
    await comments.getByRole('button', { name: 'Comentar', exact: true }).click();
    await expect(comments.getByLabel('Seu comentário')).toHaveValue('');
    expect(api.comments[1][0].text).toBe('Criar sem ler');
    await api.grant([]);
    await page.goto('/feed/1');
    await expect(page.getByRole('region', { name: 'Comentários', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Curtir publicação', exact: true })).toHaveCount(0);
    await api.grant(socialActions);
    await page.goto('/feed/3');
    await expect(page.getByRole('heading', { name: 'Serviço anunciado', exact: true })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Comentários', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Curtir publicação|Remover curtida/ })).toHaveCount(0);
    expect(api.calls.some(url => /^\/publications\/3\/(comments|likes)/.test(url.pathname))).toBe(false);
    await expect(page.getByRole('button', { name: /Responder|Excluir comentário|Editar comentário/ })).toHaveCount(0);
});
