# Frontend na Vercel

Projeto existente: `jeepclubetamoios`, conta `jgabrielfbeserras-projects`.
Site público: https://jeepclubetamoios-one.vercel.app
Backend: https://144.91.73.3

## Branch e build

Conecte `Jeep-Club/front-end-web-application` e selecione `main` como
Production Branch. `develop` deve gerar apenas previews. A Vercel executa o
build do Next.js e publica automaticamente novos commits de `main`.
O backend tem seu próprio GitHub Actions, acionado na `master` do repositório
`Luskahz/jeep-club-backend`.

## Variáveis de ambiente

Configure em Production e Preview:

| Variável | Valor |
| --- | --- |
| `API_URL` | `https://144.91.73.3` |
| `NEXT_PUBLIC_API_URL` | `https://144.91.73.3` |
| `NODE_SECURE` | `HTTPS` |
| `ACCESS` | Chave aleatória privada, gerada uma vez por ambiente |

Para gerar `ACCESS`, execute localmente:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Não publique a chave no Git, no frontend ou em variáveis `NEXT_PUBLIC_`.
Mantenha a chave estável entre deploys para preservar as sessões. Trocar a
chave invalida os cookies assinados existentes. Não configure `NODE_ENV`;
o Next.js usa `production` ao executar o build e `development` em `next dev`.
Depois de mudar variáveis, faça um novo deploy para aplicar os valores ao
servidor e ao bundle do navegador.

Para desenvolvimento local, copie `env.example` para `.env.local`, preencha
`ACCESS`, execute `npm ci` e `npm run dev`.

## Integração

Login, consultas autenticadas e outras Server Actions chamam a API a partir
do servidor Next.js, usando `API_URL`. Essas chamadas não exigem CORS do
navegador. Os wrappers de chamadas diretas do navegador usam
`NEXT_PUBLIC_API_URL`; se utilizados, a origem pública exata do frontend
deve ser permitida pelo CORS do backend.

O certificado da API precisa estar válido e renovado na VPS; não desative a
validação TLS na Vercel. Cookies de sessão em builds publicados usam HTTPS,
inclusive durante a renovação. O segredo `ACCESS` é obrigatório no servidor
em produção.

## Verificação após publicar

1. Confira que o deploy está Ready e corresponde à branch `main`.
2. Abra o site e faça login com o usuário de teste cadastrado na VPS.
3. Confira perfil, permissões e acesso a uma página autenticada.
4. Confira os Runtime Logs da Vercel se uma Server Action falhar.

O backend usa o perfil `dev` para estes testes. SMTP não está configurado;
os fluxos que dependem de envio real de e-mail precisam de configuração
adicional antes de uso em produção.
