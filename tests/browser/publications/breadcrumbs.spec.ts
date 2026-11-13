import { test, expect } from './fixtures';

for (const [route, area, title, id] of [
    ['event', 'Eventos', 'Passeio administrativo', 7],
    ['notice', 'Avisos', 'Aviso administrativo', 8],
    ['service', 'Serviços', 'Serviço administrativo', 9],
] as const) {
    test(`breadcrumb de ${area} mostra a área e o nome da publicação`, async ({ page }) => {
        await page.goto(`/admin/publications/${route}`);
        const breadcrumb = page.getByRole('navigation', { name: 'breadcrumb' });
        await expect(breadcrumb.getByRole('link', { name: 'Publicações' })).toHaveAttribute('href', '/admin/publications');
        await expect(breadcrumb.getByText(area, { exact: true })).toBeVisible();
        await page.goto(`/admin/publications/${route}/${id}`);
        await expect(breadcrumb.getByRole('link', { name: area, exact: true })).toHaveAttribute('href', new RegExp(`/admin/publications/${route}`));
        await expect(breadcrumb.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/feed');
        await expect(breadcrumb.getByRole('link', { name: 'Gestão Administrativa' })).toHaveAttribute('href', '/admin');
        await expect(breadcrumb.getByRole('link', { name: 'Publicações' })).toHaveAttribute('href', '/admin/publications');
        await expect(breadcrumb.getByText(title, { exact: true })).toHaveAttribute('aria-current', 'page');
        await page.reload();
        await expect(breadcrumb.getByText(title, { exact: true })).toBeVisible();
    });
}

test('breadcrumb informa indisponibilidade quando a publicação não existe', async ({ page, api }) => {
    api.missing = true;
    await page.goto('/admin/publications/notice/8');
    await expect(page.getByRole('navigation', { name: 'breadcrumb' }).getByText('Aviso indisponível')).toBeVisible();
    await expect(page.getByText('Aviso não encontrado.', { exact: true })).toBeVisible();
});
