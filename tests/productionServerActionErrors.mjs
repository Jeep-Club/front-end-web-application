// Run after npm run build. Exercises the actual production Server Action protocol.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

async function main() {
    const api = http.createServer((req, res) => {
        req.resume();
        req.on('end', () => {
            res.writeHead(401, { 'Content-Type': 'application/problem+json' });
            res.end(JSON.stringify({
                code: 'INVALID_CREDENTIALS', status: 401,
                detail: 'CPF ou senha inválidos.', title: 'Não autenticado',
                timestamp: new Date().toISOString(),
            }));
        });
    });
    api.listen(0, '127.0.0.1');
    await once(api, 'listening');

    // Reserve an available local port for the production Next.js process.
    const reservation = http.createServer();
    reservation.listen(0, '127.0.0.1');
    await once(reservation, 'listening');
    const port = reservation.address().port;
    await new Promise(resolve => reservation.close(resolve));
    let logs = '';
    const child = spawn(process.execPath, [
        'node_modules/next/dist/bin/next', 'start', '-p', String(port), '-H', '127.0.0.1',
    ], {
        env: {
            ...process.env,
            API_URL: `http://127.0.0.1:${api.address().port}`,
            API_FRONTEND_KEY: 'local-regression-test',
            ACCESS: 'local-regression-test-signing-key',
        },
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
    });
    child.stdout.on('data', chunk => { logs += chunk; });
    child.stderr.on('data', chunk => { logs += chunk; });
    try {
        const baseUrl = `http://127.0.0.1:${port}`;
        let ready = false;
        for (let attempt = 0; attempt < 100; attempt++) {
            if (child.exitCode !== null) throw new Error(`Next.js stopped: ${logs}`);
            try {
                await fetch(`${baseUrl}/login`, { signal: AbortSignal.timeout(1000) });
                ready = true;
                break;
            } catch { await new Promise(resolve => setTimeout(resolve, 200)); }
        }
        assert.ok(ready, `Next.js did not start: ${logs}`);
        const manifest = JSON.parse(fs.readFileSync('.next/server/server-reference-manifest.json', 'utf8'));
        const [actionId] = Object.entries(manifest.node).find(([, entry]) =>
            entry.filename === 'src/server/actions/auth/login.ts');
        const scenarios = [
            [{ cpf: '', senha: '' }, 'CPF e senha são obrigatórios'],
            [{ cpf: '00000000000', senha: 'local-test-only' }, 'CPF ou senha inválidos.'],
        ];
        for (const [input, message] of scenarios) {
            const response = await fetch(`${baseUrl}/login`, {
                method: 'POST',
                headers: {
                    'Next-Action': actionId,
                    'Content-Type': 'text/plain;charset=UTF-8',
                    Accept: 'text/x-component',
                },
                body: JSON.stringify([input]),
                signal: AbortSignal.timeout(10000),
            });
            const body = await response.text();
            assert.ok([200, 500].includes(response.status)); // Streaming can commit HTTP 200 before rejection.
            const frame = body.split('\n').find(line => line.startsWith('1:')).slice(2);
            assert.ok(frame.startsWith('E')); // Native rejected action, without an application envelope.
            const error = JSON.parse(frame.slice(1));
            const prefix = 'JEEP_API_ERROR_V1:';
            assert.ok(error.digest.startsWith(prefix));
            const failure = JSON.parse(decodeURIComponent(error.digest.slice(prefix.length)));
            assert.equal(failure.message, message);
            assert.ok(!body.includes('An error occurred in the Server Components render'));
            console.log(`Production Server Action passed: ${message}`);
        }
        // A programming exception still receives the framework's opaque digest in the upgraded runtime.
        const unexpected = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            headers: { 'Next-Action': actionId, 'Content-Type': 'text/plain;charset=UTF-8', Accept: 'text/x-component' },
            body: JSON.stringify([null]),
        });
        const unexpectedBody = await unexpected.text();
        const frame = unexpectedBody.split('\n').find(line => line.startsWith('1:')).slice(2);
        assert.ok(frame.startsWith('E'));
        assert.ok(!JSON.parse(frame.slice(1)).digest.startsWith('JEEP_API_ERROR_V1:'));
        assert.ok(!unexpectedBody.includes('Cannot destructure'));
        console.log('Production Server Action passed: unexpected exceptions remain redacted');
    } finally {
        if (child.exitCode === null) {
            const exited = once(child, 'exit');
            child.kill();
            await exited;
        }
        api.closeAllConnections();
        await new Promise(resolve => api.close(resolve));
    }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
