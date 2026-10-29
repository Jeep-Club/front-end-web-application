import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import http from 'node:http';
import { once } from 'node:events';
import { spawn } from 'node:child_process';
import { seedLocalContracts } from './seed-local.mjs';

// No shared Playwright configuration: this suite can be merged alongside the other branch.
// Run after npm run build: npx playwright test tests/e2e/http-contracts.spec.mjs --workers=1
// Uses the installed Chrome; E2E_BROWSER_CHANNEL can select another installed channel.
test.use({ channel: process.env.E2E_BROWSER_CHANNEL || 'chrome' });
test.describe.configure({ mode: 'serial' });
let seed, api, next, baseURL, manifest;
let scenario;
let calls = [];
let logs = '';

function send(res, status, body, type = 'application/problem+json') {
    res.writeHead(status, { 'Content-Type': type });
    res.end(typeof body === 'string' ? body : JSON.stringify(body));
}
const problem = (status, code) => ({ status, code, detail: `Mensagem corrigível ${code}.` });

async function action(request, module, args, session = seed.session) {
    const entries = Object.entries(manifest.node).filter(([, entry]) => entry.filename === `src/server/actions/${module}.ts`);
    expect(entries).toHaveLength(1);
    const headers = { 'Next-Action': entries[0][0], 'Content-Type': 'text/plain;charset=UTF-8', Accept: 'text/x-component' };
    if (session) headers.Cookie = `AuthAccessToken=${session.accessToken}; AuthRefreshToken=${session.refreshToken}; AccessTokenExpiration=${new Date(Date.now() + 60000).toISOString()}`;
    const response = await request.post(`${baseURL}/login`, { headers, data: JSON.stringify(args) });
    const body = await response.text();
    expect(body).not.toContain('An error occurred in the Server Components render');
    const frame = body.split('\n').find(line => line.startsWith('1:')).slice(2);
    let result;
    if (frame.startsWith('E')) {
        expect([200, 500]).toContain(response.status()); // A streamed rejection may follow committed HTTP 200.
        const error = JSON.parse(frame.slice(1));
        const prefix = 'JEEP_API_ERROR_V1:';
        expect(error.digest.startsWith(prefix)).toBe(true);
        result = { ok: false, error: JSON.parse(decodeURIComponent(error.digest.slice(prefix.length))) };
    } else {
        expect(response.status()).toBe(200);
        result = { ok: true, data: JSON.parse(frame) };
    }
    return { result, response };
}

function expectSessionPreserved(response) {
    expect(response.headersArray().filter(header => header.name.toLowerCase() === 'set-cookie').map(header => header.value).join('\n')).not.toMatch(/Auth(?:Access|Refresh)Token=;/);
}

test.beforeAll(async () => {
    test.setTimeout(120000);
    seed = await seedLocalContracts();
    console.log(`Local mock records: user=${seed.userId}, tool=${seed.tool.id}, otherOwnerTool=${seed.adminTool.id}`);
    manifest = JSON.parse(await fs.readFile('.next/server/server-reference-manifest.json', 'utf8'));
    api = http.createServer(async (req, res) => {
        try {
            const chunks = [];
            for await (const chunk of req) chunks.push(chunk);
            calls.push({ path: req.url, authorization: req.headers.authorization });
            const isRefresh = req.url === '/authentication/refresh';
            if (scenario?.refresh && isRefresh) {
                if (scenario.refresh === 'outage') return send(res, 503, problem(503, 'SERVICE_UNAVAILABLE'));
                return send(res, 200, { accessToken: 'renewed-access', refreshToken: 'renewed-refresh', expiresInSeconds: 60 }, 'application/json');
            }
            if (scenario?.refresh && req.headers.authorization !== 'Bearer renewed-access') return send(res, 401, problem(401, 'INVALID_ACCESS_TOKEN'));
            if (scenario && (!scenario.routePrefix || req.url.startsWith(scenario.routePrefix))) return send(res, scenario.status, scenario.body ?? problem(scenario.status, scenario.code), scenario.type);
            const response = await fetch(`${seed.apiURL}${req.url}`, { method: req.method, headers: { ...req.headers, host: new URL(seed.apiURL).host }, ...(['GET', 'HEAD'].includes(req.method) ? {} : { body: Buffer.concat(chunks) }) });
            res.writeHead(response.status, { 'Content-Type': response.headers.get('content-type') || 'application/octet-stream' });
            res.end(Buffer.from(await response.arrayBuffer()));
        } catch (error) { send(res, 502, problem(502, 'E2E_PROXY_FAILURE')); console.error(error.message); }
    });
    api.listen(0, '127.0.0.1');
    await once(api, 'listening');
    const reservation = http.createServer();
    reservation.listen(0, '127.0.0.1');
    await once(reservation, 'listening');
    const port = reservation.address().port;
    await new Promise(resolve => reservation.close(resolve));
    baseURL = `http://127.0.0.1:${port}`;
    next = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', String(port)], {
        env: { ...process.env, API_URL: `http://127.0.0.1:${api.address().port}`, API_FRONTEND_KEY: 'local-contract-tests', ACCESS: 'local-contract-tests-signing-secret' },
        stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
    });
    next.stdout.on('data', chunk => { logs += chunk; });
    next.stderr.on('data', chunk => { logs += chunk; });
    await expect.poll(async () => {
        if (next.exitCode !== null) throw new Error(logs);
        try { return (await fetch(`${baseURL}/login`)).status; } catch { return 0; }
    }, { timeout: 60000 }).toBe(200);
});

