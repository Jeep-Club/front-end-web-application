import { test, expect } from '@playwright/test';
import http from 'node:http';
import fs from 'node:fs/promises';
import { once } from 'node:events';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { seedContractAudit } from './seed-contract-audit.mjs';
import { auditCases } from './contract-cases.mjs';
import { testPng, fakeCpf } from './local-api.mjs';
import { readActionFrame } from './action-wire.mjs';
const { load } = createRequire(import.meta.url)('./schema-runtime.cjs');

test.use({ channel: process.env.E2E_BROWSER_CHANNEL || 'chrome' });
let seed, next, baseURL;
const report = [];
const adminRoutes = ['identity/admin/users?size=1', 'authorization/roles', 'admin/tools?size=1', 'vehicles/list/admin?size=1', 'admin/medical-profiles?size=1', 'billing/charge-definitions?size=1', 'billing/member-payments?size=1'];

test.beforeAll(async () => {
    test.setTimeout(120000);
    seed = await seedContractAudit();
    const reservation = http.createServer(); reservation.listen(0, '127.0.0.1'); await once(reservation, 'listening');
    const port = reservation.address().port; await new Promise(resolve => reservation.close(resolve));
    baseURL = `http://127.0.0.1:${port}`;
    let logs = '';
    next = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', String(port)], {
        env: { ...process.env, API_URL: seed.baseURL, API_FRONTEND_KEY: 'local-contract-audit', ACCESS: 'contract-audit-local-signing-secret' },
        windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
    });
    next.stdout.on('data', chunk => { logs += chunk; }); next.stderr.on('data', chunk => { logs += chunk; });
    await expect.poll(async () => {
        if (next.exitCode !== null) throw new Error(logs);
        try { return (await fetch(`${baseURL}/login`)).status; } catch { return 0; }
    }, { timeout: 60000 }).toBe(200);
});
test.afterAll(async () => {
    if (next && next.exitCode === null) { const exited = once(next, 'exit'); next.kill(); await exited; }
    await fs.mkdir('test-results', { recursive: true });
    await fs.writeFile('test-results/contract-audit.json', JSON.stringify({ run: seed?.run, cases: report }, null, 2));
});

function assertProblem(response, status) {
    expect(response.status).toBe(status);
    expect(response.headers.get('content-type')).toContain('application/problem+json');
    expect(response.data).toMatchObject({ status, code: expect.any(String), detail: expect.any(String), title: expect.any(String), timestamp: expect.any(String) });
}

async function login(page, user = seed.reader) {
    await page.addInitScript(() => {
        for (const key of ['tour_completed_admin', 'tour_completed_member', 'tour_completed_profile', 'tour_completed_roles']) localStorage.setItem(key, 'true');
    });
    await page.goto(`${baseURL}/login`);
    await page.locator('input[name="cpf"]').fill(user.cpf);
    await page.locator('input[name="senha"]').fill(user.password ?? user.senha);
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    await expect(page).toHaveURL(/\/feed$/);
}

test('audited JSON contracts accept the real seeded controller responses', async () => {
    for (const contract of auditCases(seed)) {
        await test.step(contract.name, async () => {
            const response = await seed.request(contract.route, { token: contract.token });
            const parsed = contract.schema.safeParse(response.data);
            report.push({ contract: contract.name, route: contract.route, status: response.status, valid: parsed.success, issues: parsed.success ? [] : parsed.error.issues });
            expect(response.status, contract.route).toBe(200);
            expect(parsed.success, JSON.stringify(parsed.success ? {} : parsed.error.issues)).toBe(true);
        });
    }
});

for (const route of adminRoutes) {
    for (const [role, status] of [['anonymous', 401], ['unprivileged', 403], ['writer', 403], ['reader', 200], ['admin', 200]]) {
        test(`${role}: GET /${route} returns ${status}`, async () => {
            const token = role === 'admin' ? seed.admin.accessToken : seed[role]?.session?.accessToken;
            const response = await seed.request(route, { token });
            if (status === 200) expect(response.status).toBe(200);
            else assertProblem(response, status);
        });
    }
}

