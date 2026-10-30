import { fileURLToPath } from 'node:url';
import { localApi, fakeCpf } from './local-api.mjs';

/** Creates synthetic records through the API, preserving domain invariants. */
export async function seedLocalContracts() {
    const { api, admin, baseURL: apiURL } = await localApi();
    const run = Date.now().toString();
    const cpf = fakeCpf();
    const account = await api('identity/admin/users', { method: 'POST', token: admin.accessToken, body: { name: `E2E HTTP ${run}`, birthDate: '1995-05-12', email: `e2e.http.${run}@example.test`, cpf, rg: null, phoneNumber: '12999999999', activationMethod: 'TEMPORARY_PASSWORD' } });
    const challenge = await api('authentication/login', { method: 'POST', body: { cpf, senha: account.temporaryPassword } });
    const password = `E2eLocal!${run}`;
    const session = await api('authentication/login/password-change', { method: 'POST', body: { passwordChangeToken: challenge.passwordChangeToken, newPassword: password } });
    const tool = await api('tools', { method: 'POST', token: session.accessToken, body: { name: `E2E HTTP ferramenta ${run}`, description: 'Dado sintético criado para validar contratos HTTP. Pode ser removido após os testes.' } });
    const adminTool = await api('tools', { method: 'POST', token: admin.accessToken, body: { name: `E2E HTTP acesso negado ${run}`, description: 'Dado sintético de outro proprietário para validar 403.' } });
    return { apiURL, userId: account.userId, cpf, password, session, tool, adminTool, admin };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const seed = await seedLocalContracts();
    console.log(JSON.stringify({ userId: seed.userId, toolId: seed.tool.id, otherOwnerToolId: seed.adminTool.id }));
}