test.beforeEach(() => { scenario = undefined; calls = []; });
test.afterAll(async () => {
    if (next && next.exitCode === null) { const exited = once(next, 'exit'); next.kill(); await exited; }
    if (api) { api.closeAllConnections(); await new Promise(resolve => api.close(resolve)); }
});

test('existing JSON action reads a real seeded tool', async ({ request }) => {
    const { result } = await action(request, 'tools/detail', [seed.tool.id]);
    expect(result).toMatchObject({ ok: true, data: { id: seed.tool.id, name: seed.tool.name } });
});

test('real API field errors reach the action boundary', async ({ request }) => {
    const { result } = await action(request, 'tools/create', [{ name: '', description: '' }]);
    expect(result).toMatchObject({ ok: false, error: { status: 400, errors: expect.arrayContaining([expect.objectContaining({ field: 'name' })]) } });
    expect(result.error.message).toBe(result.error.errors[0].message);
});

test('real 403 for another owner keeps the session', async ({ request }) => {
    const { result, response } = await action(request, 'tools/detail', [seed.adminTool.id]);
    expect(result).toMatchObject({ ok: false, error: { status: 403 } });
    expectSessionPreserved(response);
    expect(calls.some(call => call.path.includes('/refresh'))).toBe(false);
});

test('real 409 for an archived tool keeps its conflict message', async ({ request }) => {
    const archived = await fetch(`${seed.apiURL}/tools/${seed.adminTool.id}/archive`, { method: 'PATCH', headers: { Authorization: `Bearer ${seed.admin.accessToken}` } });
    expect(archived.status).toBe(200);
    const { result, response } = await action(request, 'tools/activate', [seed.adminTool.id], seed.admin);
    expect(result).toMatchObject({ ok: false, error: { status: 409 } });
    expect(result.error.message.length).toBeGreaterThan(0);
    expectSessionPreserved(response);
});

test('real 204 deletion succeeds without JSON parsing', async ({ request }) => {
    const { result } = await action(request, 'tools/delete', [seed.tool.id]);
    expect(result.ok).toBe(true);
    const response = await fetch(`${seed.apiURL}/tools/${seed.tool.id}`, { headers: { Authorization: `Bearer ${seed.session.accessToken}` } });
    expect(response.status).toBe(404);
});

for (const [status, code] of [[402, 'MEMBERSHIP_PAYMENT_REQUIRED'], [503, 'MEMBERSHIP_CHARGE_UNAVAILABLE']]) {
    test(`${status} ${code} preserves message and session`, async ({ request }) => {
        scenario = { status, code };
        const { result, response } = await action(request, 'tools/detail', [1]);
        expect(result).toMatchObject({ ok: false, error: { status, code, message: problem(status, code).detail } });
        expectSessionPreserved(response);
        expect(calls).toHaveLength(1);
    });
}

