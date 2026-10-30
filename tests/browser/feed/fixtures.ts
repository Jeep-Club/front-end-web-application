import { test as base, expect } from '@playwright/test';
import { createServer } from 'node:http';
import { SignJWT } from 'jose';
import { readLocalUrl } from '../../../config/local-urls.cjs';

const instant = '2026-10-29T12:00:00.123456Z';
const key = 'images/2026/10/29/550e8400-e29b-41d4-a716-446655440000.jpg';
export const publications = [
    { id: 1, type: 'NOTICE', title: 'Aviso do clube', details: {} },
    { id: 2, type: 'EVENT', title: 'Passeio cancelado', details: { startsAt: '2027-11-10T12:00:00Z', endsAt: '2027-11-10T13:00:00Z', status: 'CANCELLED' } },
    { id: 3, type: 'SERVICE', title: 'Serviço anunciado', details: { amount: 150, contactPhone: '12999999999' } },
].map(item => ({ ...item, authorUserId: 7, content: '<p>Conteúdo completo para os associados.</p>', publishedAt: instant, primaryImage: { storageKey: key, position: 0, primary: true }, likeCount: 0, commentCount: 0, likedByMe: false }));

type ApiState = { calls: URL[]; completed: URL[]; feedStatus: number; detailStatus: number; mediaFails: boolean; actions: string[]; delay: number; pages: number; failPage: number; empty: boolean; unauthorizedOnce: boolean; refreshFails: boolean; eventOpen: boolean; grant: (actions: string[]) => Promise<void>; };

