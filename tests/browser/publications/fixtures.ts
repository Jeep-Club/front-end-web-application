import { test as base, expect } from '@playwright/test';
import { createServer } from 'node:http';
import { SignJWT } from 'jose';
import { readLocalUrl } from '../../../config/local-urls.cjs';

const instant = '2026-10-30T12:00:00.123456Z';
const storageKey = 'images/2026/10/30/550e8400-e29b-41d4-a716-446655440000.jpg';
const images = [{ storageKey, position: 0, primary: true }, { storageKey: storageKey.replace('0000.jpg', '0001.jpg'), position: 1, primary: false }];
const common = { authorUserId: 7, content: '<p>Conteúdo administrativo sintético.</p>', images };
const dates = { createdAt: instant, updatedAt: instant, publishedAt: null as string | null, archivedAt: null as string | null };
export const allActions = ['EVENT_READ_ADMIN', 'EVENT_CREATE', 'EVENT_UPDATE', 'EVENT_PUBLISH', 'EVENT_FINISH', 'EVENT_CANCEL', 'EVENT_DELETE', 'EVENT_ADMIN_DASHBOARD_READ', 'NOTICE_CREATE', 'NOTICE_READ', 'NOTICE_UPDATE', 'NOTICE_PUBLISH', 'NOTICE_ARCHIVE', 'NOTICE_DELETE', 'SERVICE_ADMIN_READ', 'SERVICE_ADMIN_DELETE', 'FEED_READ', 'PUBLICATION_READ'];
function initialState() {
    return {
        event: { ...common, id: 7, title: 'Passeio administrativo', publicationStatus: 'DRAFT', eventStatus: 'OPEN', startsAt: '2099-11-15T11:00:00Z', endsAt: null as string | null },
        notice: { ...common, ...dates, id: 8, title: 'Aviso administrativo', status: 'DRAFT' },
        service: { ...common, ...dates, id: 9, title: 'Serviço administrativo', sourceRequestId: 80, amount: 150, contactPhone: '12999999999', status: 'PUBLISHED' },
        rules: [{ eventId: 7, chargeDefinitionId: 4, requiredForParticipation: false, participationCutoff: '2099-11-15T11:00:00Z', financialDueDate: null as string | null }],
        calls: [] as { method: string; url: URL; body: Record<string, unknown> }[],
        patchStatus: 200, dashboardStatus: 200, publishStatus: 200, holdWrites: false, release: () => {}, missing: false, locked: false,
        deletedService: false, deletedNotice: false, deletedEvent: false, created: 0,
        feedItems: [] as { id: number; type: 'EVENT' | 'NOTICE' | 'SERVICE'; title: string; content: string; authorUserId: number; primaryImage: { storageKey: string; position: number; primary: boolean } | null; publishedAt: string; likeCount: number; commentCount: number; likedByMe: boolean; details: Record<string, unknown> }[],
        feedFailure: '' as string,
    };
}
type Api = ReturnType<typeof initialState> & { grant: (actions: string[]) => Promise<void> };
/** Isolated synthetic API receives real Server Function HTTP calls. No production credentials, queues or destructive remote services. */
export const test = base.extend<{ api: Api }>({
    api: [async ({ context, page }, runFixture, info) => {
        const app = readLocalUrl('PLAYWRIGHT_APP_URL');
        const apiUrl = readLocalUrl('PLAYWRIGHT_API_URL');
        if (Number(apiUrl.port) < 1024) throw new Error('Administration needs an unused local PLAYWRIGHT_API_URL port >=1024.');
        const sign = (data: object) => new SignJWT({ data }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('1h').sign(new TextEncoder().encode('playwright-local-session-not-for-production'));
        const grant = async (actions: string[]) => { await context.addCookies([{ name: 'Permissions', value: await sign([{ module: 'PUBLICATIONS', actions }]), url: app.origin, httpOnly: true }]); };
        const state: Api = { ...initialState(), grant };
        const errors: string[] = [];
        const forbidden: string[] = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.route('**/*', async route => { if (![app.origin, readLocalUrl('PLAYWRIGHT_STORYBOOK_URL').origin].includes(new URL(route.request().url()).origin)) { forbidden.push(route.request().url()); await route.abort(); } else await route.continue(); });
        const server = createServer(async (request, response) => {
            const url = new URL(request.url!, apiUrl);
            const method = request.method!;
            let text = ''; for await (const chunk of request) text += chunk.toString();
            let body: Record<string, unknown> = {}; if (request.headers['content-type']?.includes('application/json') && text) body = JSON.parse(text);
            state.calls.push({ method, url, body });
            const json = (data: unknown, status = 200) => { response.writeHead(status, { 'Content-Type': status >= 400 ? 'application/problem+json' : 'application/json' }); response.end(JSON.stringify(data)); };
            const fail = (status: number, code = 'EVENT_CHARGE_CONFIGURATION_LOCKED') => json({ status, code, detail: 'Condição sintética: releia os dados antes de decidir.' }, status);
            const paged = (content: unknown[], total = content.length) => { const number = Number(url.searchParams.get('page') ?? 0); const size = Number(url.searchParams.get('size') ?? 12); return { content, number, size, totalElements: total, totalPages: Math.ceil(total / size), numberOfElements: content.length, empty: !content.length, first: number === 0, last: (number + 1) * size >= total }; };
            if (url.pathname === '/media/images') { if (method === 'POST') return json({ storageKey }, 201); response.writeHead(200, { 'Content-Type': 'image/png' }); return response.end(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64')); }
            if (url.pathname === '/admin/events/charge-catalog') return json(paged([{ id: Number(url.searchParams.get('page')) ? 5 : 4, name: 'Definição elegível', description: null, defaultAmount: 50, required: false, paymentAcceptancePolicy: 'AFTER_DUE_DATE' }], 24));
            if (url.pathname === '/admin/events/7/charges') return json(state.rules);
            if (url.pathname === '/admin/events/7/dashboard') {
                if (state.dashboardStatus !== 200) return fail(state.dashboardStatus);
                return json({ registrations: state.locked ? [{ id: 11, eventId: 7, userId: 7, status: 'CANCELLED', allocations: [], createdAt: instant, confirmedAt: null, cancelledAt: instant, unallocatedDependentIds: [] }] : [], dependents: 0, guestsPending: 0, guestsApproved: 0, totalPeople: 0, vehicles: 0, totalCapacity: 0, availableSeats: 0, unpaidCharges: 0, pendingValidation: 0, postCutoffPending: 0, financial: [], guestsStandby: 0, guestsAllocated: 0, guestsCancelled: 0 });
            }
            if (url.pathname === '/admin/events' && method === 'GET') return json(paged(state.deletedEvent ? [] : [state.event], state.deletedEvent ? 0 : 25));
            if (['/admin/events', '/admin/notices'].includes(url.pathname) && method === 'POST') { state.created++; const target = url.pathname.endsWith('events') ? state.event : state.notice; Object.assign(target, body); return json(target, 201); }
            const match = /^\/admin\/(events|notices|services)\/(\d+)(?:\/(publish|archive|cancel|finish))?$/.exec(url.pathname);
            if (match) {
                const resource = match[1]; const action = match[3];
                if (state.missing || resource === 'services' && state.deletedService || resource === 'notices' && state.deletedNotice || resource === 'events' && state.deletedEvent) return fail(404, resource === 'events' ? 'EVENT_NOT_FOUND' : resource === 'notices' ? 'NOTICE_NOT_FOUND' : 'SERVICE_NOT_FOUND');
                const target = resource === 'events' ? state.event : resource === 'notices' ? state.notice : state.service;
                if (method === 'DELETE') { if (resource === 'services') state.deletedService = true; else if (resource === 'notices') state.deletedNotice = true; else state.deletedEvent = true; response.writeHead(204); return response.end(); }
                if (method === 'PATCH') {
                    if (state.patchStatus !== 200) return fail(state.patchStatus);
                    Object.assign(target, Object.fromEntries(Object.entries(body).filter(([key]) => key !== 'charges')));
                    if (Array.isArray(body.charges)) state.rules = body.charges.map((rule, index) => { const entry = rule as Record<string, unknown>; return { eventId: 7, chargeDefinitionId: Number(entry.chargeDefinitionId ?? 100 + index), requiredForParticipation: !!entry.requiredForParticipation, participationCutoff: String(entry.participationCutoff ?? state.event.startsAt), financialDueDate: entry.financialDueDate ? String(entry.financialDueDate) : null }; });
                }
                if (method === 'POST') {
                    if (state.holdWrites) await new Promise<void>(resolve => { state.release = resolve; });
                    if (action === 'publish') { if (state.publishStatus !== 200) return fail(state.publishStatus, 'NOTICE_INVALID_STATE'); if (resource === 'events') state.event.publicationStatus = 'PUBLISHED'; else state.notice.status = 'PUBLISHED'; }
                    if (action === 'archive') { state.notice.status = 'ARCHIVED'; state.notice.archivedAt = instant; }
                    if (action === 'cancel') state.event.eventStatus = 'CANCELLED';
                    if (action === 'finish') state.event.eventStatus = 'FINISHED';
                }
                return json(target);
            }
            if (url.pathname === '/identity/me') return json({ id: 7, name: 'Administrador sintético', cpf: '12345678909', birthDate: '1995-05-12', email: null, rg: null, phoneNumber: null, profilePhotoStorageKey: null, status: 'ACTIVE', createdAt: instant, updatedAt: null, disabledAt: null });
            if (url.pathname === '/publications/feed') {
                const type = url.searchParams.get('type');
                if (type && type === state.feedFailure) return fail(503);
                const from = url.searchParams.get('publishedFrom'); const to = url.searchParams.get('publishedTo');
                const items = state.feedItems.filter(item => (!type || item.type === type) && (!from || new Date(item.publishedAt).getTime() >= new Date(from).getTime()) && (!to || new Date(item.publishedAt).getTime() <= new Date(to).getTime()));
                const number = Number(url.searchParams.get('page') ?? 0);
                const size = Number(url.searchParams.get('size') ?? 12);
                return json(paged(items.slice(number * size, (number + 1) * size), items.length));
            }
            return fail(404, 'NOT_FOUND');
        });
        await new Promise<void>((resolve, reject) => { server.once('error', reject); server.listen(Number(apiUrl.port), apiUrl.hostname, resolve); });
        await context.addCookies([
            { name: 'AuthAccessToken', value: 'synthetic-access', url: app.origin }, { name: 'AuthRefreshToken', value: 'synthetic-refresh', url: app.origin }, { name: 'AccessTokenExpiration', value: new Date(Date.now() + 3600000).toISOString(), url: app.origin },
            { name: 'Me', value: await sign({ userId: 7, userName: 'Administrador sintético', sessionId: 1, sessionActive: true, expires: new Date(Date.now() + 3600000).toISOString() }), url: app.origin, httpOnly: true },
        ]);
        await grant(allActions);
        await context.addInitScript(() => { localStorage.setItem('tour_initial_seen_v1', 'true'); localStorage.setItem('tour_completed_member', 'true'); localStorage.setItem('tour_completed_admin', 'true'); });
        try { await runFixture(state); }
        finally { try { if (!page.isClosed()) { const path = info.outputPath('administration.png'); await page.screenshot({ path, fullPage: true, animations: 'disabled' }); await info.attach('administration', { path, contentType: 'image/png' }); } } finally { state.release(); server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())); } expect(errors).toEqual([]); expect(forbidden).toEqual([]); }
    }, { auto: true }],
});
export { expect };
