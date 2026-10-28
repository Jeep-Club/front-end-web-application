import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Creates synthetic records through the API, preserving the hexagonal application's invariants. */
export async function seedLocalContracts() {
    const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
    const propertiesPath = path.join(repo, '../jeep-club-backend/src/main/resources/application-dev.properties');
    const text = await fs.readFile(propertiesPath, 'utf8');
    const props = Object.fromEntries(text.split(/\r?\n/).filter(line => line && !line.startsWith('#') && line.includes('=')).map(line => { const i = line.indexOf('='); return [line.slice(0, i).trim(), line.slice(i + 1).trim()]; }));
    const apiURL = process.env.E2E_API_URL || props['app.server.base-url'];
    if (!['localhost', '127.0.0.1', '[::1]'].includes(new URL(apiURL).hostname)) throw new Error('The seed only runs against a local development API.');
    async function api(route, body, token, method = 'POST') {
        const response = await fetch(`${apiURL}/${route}`, { method, headers: { 'Content-Type': 'application/json', 'Accept-Language': 'pt-BR', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
        const data = await response.json();
        if (!response.ok) throw new Error(`Local seed failed: ${route} (${response.status}): ${data.code} ${data.detail}`);
        return data;
    }
    const admin = await api('authentication/login', { cpf: props['security.bootstrap.admin.cpf'], senha: props['security.bootstrap.admin.password'] });
    const run = Date.now().toString();
    const digits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
    for (let weight = 10; weight <= 11; weight++) { const mod = digits.reduce((sum, digit, i) => sum + digit * (weight - i), 0) * 10 % 11; digits.push(mod === 10 ? 0 : mod); }
    const cpf = digits.join('');
    const account = await api('identity/admin/users', { name: `E2E HTTP ${run}`, birthDate: '1995-05-12', email: `e2e.http.${run}@example.test`, cpf, rg: null, phoneNumber: '12999999999', activationMethod: 'TEMPORARY_PASSWORD' }, admin.accessToken);
    const challenge = await api('authentication/login', { cpf, senha: account.temporaryPassword });
    const password = `E2eLocal!${run}`;
    const session = await api('authentication/login/password-change', { passwordChangeToken: challenge.passwordChangeToken, newPassword: password });
    const tool = await api('tools', { name: `E2E HTTP ferramenta ${run}`, description: 'Dado sintético criado para validar contratos HTTP. Pode ser removido após os testes.' }, session.accessToken);
    const adminTool = await api('tools', { name: `E2E HTTP acesso negado ${run}`, description: 'Dado sintético de outro proprietário para validar 403.' }, admin.accessToken);
    return { apiURL, userId: account.userId, cpf, password, session, tool, adminTool, admin };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const seed = await seedLocalContracts();
    console.log(JSON.stringify({ userId: seed.userId, toolId: seed.tool.id, otherOwnerToolId: seed.adminTool.id }));
}