test('403 after successful refresh is not session expiration', async ({ request }) => {
    scenario = { refresh: 'success', status: 403, code: 'ACCESS_DENIED' };
    const { result, response } = await action(request, 'tools/detail', [1]);
    expect(result).toMatchObject({ ok: false, error: { status: 403, code: 'ACCESS_DENIED' } });
    expect(calls.map(call => call.path)).toEqual(['/tools/1', '/authentication/refresh', '/tools/1']);
    expect(calls[2].authorization).toBe('Bearer renewed-access');
    expectSessionPreserved(response);
});

test('503 during refresh keeps the session', async ({ request }) => {
    scenario = { refresh: 'outage', status: 503, code: 'SERVICE_UNAVAILABLE' };
    const { result, response } = await action(request, 'tools/detail', [1]);
    expect(result).toMatchObject({ ok: false, error: { status: 503, code: 'SERVICE_UNAVAILABLE' } });
    expectSessionPreserved(response);
});

test('real CSV export validates the content type before returning bytes', async ({ request }) => {
    const { result } = await action(request, 'billing/download', ['definitions', 'CSV'], seed.admin);
    expect(result).toMatchObject({ ok: true, data: { contentType: expect.stringContaining('text/csv'), filename: 'financeiro-definitions.csv' } });
    expect(Buffer.from(result.data.base64, 'base64').length).toBeGreaterThan(0);
});

test('PDF export preserves bytes', async ({ request }) => {
    scenario = { status: 200, type: 'application/pdf', body: '%PDF-1.4\ncontract-test' };
    const { result } = await action(request, 'billing/download', ['definitions', 'PDF']);
    expect(result.ok).toBe(true);
    expect(Buffer.from(result.data.base64, 'base64').toString()).toBe(scenario.body);
});

for (const status of [409, 200]) {
    test(`JSON export error with HTTP ${status} never becomes a file`, async ({ request }) => {
        scenario = { status, body: problem(409, 'CONFLICT') };
        const { result } = await action(request, 'billing/download', ['definitions', 'PDF']);
        expect(result).toMatchObject({ ok: false, error: { code: 'CONFLICT', message: problem(409, 'CONFLICT').detail } });
        expect(JSON.stringify(result)).not.toContain('base64');
    });
}

test('unexpected HTML is rejected instead of downloaded', async ({ request }) => {
    scenario = { status: 200, type: 'text/html', body: '<html>private proxy failure</html>' };
    const { result } = await action(request, 'billing/download', ['definitions', 'PDF']);
    expect(result).toMatchObject({ ok: false, error: { code: 'INVALID_RESPONSE' } });
    expect(JSON.stringify(result)).not.toMatch(/base64|private proxy/);
});

test('login shows the API error in the browser in production', async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await page.locator('input[name="cpf"]').fill(seed.cpf);
    await page.locator('input[name="senha"]').fill('IncorrectLocal123!');
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    await expect(page.getByRole('alert').filter({ hasText: /CPF|senha|credenciais/i })).toBeVisible();
    await expect(page.locator('[role="status"]').filter({ hasText: 'CPF ou senha inválidos.' })).toBeVisible();
    await expect(page.getByText('An error occurred in the Server Components render')).toHaveCount(0);
    await expect(page).toHaveURL(/\/login$/);
});

test('a real query rejection restores its toast and keeps the browser session', async ({ page }) => {
    await page.addInitScript(() => {
        for (const key of ['tour_completed_profile', 'tour_completed_member', 'tour_completed_admin']) localStorage.setItem(key, 'true');
    });
    await page.goto(`${baseURL}/login`);
    await page.locator('input[name="cpf"]').fill(seed.cpf);
    await page.locator('input[name="senha"]').fill(seed.password);
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    await expect(page).toHaveURL(/\/feed$/);
    await page.goto(`${baseURL}/profile`);
    scenario = { routePrefix: '/tools', status: 403, code: 'ACCESS_DENIED' };
    await page.locator('#tour-profile-tab-tools').click();
    await expect(page.locator('[role="status"]').filter({ hasText: problem(403, 'ACCESS_DENIED').detail })).toBeVisible({ timeout: 15000 });
    await expect(page).toHaveURL(/\/profile$/);
    expect((await page.context().cookies()).some(cookie => cookie.name === 'AuthAccessToken' && cookie.value)).toBe(true);
});
