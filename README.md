# Jeep Club — frontend

Interface web do Jeep Clube Tamoios, com área pública, autenticação, perfil de associados e administração de usuários e finanças. As operações integradas dependem de uma API externa e das permissões do usuário.

Construído com Next.js (App Router), React e TypeScript; utiliza Tailwind CSS, TanStack Query e React Hook Form com Zod. As dependências declaradas estão em [package.json](package.json); as versões resolvidas, em [package-lock.json](package-lock.json).

## Começar localmente

Pré-requisitos:

- Node.js compatível com as dependências instaladas. O Next.js 16.2.4 resolvido neste checkout declara Node `>=20.9.0`; isso é um requisito do pacote, **não uma versão oficial de suporte do projeto**. A escolha do runtime, dos browsers e do ambiente de testes ainda está pendente.
- npm, utilizado com o `package-lock.json` versionado. Não há versão de npm fixada no projeto.
- Para login e operações integradas: API de desenvolvimento acessível, credencial de acesso quando exigida pelo backend e usuário de teste com as permissões correspondentes. O servidor frontend, sozinho, não fornece esses serviços.

Na raiz do repositório:

```sh
npm ci
```

Copie [env.example](env.example) para `.env.local` e ajuste o ambiente antes de iniciar. Em PowerShell:

```powershell
Copy-Item -LiteralPath env.example -Destination .env.local
```

Se `.env.local` já existir, preserve sua configuração em vez de sobrescrevê-la. O template contém um endereço de implantação como exemplo: substitua-o pela API de desenvolvimento acordada com o responsável. Não use contas ou dados reais para testes.

| Variável | Uso atual |
| --- | --- |
| `API_URL` | URL-base da API, sem barra final; necessária às chamadas de servidor para o backend |
| `API_FRONTEND_KEY` | Credencial privada servidor→API. Obrigatória nos wrappers em produção; em desenvolvimento pode ficar vazia somente se o backend permitir |
| `ACCESS` | Segredo privado de assinatura da sessão. Configure um valor próprio e estável no ambiente; produção exige seu preenchimento. O código tem fallback de desenvolvimento |
| `NODE_SECURE` | `HTTPS` ativa cookies seguros também no desenvolvimento; para localhost HTTP, o template usa `HTTP`. Em produção os cookies são seguros independentemente desse valor |
| `NEXT_PUBLIC_API_URL` | Campo legado dos templates, sem leitura ativa encontrada em `src/`; não é requisito das chamadas atuais, feitas pelo servidor |

Não preencha `NODE_ENV` manualmente: os comandos Next.js definem o modo. `.env.local` é ignorado pelo Git; não versione valores privados nem coloque credenciais em variáveis `NEXT_PUBLIC_`. Há também um template antigo, [.env.example](.env.example); este início rápido utiliza `env.example`, com comentários, sem exigir preenchimento dos campos legados.

```sh
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). As rotas estão em [src/app](src/app), incluindo a página pública e `/login`. Reinicie o servidor após alterar o ambiente. O layout usa `next/font/google` para Geist; a preparação das fontes pode exigir acesso à rede.

## Comandos

Execute na raiz, após instalar as dependências:

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm start` | Executar o build de produção previamente gerado |
| `npm run lint` | ESLint conforme a configuração existente |
| `node node_modules/typescript/bin/tsc --noEmit --incremental false` | Verificação de tipos sem emitir arquivos ou cache incremental; não há script `typecheck` |
| `npm test -- --runInBand --coverage=false --cache=false` | Jest completo sem cobertura/cache de testes |
| `npm test -- tests/useTour.spec.ts --runInBand --coverage=false --cache=false` | Exemplo de execução de uma suíte existente |
| `npm run test:coverage -- --runInBand` | Jest com relatório de cobertura em `coverage/` |

O Jest usa ambiente Node e coleta cobertura por padrão na configuração atual. Os comandos acima não significam que todos os checks estão aprovados: há pendências conhecidas de lint e testes. Build, lint, TypeScript e Jest verificam aspectos diferentes; Jest não substitui validação de interface no navegador.

## Documentação

Consulte o [índice de documentação](docs/README.md) para navegar pelo material existente e pelos guias planejados. As instruções de implantação, variáveis de deploy e integração operacional permanecem no [runbook da Vercel](deploy/vercel.md).
