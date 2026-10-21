# Jeep Club — frontend

Interface web do Jeep Clube Tamoios, com área pública, autenticação, perfil de associados e administração de usuários e finanças. As operações integradas dependem de uma API externa e das permissões do usuário.

Construído com Next.js (App Router), React e TypeScript; utiliza Tailwind CSS, TanStack Query e React Hook Form com Zod. As dependências declaradas estão em [package.json](package.json); as versões resolvidas, em [package-lock.json](package-lock.json).

## Começar localmente

Pré-requisitos:

- Node.js compatível com as dependências instaladas. O Next.js 16.2.4 resolvido neste checkout declara Node `>=20.9.0`; isso é um requisito do pacote, **não uma versão oficial de suporte do projeto**. Não há versão de runtime fixada na configuração do projeto.
- npm, utilizado com o `package-lock.json` versionado. Não há versão de npm fixada no projeto.
- Para o Storybook com Vite 8: Node `^20.19.0 || >=22.12.0`, conforme o requisito do Vite instalado. Isso não fixa uma versão oficial de runtime do projeto.
- Para login e operações integradas: API de desenvolvimento acessível, credencial de acesso quando exigida pelo backend e usuário de teste com as permissões correspondentes. O servidor frontend, sozinho, não fornece esses serviços.

Na raiz do repositório:

```sh
npm ci
```

Copie [.env.example](.env.example) para `.env` e ajuste o ambiente antes de iniciar. Em PowerShell:

```powershell
Copy-Item -LiteralPath .env.example -Destination .env
```

Se `.env` já existir, preserve sua configuração em vez de sobrescrevê-la. O template contém um endereço de implantação como exemplo: substitua-o pela API de desenvolvimento acordada com o responsável. Não use contas ou dados reais para testes.

| Variável | Uso atual |
| --- | --- |
| `API_URL` | URL-base da API, sem barra final; necessária às chamadas de servidor para o backend |
| `API_FRONTEND_KEY` | Credencial privada servidor→API. Obrigatória nos wrappers em produção; em desenvolvimento pode ficar vazia somente se o backend permitir |
| `ACCESS` | Segredo privado de assinatura da sessão. Configure um valor próprio e estável no ambiente; produção exige seu preenchimento. O código tem fallback de desenvolvimento |
| `NODE_SECURE` | `HTTPS` ativa cookies seguros também no desenvolvimento; para localhost HTTP, o template usa `HTTP`. Em produção os cookies são seguros independentemente desse valor |
| `NEXT_PUBLIC_API_URL` | Campo legado dos templates, sem leitura ativa encontrada em `src/`; não é requisito das chamadas atuais, feitas pelo servidor |

Não preencha `NODE_ENV` manualmente: os comandos Next.js definem o modo. `.env` é ignorado pelo Git; não versione valores privados nem coloque credenciais em variáveis `NEXT_PUBLIC_`. Os comandos locais e o Playwright usam o carregador de ambiente do Next; variáveis do processo e arquivos `.env*` mais específicos podem sobrescrever `.env`.

```sh
npm run dev
```

Abra o endereço definido por `APP_URL` no `.env`. As rotas estão em [src/app](src/app), incluindo a página pública e `/login`. Reinicie o servidor após alterar o ambiente. O layout usa `next/font/google` para Geist; a preparação das fontes pode exigir acesso à rede.

## Comandos

Execute na raiz, após instalar as dependências:

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run storybook` | Componentes isolados no endereço `STORYBOOK_URL` do `.env` |
| `npm run build-storybook` | Build estático do catálogo em `storybook-static/` |
| `npm run build` | Build de produção |
| `npm start` | Executar o build de produção previamente gerado |
| `npm run lint` | ESLint conforme a configuração existente |
| `node node_modules/typescript/bin/tsc --noEmit --incremental false` | Verificação de tipos sem emitir arquivos ou cache incremental; não há script `typecheck` |
| `npm test -- --runInBand --coverage=false --cache=false` | Jest completo sem cobertura/cache de testes |
| `npm test -- tests/useTour.spec.ts --runInBand --coverage=false --cache=false` | Exemplo de execução de uma suíte existente |
| `npm run test:coverage -- --runInBand` | Jest com relatório de cobertura em `coverage/` |
| `npm run test:browser` | Pilotos de Table/Storybook e login em Chromium, Firefox e WebKit, nas três larguras |
| `npm run test:browser -- --project="firefox-*"` | Apenas Firefox nas três larguras; aceita também `chromium-*` e `webkit-*` |
| `npm run test:browser:report` | Abrir o relatório HTML da última execução Playwright |
| `npm run test:a11y` | Somente axe-core em Chromium desktop/mobile; resultados e violações no relatório Playwright |

O Jest usa ambiente Node e coleta cobertura por padrão na configuração atual. Build, lint, TypeScript e Jest verificam aspectos diferentes; Jest não substitui validação de interface no navegador.

Após `npm ci`, prepare os navegadores gerenciados pelo Playwright:

```sh
npx playwright install chromium firefox webkit
```

A execução dos testes não instala navegadores automaticamente. O comando instala as versões compatíveis com o Playwright do projeto e reutiliza as já disponíveis. Para uma única combinação, use, por exemplo, `npm run test:browser -- --project=webkit-mobile`.

O Playwright inicia Next em `PLAYWRIGHT_APP_URL` e Storybook em `PLAYWRIGHT_STORYBOOK_URL`, definidos no `.env`; essas portas devem estar livres. Se houver conflito, altere as variáveis e reinicie a execução. A prontidão dos servidores, a navegação e a lista de origens permitidas usam esses mesmos valores, sem escolha automática de outra porta. Encerre outro `next dev` deste checkout antes de executar, pois o Next compartilha o diretório `.next`. O carregamento das fontes pode exigir rede. Não é necessário configurar credenciais de backend para esses pilotos. Veja o [guia de testes](docs/testing.md#testes-de-navegador) para escopo, capturas e limitações.

As origens locais `APP_URL`, `STORYBOOK_URL`, `PLAYWRIGHT_APP_URL`, `PLAYWRIGHT_STORYBOOK_URL` e `PLAYWRIGHT_API_URL` são documentadas no `.env.example`. Use somente origens HTTP locais, sem caminhos; nos testes, mantenha o destino da API isolado e sem serviço. Rotas como `/login` e `/iframe.html` permanecem relativas.

## Documentação

Consulte o [índice de documentação](docs/README.md) para consultar arquitetura, design, convenções, implementação de componentes e testes. As instruções de implantação, variáveis de deploy e integração operacional permanecem no [runbook da Vercel](deploy/vercel.md).
