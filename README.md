# Jeep Club — frontend

Interface web do Jeep Clube Tamoios, com área pública, autenticação, perfil de associados e administração de usuários e finanças. As operações integradas dependem de uma API externa e das permissões do usuário.

Construído com Next.js (App Router), React e TypeScript; utiliza Tailwind CSS, TanStack Query e React Hook Form com Zod. As dependências declaradas estão em [package.json](package.json); as versões resolvidas, em [package-lock.json](package-lock.json).

## Começar localmente

Pré-requisitos:

- Node.js compatível com as dependências instaladas. O Next.js 16.4.3 declarado no package.json declara Node `>=20.9.0`; isso é um requisito do pacote, **não uma versão oficial de suporte do projeto**. Não há versão de runtime fixada na configuração do projeto.
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
| `npm run test:production-errors` | Contrato de erros de Server Actions em modo de produção; veja [o guia](deploy/server-action-errors.md) |
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

## Análise administrativa de pagamentos

Acesse **Painel administrativo → Análise de pagamentos** (`/admin/pagamentos`).
O backend configurado em `API_URL` deve expor `/billing/member-payments`.

- `BILLING_PAYMENT_READ`: libera o módulo, a listagem, os detalhes e os comprovantes.
- `BILLING_PAYMENT_CONFIRM` e `BILLING_PAYMENT_REJECT`: liberam cada decisão separadamente, junto à leitura.
- A listagem usa o filtro de status disponível na API, com paginação de 10, 20 ou 50 itens e parâmetros preservados na URL.
- Apenas pagamentos `PENDING_VALIDATION` podem ser decididos. Rejeitar exige motivo de até 500 caracteres.
- Comprovantes PDF, JPEG, PNG e WebP são consultados pela rota autenticada `/api/payments/{id}/receipt`.

Para validar manualmente, compare um usuário somente com leitura e outro com permissões de decisão; filtre pagamentos pendentes, abra um comprovante e confirme ou rejeite. Confira o novo status nos detalhes e na listagem. Uma decisão concorrente deve exibir o erro da API e recarregar o estado atual.

Testes do fluxo: `npm test -- --runInBand --coverage=false payment`.

## Documentação

Consulte o [índice de documentação](docs/README.md) para consultar arquitetura, design, convenções, implementação de componentes e testes. As instruções de implantação, variáveis de deploy e integração operacional permanecem no [runbook da Vercel](deploy/vercel.md).

## Administração de publicações (WEB-198)

Acesse `/admin/publications`. As áreas usam `/admin/publications/notice`, `/admin/publications/event` e `/admin/publications/service`; cada rota fixa o tipo no modal de criação. Eventos usam paginação real do backend e incluem todos os estados; não há busca ou filtro administrativo por estado. Avisos e serviços publicados usam o feed paginado; rascunhos e arquivados podem ser consultados pelo ID, pois a API não oferece suas coleções administrativas JSON. Exportações e feed não substituem esse inventário.

As três áreas abrem em lista compacta, com opção de grade via `view` na URL, sem outra consulta ao alternar. A pesquisa automática identifica números como ID e textos como título; também é possível escolher o modo. ID abre o detalhe administrativo da categoria, independentemente da página; título global permanece indisponível até haver suporte da API. Eventos permitem alternar a ordenação pela data de criação, com desempate por ID; no feed de avisos e serviços a ordem é fixa pela publicação mais recente. Avisos e serviços permitem incluir o período de publicação em UTC no feed, com reinício da paginação ao aplicar, remover ou limpar. Filtros de estado, prioridade/validade de avisos, categoria de serviços e período dos eventos ficam desabilitados e identificados como sem suporte. Não há busca nem filtros globais simulados sobre uma página de dados.

O componente compartilhado `Filters` organiza os filtros fornecidos pela tela, independentemente da pesquisa: mostra os três primeiros inicialmente e permite adicionar ou remover os demais. A tela mantém os valores e as regras de cada filtro.

Na visão geral, os indicadores e a lista de publicações recentes usam o feed e representam somente publicações publicadas, com as permissões e restrições de associação do feed. As prévias por categoria são as mais recentes por data de publicação; não representam prioridade ou próximos eventos. Uma seção separada mostra os eventos administrativos mais recentes, inclusive rascunhos. Os filtros de estado estão visíveis, mas ainda não são aplicados; listagens administrativas unificadas e indicadores de prioridade, capacidade ou próximos eventos dependem de contratos adicionais.

Os detalhes ficam em `/admin/publications/event/{id}`, `/admin/publications/notice/{id}` e `/admin/publications/service/{id}`, com as respectivas permissões de leitura. Criar não exige leitura: após salvar, o modal mantém o ID e oferece link somente quando autorizado. Se a publicação imediata de um evento falhar após o cadastro, o rascunho já existe; use seu ID para publicar, sem criar novamente.

Eventos têm estado editorial e operacional independentes. Publicar, finalizar e cancelar são comandos distintos. Cancelar afeta obrigações financeiras e elegibilidade de reembolso, sem reembolso automático; excluir não equivale a cancelar financeiramente. O dashboard exige permissão própria e mostra participação, capacidade derivada dos veículos e fatos financeiros. Participação CONFIRMED não comprova pagamento homologado.

Agenda usa horário local do navegador, convertido para Instant; cutoff é informado como UTC e vencimento permanece data civil. A edição omite campos intactos. Qualquer inscrição, inclusive cancelada, ou fato financeiro bloqueia agenda e regras; sem acesso ao dashboard, o servidor confirma a elegibilidade. Alterar cobranças substitui a coleção completa. Definição inline cria uma definição financeira real; remover regras não apaga definições ou dívidas.

Avisos podem ser criados, editados, publicados e arquivados. Arquivar é terminal: mantém consulta por ID, sem edição/republicação. A exclusão está disponível também para arquivados. Serviços têm somente leitura e exclusão administrativas; pedidos/propostas e suas revisões pertencem à WEB-227, cujas filas ainda não estão disponíveis neste módulo. Excluir um serviço preserva pedidos/propostas e pode impedir sua aprovação posterior.

Galerias combinam referências salvas e arquivos novos, com até cinco imagens e uma capa independente da ordem. Somente arquivos novos são enviados; a substituição envia a galeria completa com storageKeys. Remover uma referência não apaga a mídia global.