test('medical update-only permission returns a mutation acknowledgement without exposing medical fields', async () => {
    const response = await seed.request(`admin/medical-profiles/users/${seed.member.userId}`, { method: 'PUT', token: seed.writer.session.accessToken, body: { bloodType: 'UNKNOWN' } });
    expect(response.status).toBe(200);
    expect(load('admin/medical-profile').putMedicalProfileResponseSchema.safeParse(response.data).success).toBe(true);
    expect(response.data).not.toHaveProperty('allergies');
    assertProblem(await seed.request(`admin/medical-profiles/${seed.medical.id}`, { token: seed.writer.session.accessToken }), 403);
});

test('read-only permission cannot mutate medical records', async () => {
    assertProblem(await seed.request(`admin/medical-profiles/users/${seed.member.userId}`, { method: 'PUT', token: seed.reader.session.accessToken, body: {} }), 403);
});

test('ownership permits own dependents and denies another user with the same administrative permissions', async () => {
    const allowed = await seed.request(`medical-profiles/dependents/${seed.dependent.id}`, { token: seed.member.session.accessToken });
    expect(allowed.status).toBe(200);
    assertProblem(await seed.request(`medical-profiles/dependents/${seed.dependent.id}`, { token: seed.unprivileged.session.accessToken }), 403);
});

test('validation errors retain field names and correctable messages', async () => {
    const response = await seed.request('tools', { method: 'POST', token: seed.member.session.accessToken, body: { name: '' } });
    assertProblem(response, 400);
    expect(response.data.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'name', code: expect.any(String), message: expect.any(String) })]));
});

test('unknown resources return 404 and archived-state conflicts return 409', async () => {
    assertProblem(await seed.request('tools/2147483647', { token: seed.member.session.accessToken }), 404);
    assertProblem(await seed.request(`tools/${seed.tool.id}/activate`, { method: 'PATCH', token: seed.member.session.accessToken }), 409);
});

test('empty 201 links and 204 deletions remain valid successes', async () => {
    const role = await seed.api('authorization/roles', { method: 'POST', token: seed.admin.accessToken, body: { name: `${seed.run}-Disposable`, description: null } });
    const assigned = await seed.request(`authorization/users/${seed.unprivileged.userId}/roles/${role.id}`, { method: 'POST', token: seed.admin.accessToken });
    expect(assigned.status).toBe(201); expect(assigned.data).toBe('');
    const removed = await seed.request(`authorization/users/${seed.unprivileged.userId}/roles/${role.id}`, { method: 'DELETE', token: seed.admin.accessToken });
    expect(removed.status).toBe(204); expect(removed.data).toBe('');
    const deleted = await seed.request(`authorization/roles/${role.id}`, { method: 'DELETE', token: seed.admin.accessToken });
    expect(deleted.status).toBe(204);
});

test('CSV and PDF exports succeed only with export permission', async () => {
    for (const format of ['CSV', 'PDF']) {
        const route = `billing/admin/definitions/export?format=${format}`;
        const response = await fetch(`${seed.baseURL}/${route}`, { headers: { Authorization: `Bearer ${seed.admin.accessToken}` } });
        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain(format === 'CSV' ? 'text/csv' : 'application/pdf');
        expect((await response.arrayBuffer()).byteLength).toBeGreaterThan(0);
        assertProblem(await seed.request(route, { token: seed.reader.session.accessToken }), 403);
    }
});

test('receipt bytes are authorized by owner and by payment-read permission', async () => {
    const route = `billing/member-payments/${seed.payment.id}/receipt`;
    for (const token of [seed.member.session.accessToken, seed.reader.session.accessToken]) {
        const response = await fetch(`${seed.baseURL}/${route}`, { headers: { Authorization: `Bearer ${token}` } });
        expect(response.status).toBe(200); expect(response.headers.get('content-type')).toContain('image/png');
        expect(Buffer.from(await response.arrayBuffer())).toEqual(testPng);
    }
    assertProblem(await seed.request(route, { token: seed.unprivileged.session.accessToken }), 403);
});

