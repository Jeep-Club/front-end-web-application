import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomInt } from 'node:crypto';

export async function localApi() {
    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
    const text = await fs.readFile(path.join(root, '../jeep-club-backend/src/main/resources/application-dev.properties'), 'utf8');
    const props = Object.fromEntries(text.split(/\r?\n/).filter(line => line && !line.startsWith('#') && line.includes('=')).map(line => { const i = line.indexOf('='); return [line.slice(0, i).trim(), line.slice(i + 1).trim()]; }));
    const baseURL = process.env.E2E_API_URL || props['app.server.base-url'];
    if (!['localhost', '127.0.0.1', '[::1]'].includes(new URL(baseURL).hostname)) throw new Error('Contract seeds require a local development API.');
    async function request(route, { method = 'GET', body, token, headers = {} } = {}) {
        const response = await fetch(`${baseURL}/${route}`, { method, headers: { 'Accept-Language': 'pt-BR', ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers }, ...(body === undefined ? {} : { body: body instanceof FormData || typeof body === 'string' ? body : JSON.stringify(body) }) });
        const text = await response.text();
        let data = text;
        try { data = JSON.parse(text); } catch { /* Text and empty responses are valid contracts too. */ }
        return { status: response.status, headers: response.headers, data };
    }
    async function api(route, options) {
        const result = await request(route, options);
        if (result.status >= 400) throw new Error(`${options?.method || 'GET'} /${route}: HTTP ${result.status} ${result.data?.code || ''} ${result.data?.detail || ''}`);
        return result.data;
    }
    const adminCredentials = { cpf: props['security.bootstrap.admin.cpf'], senha: props['security.bootstrap.admin.password'] };
    const admin = await api('authentication/login', { method: 'POST', body: adminCredentials });
    return { baseURL, api, request, admin, adminCredentials };
}

export function fakeCpf() {
    const digits = Array.from({ length: 9 }, () => randomInt(10));
    for (let weight = 10; weight <= 11; weight++) { const digit = digits.reduce((sum, value, i) => sum + value * (weight - i), 0) * 10 % 11; digits.push(digit === 10 ? 0 : digit); }
    return digits.join('');
}

export const testPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');