/** Synthetic API/session only. Runs real Next Server Functions without using production or weakening the GET-only pilot fixture. */
export const test = base.extend<{ api: ApiState }>({
    api: [async ({ context, page }, runFixture, testInfo) => {
        const apiUrl = readLocalUrl('PLAYWRIGHT_API_URL');
        if (Number(apiUrl.port) < 1024) throw new Error('Feed tests need PLAYWRIGHT_API_URL on an unused local port >=1024.');
        const sign = (data: object) => new SignJWT({ data }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('1h').sign(new TextEncoder().encode('playwright-local-session-not-for-production'));
        const appUrl = readLocalUrl('PLAYWRIGHT_APP_URL');
        const grant = async (actions: string[]) => { await context.addCookies([{ name: 'Permissions', value: await sign([{ module: 'PUBLICATIONS', actions }]), url: appUrl.origin, httpOnly: true }]); };
        const state: ApiState = { calls: [], completed: [], feedStatus: 200, detailStatus: 200, mediaFails: false, actions: ['FEED_READ', 'PUBLICATION_READ'], delay: 0, pages: 1, failPage: -1, empty: false, unauthorizedOnce: false, refreshFails: false, eventOpen: false, grant };
        const errors: string[] = [];
        const forbidden: string[] = [];
        const allowed = [appUrl.origin, readLocalUrl('PLAYWRIGHT_STORYBOOK_URL').origin];
        page.on('pageerror', error => errors.push(error.message));
        await page.route('**/*', async route => {
            if (!allowed.includes(new URL(route.request().url()).origin)) { forbidden.push(route.request().url()); await route.abort(); }
            else await route.continue();
        });
        const server = createServer(async (request, response) => {
            const url = new URL(request.url!, apiUrl);
            state.calls.push(url);
            response.once('finish', () => state.completed.push(url));
            const json = (data: unknown, status = 200) => { response.writeHead(status, { 'Content-Type': status >= 400 ? 'application/problem+json' : 'application/json' }); response.end(JSON.stringify(data)); };
            const failure = (status: number) => json({ status, code: ({ 400: 'PUBLICATION_FEED_INVALID', 401: 'INVALID_ACCESS_TOKEN', 402: 'MEMBERSHIP_PAYMENT_REQUIRED', 403: 'ACCESS_DENIED', 404: 'PUBLICATION_NOT_FOUND', 503: 'MEMBERSHIP_CHARGE_UNAVAILABLE' } as Record<number, string>)[status] ?? 'INTERNAL_SERVER_ERROR', detail: 'Resposta sintética corrigível.' }, status);
            if (url.pathname === '/publications/feed') {
                if (state.delay && url.searchParams.get('type') === 'NOTICE') await new Promise(resolve => setTimeout(resolve, state.delay));
                if (state.feedStatus !== 200) return failure(state.feedStatus);
                const number = Number(url.searchParams.get('page') ?? 0);
                if (number === state.failPage) return failure(500);
                const size = Number(url.searchParams.get('size') ?? 20);
                const items = state.empty ? [] : publications.filter(item => !url.searchParams.has('type') || item.type === url.searchParams.get('type'));
                const content = number < state.pages ? items.map(item => ({ ...item, id: item.id + number * 3 })) : [];
                return json({ content, number, size, totalElements: items.length * state.pages, totalPages: state.pages, numberOfElements: content.length, empty: !content.length, first: number === 0, last: number >= state.pages - 1 });
            }
            if (/^\/publications\/\d+$/.test(url.pathname)) {
                if (state.unauthorizedOnce) { state.unauthorizedOnce = false; return failure(401); }
                if (state.detailStatus !== 200) return failure(state.detailStatus);
                const item = publications.find(item => item.id === Number(url.pathname.split('/').pop()));
                if (!item) return failure(404);
                const { primaryImage, ...detail } = item;
                return json({ ...detail, details: state.eventOpen && detail.type === 'EVENT' ? { ...detail.details, status: 'OPEN' } : detail.details, images: [primaryImage, { storageKey: key.replace('0000.jpg', '0001.jpg'), position: 1, primary: false }] });
            }
            if (url.pathname === '/media/images') {
                if (state.mediaFails) return failure(404);
                response.writeHead(200, { 'Content-Type': 'image/png' });
                return response.end(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64'));
            }
            if (url.pathname === '/identity/me') return json({ id: 7, name: 'Associado sintético', cpf: '12345678909', birthDate: '1995-05-12', email: null, rg: null, phoneNumber: null, profilePhotoStorageKey: null, status: 'ACTIVE', createdAt: instant, updatedAt: null, disabledAt: null });
            if (url.pathname === '/authentication/refresh') {
                if (state.refreshFails) return failure(401);
                return json({ accessToken: 'synthetic-refreshed', refreshToken: 'synthetic-refresh', expiresInSeconds: 3600 });
            }
            if (url.pathname === '/authentication/logout') { response.writeHead(204); return response.end(); }
            return failure(404);
        });
        await new Promise<void>((resolve, reject) => { server.once('error', reject); server.listen(Number(apiUrl.port), apiUrl.hostname, resolve); });
        await context.addCookies([
            { name: 'AuthAccessToken', value: 'synthetic-access', url: appUrl.origin },
            { name: 'AuthRefreshToken', value: 'synthetic-refresh', url: appUrl.origin },
            { name: 'AccessTokenExpiration', value: new Date(Date.now() + 3600000).toISOString(), url: appUrl.origin },
            { name: 'Me', value: await sign({ userId: 7, userName: 'Associado sintético', sessionId: 1, sessionActive: true, expires: new Date(Date.now() + 3600000).toISOString() }), url: appUrl.origin, httpOnly: true },
            { name: 'Permissions', value: await sign([{ module: 'PUBLICATIONS', actions: state.actions }]), url: appUrl.origin, httpOnly: true },
        ]);
        await context.addInitScript(() => { localStorage.setItem('tour_initial_seen_v1', 'true'); localStorage.setItem('tour_completed_member', 'true'); });
        try { await runFixture(state); }
        finally {
            try {
                if (!page.isClosed()) {
                    const path = testInfo.outputPath('feed.png');
                    await page.screenshot({ path, fullPage: true, animations: 'disabled' });
                    await testInfo.attach('feed', { path, contentType: 'image/png' });
                }
            } finally {
                server.closeAllConnections();
                await new Promise<void>(resolve => server.close(() => resolve()));
            }
            expect(errors, 'JavaScript errors').toEqual([]);
            expect(forbidden, 'Requests outside isolated origins').toEqual([]);
        }
    }, { auto: true }],
});
export { expect };