test('minimal first access without email completes through the browser exactly once', async ({ page }) => {
    await page.addInitScript(() => { for (const key of ['tour_completed_member', 'tour_completed_profile']) localStorage.setItem(key, 'true'); });
    await page.goto(`${baseURL}/login`);
    await page.locator('input[name="cpf"]').fill(seed.firstAccess.cpf);
    await page.locator('input[name="senha"]').fill(seed.firstAccess.temporaryPassword);
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    await expect(page).toHaveURL(/\/first-access\/password$/);
    await page.locator('input[name="password"]').fill(seed.firstAccess.password);
    await page.locator('input[name="confirmPassword"]').fill(seed.firstAccess.password);
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/feed$/);
    const cookies = await page.context().cookies();
    expect(cookies.some(cookie => cookie.name === 'AuthAccessToken')).toBe(true);
    expect(cookies.some(cookie => cookie.name === 'FirstAccessPasswordChangeToken')).toBe(false);
});

test('read-only users can open the roles panel but cannot create roles', async ({ page }) => {
    await login(page);
    await page.goto(`${baseURL}/admin/roles-permissoes`);
    await expect(page.getByText(seed.reader.role.name, { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /Criar cargo|Novo cargo/i })).toHaveCount(0);
    await expect(page.locator('[role="status"]').filter({ hasText: /Não foi possível concluir|INVALID_RESPONSE/ })).toHaveCount(0);
});

test('unprivileged users cannot render the administrative users page and keep their session', async ({ page }) => {
    await login(page, seed.unprivileged);
    const response = await page.goto(`${baseURL}/admin/users`);
    expect([200, 404]).toContain(response.status()); // A streamed not-found page may have committed HTTP 200.
    await expect(page.getByRole('heading', { name: 'Parece que saímos da trilha.' })).toBeVisible();
    await expect(page.getByText('Gestão de usuários', { exact: true })).toHaveCount(0);
    expect((await page.context().cookies()).some(cookie => cookie.name === 'AuthAccessToken' && cookie.value)).toBe(true);
});

test('root can view archived role responses in the actual UI', async ({ page }) => {
    await login(page, { cpf: seed.adminCredentials.cpf, senha: seed.adminCredentials.senha });
    await page.goto(`${baseURL}/admin/roles-permissoes`);
    await page.getByRole('tab', { name: /Arquivados/ }).click();
    await expect(page.getByText(seed.archivedRole.name, { exact: true })).toBeVisible();
});

test('root and read-only users view medical details without calling a nonexistent owner endpoint', async ({ page }) => {
    await login(page);
    await page.goto(`${baseURL}/admin/dados-medicos`);
    await expect(page.getByText('Perfis médicos', { exact: true }).first()).toBeVisible();
    await page.getByRole('button', { name: `Visualizar perfil ${seed.medical.id}`, exact: true }).click();
    await expect(page.getByRole('dialog').getByRole('heading', { name: `# Associado ${seed.member.name}`, exact: true })).toBeVisible();
    await expect(page.getByRole('dialog').getByRole('button', { name: 'Tentar carregar nomes novamente' })).toHaveCount(0);
});

async function callServerAction(request, module, exportedName, args, session) {
    const manifest = JSON.parse(await fs.readFile('.next/server/server-reference-manifest.json', 'utf8'));
    const entry = Object.entries(manifest.node).find(([, item]) => item.filename === `src/server/actions/${module}.ts` && item.exportedName === exportedName);
    expect(entry, `${module}#${exportedName}`).toBeDefined();
    const response = await request.post(`${baseURL}/login`, {
        headers: { 'Next-Action': entry[0], 'Content-Type': 'text/plain;charset=UTF-8', Accept: 'text/x-component',
            ...(session ? { Cookie: `AuthAccessToken=${session.accessToken}; AuthRefreshToken=${session.refreshToken}; AccessTokenExpiration=${new Date(Date.now() + 60000).toISOString()}` } : {}),
        }, data: JSON.stringify(args),
    });
    const frame = readActionFrame(await response.text());
    if (frame.error) {
        const failure = frame.error;
        const prefix = 'JEEP_API_ERROR_V1:';
        expect(failure.digest.startsWith(prefix)).toBe(true);
        return { error: JSON.parse(decodeURIComponent(failure.digest.slice(prefix.length))) };
    }
    return { data: frame.value };
}

