import { test, expect } from '../fixtures';
import { readLocalUrl } from '../../../config/local-urls.cjs';
const storybook = readLocalUrl('PLAYWRIGHT_STORYBOOK_URL');
// IDs discovered by the installed Storybook CLI after adding the stories.
for (const theme of ['light', 'dark']) {
    test(`lista e grade documentadas preservam conteúdo em ${theme}`, async ({ page }) => {
        await page.goto(new URL(`/iframe.html?id=publicações-listagem-administrativa--alternancia&viewMode=story&embed=true&globals=theme:${theme}`, storybook).href);
        await expect(page.getByRole('button', { name: 'Lista', exact: true })).toHaveAttribute('aria-pressed', 'true');
        await expect(page.getByText('ID #8', { exact: true })).toBeVisible();
        await page.getByRole('button', { name: 'Grade', exact: true }).click();
        await expect(page.getByText('Ponto de encontro e orientações para a trilha.')).toBeVisible();
        await page.getByRole('button', { name: 'Lista', exact: true }).click();
        await expect(page.getByText('Ponto de encontro e orientações para a trilha.')).toHaveCount(0);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
    test(`pesquisa documentada valida ID e explicita título indisponível em ${theme}`, async ({ page }) => {
        await page.goto(new URL(`/iframe.html?id=publicações-pesquisa-e-filtros--eventos&viewMode=story&embed=true&globals=theme:${theme}`, storybook).href);
        await page.getByRole('button', { name: 'Buscar', exact: true }).click();
        await expect(page.getByText('Informe um ID positivo válido.')).toBeVisible();
        await page.getByRole('combobox', { name: 'Pesquisar por', exact: true }).click();
        await page.getByRole('option', { name: 'Título', exact: true }).click();
        await expect(page.getByRole('button', { name: 'Buscar', exact: true })).toBeDisabled();
        await expect(page.getByText('Pesquisa global por título ainda não disponível na API.')).toBeVisible();
        await page.getByRole('button', { name: 'Limpar filtros', exact: true }).click();
        await expect(page.getByRole('button', { name: 'Buscar', exact: true })).toBeEnabled();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
    test(`estados de lista e filtros documentados em ${theme}`, async ({ page }) => {
        for (const [id, text] of [['publicações-listagem-administrativa--vazia', 'Nenhuma publicação encontrada'], ['publicações-listagem-administrativa--erro', 'Não foi possível carregar as publicações.'], ['publicações-listagem-administrativa--carregando', 'Publicações'], ['publicações-pesquisa-e-filtros--avisos', 'Filtros de estado, prioridade e validade ainda não disponíveis na API.'], ['publicações-pesquisa-e-filtros--servicos', 'Filtros de estado e categoria ainda não disponíveis na API.'], ['publicações-pesquisa-e-filtros--sem-permissao', 'Você não possui permissão para consultar o detalhe administrativo.']]) {
            await page.goto(new URL(`/iframe.html?id=${id}&viewMode=story&embed=true&globals=theme:${theme}`, storybook).href);
            if (id.endsWith('--erro')) await expect(page.getByRole('alert')).toContainText(text);
            else await expect(page.getByText(text, { exact: true })).toBeVisible();
        }
    });
}
