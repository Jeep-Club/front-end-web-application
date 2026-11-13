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

type Comment = { id: number; publicationId: number; authorUserId: number; text: string; images: { storageKey: string; position: number }[]; createdAt: string };
type Social = { likeCount: number; commentCount: number; likedByMe: boolean };
type ApiState = {
    notice: { title: string; content: string };
    social: Record<number, Social>;
    comments: Record<number, Comment[]>;
    writes: { method: string; pathname: string; body: Record<string, unknown> }[];
    uploadedKeys: string[];
    commentsStatus: number;
    commentsDelay: number;
    idempotentLikes: boolean;
    registrationErrorCode: string;
    calls: URL[]; completed: URL[]; feedStatus: number; detailStatus: number; mediaFails: boolean; actions: string[]; delay: number; pages: number; failPage: number; empty: boolean; unauthorizedOnce: boolean; refreshFails: boolean; eventOpen: boolean; eventStartsAt: string | null; grant: (actions: string[]) => Promise<void>; };

/** Synthetic API/session only. Runs real Next Server Functions without using production or weakening the GET-only pilot fixture. */
export const test = base.extend<{ api: ApiState }>({
    api: [async ({ context, page }, runFixture, testInfo) => {
        const apiUrl = readLocalUrl('PLAYWRIGHT_API_URL');
        if (Number(apiUrl.port) < 1024) throw new Error('Feed tests need PLAYWRIGHT_API_URL on an unused local port >=1024.');
        const sign = (data: object) => new SignJWT({ data }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('1h').sign(new TextEncoder().encode('playwright-local-session-not-for-production'));
        const appUrl = readLocalUrl('PLAYWRIGHT_APP_URL');
        const grant = async (actions: string[]) => { await context.addCookies([{ name: 'Permissions', value: await sign([{ module: 'PUBLICATIONS', actions }]), url: appUrl.origin, httpOnly: true }]); };
        const state: ApiState = { registrationErrorCode: 'EVENT_REGISTRATION_NOT_FOUND', notice: { title: publications[0].title, content: publications[0].content }, social: {}, comments: {}, writes: [], uploadedKeys: [], commentsStatus: 200, commentsDelay: 0, idempotentLikes: false, calls: [], completed: [], feedStatus: 200, detailStatus: 200, mediaFails: false, actions: ['FEED_READ', 'PUBLICATION_READ'], delay: 0, pages: 1, failPage: -1, empty: false, unauthorizedOnce: false, refreshFails: false, eventOpen: false, eventStartsAt: null, grant };
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
            const method = request.method ?? 'GET';
            let rawBody = '';
            for await (const chunk of request) rawBody += chunk.toString();
            const body: Record<string, unknown> = request.headers['content-type']?.includes('application/json') && rawBody ? JSON.parse(rawBody) : {};
            if (method !== 'GET') state.writes.push({ method, pathname: url.pathname, body });
            state.calls.push(url);
            response.once('finish', () => state.completed.push(url));
            const json = (data: unknown, status = 200) => { response.writeHead(status, { 'Content-Type': status >= 400 ? 'application/problem+json' : 'application/json' }); response.end(JSON.stringify(data)); };
            const failure = (status: number) => json({ status, code: ({ 400: 'PUBLICATION_FEED_INVALID', 401: 'INVALID_ACCESS_TOKEN', 402: 'MEMBERSHIP_PAYMENT_REQUIRED', 403: 'ACCESS_DENIED', 404: 'PUBLICATION_NOT_FOUND', 503: 'MEMBERSHIP_CHARGE_UNAVAILABLE' } as Record<number, string>)[status] ?? 'INTERNAL_SERVER_ERROR', detail: 'Resposta sintética corrigível.' }, status);
            const paged = (items: unknown[]) => {
                const number = Number(url.searchParams.get('page') ?? 0);
                const size = Number(url.searchParams.get('size') ?? 10);
                const content = items.slice(number * size, (number + 1) * size);
                return { content, number, size, totalElements: items.length, totalPages: Math.ceil(items.length / size), numberOfElements: content.length, empty: !content.length, first: number === 0, last: (number + 1) * size >= items.length };
            };
            const socialMatch = /^\/publications\/(\d+)\/(likes(?:\/me)?|comments)$/.exec(url.pathname);
            if (socialMatch) {
                const id = Number(socialMatch[1]);
                const item = publications.find(item => item.id === id);
                if (!item || item.type === 'SERVICE') return failure(404);
                const social = state.social[id] ??= { likeCount: item.likeCount, commentCount: item.commentCount, likedByMe: item.likedByMe };
                if (socialMatch[2] === 'likes' && method === 'POST') {
                    if (!social.likedByMe && !state.idempotentLikes) social.likeCount++;
                    social.likedByMe = true;
                    // Deliberately unrelated to the total: this is the like's row ID.
                    return json({ id: 91234, publicationId: id, createdAt: instant });
                }
                if (socialMatch[2] === 'likes/me' && method === 'DELETE') {
                    if (social.likedByMe && !state.idempotentLikes) social.likeCount--;
                    social.likedByMe = false;
                    response.writeHead(204); return response.end();
                }
                if (socialMatch[2] === 'comments') {
                    if (state.commentsDelay) await new Promise(resolve => setTimeout(resolve, state.commentsDelay));
                    if (state.commentsStatus !== 200) return failure(state.commentsStatus);
                    const comments = state.comments[id] ??= [];
                    if (method === 'POST') {
                        const text = typeof body.text === 'string' ? body.text.trim() : '';
                        const images = Array.isArray(body.images) ? body.images as Comment['images'] : [];
                        if (!text && !images.length || images.some((image, index) => !image.storageKey || image.position !== index)) return failure(400);
                        const comment = { id: 1000 + comments.length, publicationId: id, authorUserId: 7, text, images, createdAt: instant };
                        comments.unshift(comment); social.commentCount = comments.length;
                        return json(comment, 201);
                    }
                    return json(paged(comments));
                }
                return failure(404);
            }
            if (url.pathname === '/admin/notices/1') {
                if (method === 'PATCH' || method === 'PUT') {
                    if (typeof body.title === 'string') state.notice.title = body.title;
                    if (typeof body.content === 'string') state.notice.content = body.content;
                }
                return json({ id: 1, authorUserId: 7, ...state.notice, status: 'PUBLISHED', images: [publications[0].primaryImage], createdAt: instant, updatedAt: instant, publishedAt: instant, archivedAt: null });
            }
            if (url.pathname === '/events/2/participants') return json(paged([]));
            if (url.pathname === '/events/2/registrations/me') return json({ status: 404, code: state.registrationErrorCode, detail: 'Inscrição não encontrada.' }, 404);
            if (url.pathname === '/vehicles/list/member') return json(paged([]));
            if (url.pathname === '/dependents') return json([]);
            if (url.pathname === '/publications/feed') {
                if (state.delay && url.searchParams.get('type') === 'NOTICE') await new Promise(resolve => setTimeout(resolve, state.delay));
                if (state.feedStatus !== 200) return failure(state.feedStatus);
                const number = Number(url.searchParams.get('page') ?? 0);
                if (number === state.failPage) return failure(500);
                const size = Number(url.searchParams.get('size') ?? 20);
                const items = state.empty ? [] : publications.filter(item => !url.searchParams.has('type') || item.type === url.searchParams.get('type'));
                const content = number < state.pages ? items.map(item => ({ ...item, id: item.id + number * 3, ...(item.id === 1 ? state.notice : {}), ...state.social[item.id + number * 3], ...(item.type === 'EVENT' && state.eventStartsAt ? { details: { ...item.details, startsAt: state.eventStartsAt } } : {}) })) : [];
                return json({ content, number, size, totalElements: items.length * state.pages, totalPages: state.pages, numberOfElements: content.length, empty: !content.length, first: number === 0, last: number >= state.pages - 1 });
            }
            if (/^\/publications\/\d+$/.test(url.pathname)) {
                if (state.unauthorizedOnce || state.refreshFails) { state.unauthorizedOnce = false; return failure(401); }
                if (state.detailStatus !== 200) return failure(state.detailStatus);
                const item = publications.find(item => item.id === Number(url.pathname.split('/').pop()));
                if (!item) return failure(404);
                const { primaryImage, ...detail } = item;
                return json({ ...detail, ...(detail.id === 1 ? state.notice : {}), ...state.social[detail.id], details: state.eventOpen && detail.type === 'EVENT' ? { ...detail.details, status: 'OPEN' } : detail.details, images: [primaryImage, { storageKey: key.replace('0000.jpg', '0001.jpg'), position: 1, primary: false }] });
            }
            if (url.pathname === '/media/images') {
                if (method === 'POST') {
                    const storageKey = key.replace('0000.jpg', String(state.uploadedKeys.length + 10).padStart(4, '0') + '.jpg');
                    state.uploadedKeys.push(storageKey);
                    return json({ storageKey }, 201);
                }
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