test('temporary-password and token-reset actions use actual API contracts and reject reused tokens', async ({ request }) => {
    // Password resets revoke sessions. Keep the permission-matrix users intact.
    const cpf = fakeCpf();
    const target = await seed.api('identity/admin/users', { method: 'POST', token: seed.admin.accessToken, body: { name: `${seed.run} PasswordReset`, cpf, activationMethod: 'TEMPORARY_PASSWORD' } });
    const denied = await callServerAction(request, 'admin/membership-applications', 'generateUserTemporaryPasswordAction', [target.userId], seed.reader.session);
    expect(denied.error).toMatchObject({ status: 403 });
    const generated = await callServerAction(request, 'admin/membership-applications', 'generateUserTemporaryPasswordAction', [target.userId], seed.admin);
    expect(generated.error).toBeUndefined();
    expect(generated.data).toMatchObject({ userId: target.userId, status: 'OPEN', method: 'ADMIN_TEMPORARY_PASSWORD' });
    expect(load('auth/recovery').adminTemporaryPasswordResponseSchema.safeParse(generated.data).success).toBe(true);
    const recovery = await seed.api(`authentication/admin/password-recovery/requests/users/${target.userId}/reset-link`, { method: 'POST', token: seed.admin.accessToken });
    const token = new URL(recovery.resetLink).searchParams.get('token');
    expect(token).toBeTruthy();
    const password = `Reset!${Date.now()}a`;
    const args = [{ token, password, confirmPassword: password }];
    const reset = await callServerAction(request, 'auth/reset-password', 'default', args);
    expect(reset).toEqual({ data: { success: true } });
    const authenticated = await seed.api('authentication/login', { method: 'POST', body: { cpf, senha: password } });
    expect(authenticated.accessToken).toEqual(expect.any(String));
    const repeated = await callServerAction(request, 'auth/reset-password', 'default', args);
    expect(repeated.error).toMatchObject({ status: 401 });
});

test('administrative publication actions parse CSV indexes and each real detail contract', async ({ page }) => {
    await login(page, { cpf: seed.adminCredentials.cpf, senha: seed.adminCredentials.senha });
    const response = await callServerAction(page.request, 'publications/list', 'listAdminPublicationsAction', [{ types: ['NOTICE', 'EVENT', 'SERVICE'], page: 0, size: 48, status: 'ALL' }]);
    expect(response.error).toBeUndefined();
    for (const [type, id] of [['NOTICE', seed.notice.id], ['EVENT', seed.event.id], ['SERVICE', seed.service.id]]) {
        expect(response.data.content).toContainEqual(expect.objectContaining({ id, type, status: 'PUBLISHED' }));
    }
    expect(response.data.content).toContainEqual(expect.objectContaining({ type: 'SERVICE', status: 'PENDING', serviceRequest: true }));
});

test('event registration actions preserve confirmed and cancelled contracts and enforce access', async ({ page }) => {
    await login(page, seed.member);
    const initial = await callServerAction(page.request, 'publications/event-registration', 'getMyEventRegistrationAction', [seed.event.id]);
    expect(initial.data).toMatchObject({ eventId: seed.event.id, userId: seed.member.userId, status: 'CONFIRMED' });
    assertProblem(await seed.request(`events/${seed.event.id}/registrations/me`, { token: seed.unprivileged.session.accessToken }), 403);
    const cancelled = await callServerAction(page.request, 'publications/event-registration', 'cancelMyEventRegistrationAction', [seed.event.id]);
    expect(cancelled.error).toBeUndefined();
    expect(load('publications/event-registration').eventRegistrationSchema.safeParse(cancelled.data).success).toBe(true);
    expect(cancelled.data).toMatchObject({ status: 'CANCELLED', cancelledAt: expect.any(String) });
});

test('public password recovery action accepts the real response without exposing account data', async ({ request }) => {
    const response = await callServerAction(request, 'auth/forgot-password', 'default', [{ cpf: seed.reader.cpf }]);
    expect(response).toEqual({ data: { success: true } });
    const requests = await seed.api(`authentication/admin/password-recovery/requests/users/${seed.reader.userId}`, { token: seed.admin.accessToken });
    expect(requests).toContainEqual(expect.objectContaining({ status: 'OPEN', method: 'UNDEFINED' }));
    expect(requests.every(item => load('admin/security').passwordRecoveryRequestSchema.safeParse(item).success)).toBe(true);
});
