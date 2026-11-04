# Arquitetura do frontend

O frontend usa Next.js App Router, componentes React de servidor e cliente e uma API externa. Este guia descreve a organização, as fronteiras e os fluxos de dados. Para executar o projeto, consulte o [README](../README.md).

## Mapa do projeto

```text
src/
  app/                  rotas, layouts, boundaries e Route Handlers
  actions/              operações remotas organizadas por domínio
  components/
    common/             controles, formulários, tabelas, modais e shell
    pages/              composição e comportamento específicos das telas
  config/               configuração de módulos administrativos e tour
  providers/            QueryClient, toast, modal e distribuição de permissões
  schemas/              schemas Zod de formulário, resposta e parâmetros
  services/             wrappers HTTP e assinatura/verificação de tokens
  stores/               estado compartilhado cliente com Zustand
  hooks/                hooks como useTour e useMediaQuery
  types/                contratos TypeScript, incluindo declarações globais .d.ts
  utils/                auth, permissões, rotas da API, URL, máscaras e validações
  mocks/                dados auxiliares; não representam persistência de backend
  proxy.ts              contexto da rota e atualização de sessão em requisições
public/                 assets estáticos
tests/                  testes Jest existentes
deploy/                 runbook operacional
docs/                   documentação técnica
```

O alias `@/*` aponta para `src/*` em [tsconfig.json](../tsconfig.json), com `strict: true`. A organização é por tipo de responsabilidade e domínio dentro dessas pastas; não há uma migração adotada para outra arquitetura de diretórios. Componentes compartilhados e de tela coexistem; nem toda lógica de domínio está extraída em hooks ou serviços.

## App Router e fronteiras servidor/cliente

[src/app](../src/app) contém `page.tsx`, `layout.tsx`, `error.tsx` e `not-found.tsx`. Grupos `(auth)`, `(noAuth)` e `(dashboard)` organizam layouts sem acrescentar segmentos à URL. O layout raiz importa o CSS global, configura fontes/metadata e envolve `children` em Suspense e [Providers](../src/providers/index.tsx).

Os arquivos de rota/layout inspecionados sem `use client` compõem a árvore de Server Components. Componentes interativos declaram a fronteira cliente; componentes importados dentro desse grafo também podem executar no cliente sem repetir a diretiva. O wrapper cliente de providers recebe `children`: isso não transforma automaticamente as páginas de servidor em componentes cliente.

| Fronteira | Responsabilidade e exemplo |
| --- | --- |
| Servidor | `src/app/(auth)/layout.tsx` lê cookies/headers e avalia acesso. A página de usuários aguarda searchParams e busca a lista no backend |
| Cliente | [AdminUsersPage](../src/components/pages/admin/users/index.tsx) altera URL, controla modais e executa mutações. [FinancialManagement](../src/components/pages/admin/gestao-financeira/index.tsx) controla abas e consultas interativas |
| Composição | `src/app/(auth)/(dashboard)/layout.tsx` verifica o cookie Me e passa nome/foto/onboarding ao DashboardShell cliente |
| HTTP próprio | [Route Handlers](../src/app/api) incluem logout e proxy de imagens; não há obrigação implementada de passar toda operação por um Route Handler |

Usuários possui layout com slot paralelo `@modal`, fallback `@modal/default.tsx` e interceptação `@modal/(.)[id]/page.tsx`. A navegação cliente para `/admin/users/123` pode apresentar detalhe em modal; a rota `[id]/page.tsx` também oferece o detalhe como página. Ambas compõem AdminUserDetailsLoader, que é **cliente** e usa Query; ser chamado por uma página de servidor não faz sua consulta ocorrer no Server Component. O ramo interceptado rejeita IDs não numéricos para não tratar `/new` como usuário.

## Server Functions, Actions e módulos de servidor

Os módulos [actions](../src/actions) de referência usam `use server` no topo e exportam funções assíncronas. Há leituras GET e mutações POST/PUT/PATCH: o nome da pasta ou sufixo Action não significa que toda função muda dados. Quando chamados por componentes cliente, são chamadas remotas gerenciadas pelo Next; o método GET/POST configurado no wrapper refere-se à chamada subsequente ao backend.

Nesta documentação, **Server Function** designa a função marcada para execução remota no servidor; **Server Action** descreve seu uso em uma ação/mutação da interface. O código usa nomes `...Action` também para leituras. As mutações de usuários e definições financeiras são acionadas por handlers/useMutation, sem depender de um `<form action={...}>` nativo.

Já [serverFetchWrapper](../src/services/fetchWrapper/serverFetchWrapper.ts), chamado diretamente pela página de usuários, é uma função comum usada no servidor: não tem `use server` e não é um endpoint remoto por esse motivo. `server-only` é uma proteção de importação, não uma diretiva para criar Actions; [frontendHeaders](../src/services/fetchWrapper/frontendHeaders.ts) a utiliza para proteger o acesso à credencial privada. Nem todo arquivo de services/utils tem esse marcador explícito.

Leituras iniciais RSC/URL e consultas interativas com Query coexistem; a escolha acompanha o dono dos dados em cada fluxo. A exposição de uma função remota deve responder a uma necessidade do cliente, não ao nome de sua pasta.

## Backend e wrappers HTTP

As URLs de recursos ficam em [utils/http/api.ts](../src/utils/http/api.ts). O fluxo predominante é navegador → Server Function → wrapper → API externa; a lista inicial de usuários chama o wrapper diretamente no servidor.

| Camada implementada | Comportamento |
| --- | --- |
| [fetchWrapper](../src/services/fetchWrapper/fetchWrapper.ts) | Executa fetch, define headers JSON/pt-BR, lê o corpo textual e tenta JSON.parse. HTTP sem sucesso lança `{ rawData, status }`; sucesso é validado por schema.safeParse, com falha lançando `{ zodError, rawData, status }`. Retorna `{ status, data }` validado |
| [serverFetchWrapper](../src/services/fetchWrapper/serverFetchWrapper.ts) | Exige API_URL, lê cookies de auth, anexa Bearer quando disponível e headers privados; não renova sessão nem escreve cookies |
| [actionFetchWrapper](../src/services/fetchWrapper/actionFetchWrapper.ts) | Prepara a mesma chamada; em código de sessão inválida tenta refresh, grava novos cookies por login e repete a operação |
| [frontendHeaders](../src/services/fetchWrapper/frontendHeaders.ts) | Monta X-Frontend-Key no servidor e impede sobrescrita da credencial pelo chamador; exige chave em produção. [frontendAccess](../src/services/fetchWrapper/frontendAccess.ts) é outro helper existente usado em fluxos próprios, como o proxy |

Uploads, downloads e imagens têm operações próprias, por exemplo [upload-image](../src/actions/media/upload-image.ts) e [proxy de imagens](../src/app/api/media/images/route.ts); não devem ser descritos como se usassem todos o envelope JSON do wrapper. Esses dois exemplos usam `cache: no-store` explicitamente; os wrappers genéricos repassam RequestInit e não impõem uma política global de cache.

**Limitações do tratamento de erros:** Actions de definições financeiras capturam falhas e lançam `new Error(mensagem, { cause })`; [apiError](../src/utils/http/apiError.ts) reconhece ApiProblem e preserva a mensagem de expiração. Isso não constitui contrato serializável definitivo de erro cliente/servidor, nem garante que message/cause mantenham o mesmo conteúdo no transporte em produção. O catch do refresh também envolve a chamada repetida: erro desta segunda chamada pode virar mensagem de sessão expirada. Não copiar esse comportamento como regra desejada.

## Autenticação, sessão e permissões

[loginAction](../src/actions/auth/login.ts) normaliza CPF, chama autenticação e trata tanto tokens de sessão quanto exigência de troca de senha. Na sessão normal, grava tokens e consulta contextos de autenticação, identidade e autorização; [me](../src/utils/auth/me.ts) prepara cookies assinados. Se a composição falha, a Action limpa a sessão.

[utils/auth/login](../src/utils/auth/login.ts) grava AuthAccessToken, AuthRefreshToken e AccessTokenExpiration. Refresh é HttpOnly; o access token e sua expiração são gravados com o padrão não HttpOnly. Me e Permissions são HttpOnly nos fluxos inspecionados. [cookieOptions](../src/utils/auth/cookieOptions.ts) centraliza Secure/SameSite/path; [services/token](../src/services/token) assina/verifica os dados de contexto com jose e o segredo de servidor. São cookies de contexto do frontend, distintos do token de acesso fornecido pela API.

[proxy.ts](../src/proxy.ts) fornece `x-route-pathname`, trata exigência de troca de senha e, para GET em caminhos com entrada exata na tabela de rotas, verifica expiração e pode renovar tokens/contextos. Não executa toda essa atualização para métodos não GET; sua checagem exata de caminho não é o mesmo mecanismo de resolução dinâmica usado pelo layout. O layout `(auth)` verifica sessão e Permissions, aplica regras de rota e fornece permissões ao UserProvider. Ausência de acesso resulta em notFound; sessão/contexto inválidos podem redirecionar para login/logout.

As responsabilidades de acesso estão distribuídas:

- [routePermissions](../src/utils/permission/routePermissions.ts): regras exatas, dinâmicas e de pai; entradas `all`/`any`; `/admin` recebe tratamento próprio no layout.
- [adminModules](../src/config/adminModules.ts): visibilidade dos módulos e alternativas de permissão no menu.
- [hasPermission](../src/utils/permission/hasPermission.ts): checagens da interface. [haveActionPermission](../src/utils/permission/actionPermissions.ts) está disponível para operações de servidor, mas não é aplicado uniformemente às Actions de usuários e definições financeiras.
- Backend: recebe JWT nas operações integradas. Ocultar um botão ou permitir acesso pelo layout não substitui autorização por operação na API.

**Divergência conhecida:** menu financeiro permite alternativas como PAYMENT_READ, enquanto a rota exige CHARGE_DEFINITION_READ. As Actions financeiras create/update não chamam haveActionPermission explicitamente. Não há proteção local uniforme por operação pelo simples uso de `use server`; cada operação e o backend precisam ser verificados ao alterar acesso.

## Donos do estado e caches

| Estado | Uso atual |
| --- | --- |
| URL | Filtros, página, tamanho, ordenação e aba da gestão de usuários; navegação usa router.replace e transição |
| TanStack Query | Dados remotos interativos: definições, métricas financeiras, detalhe/roles de usuário e mutações |
| Zustand | [userStore](../src/stores/userStore.ts) guarda permissões cliente; [UserProvider](../src/providers/auth/UserProvider/index.tsx) as preenche por efeito e limpa ao desmontar. [useRegisterStore](../src/stores/useRegisterStore.ts) mantém rascunho de cadastro. Esses stores não usam persist middleware nos arquivos citados |
| Estado local/contexto | Abas/paginação financeira e interação de tela; ModalProvider guarda abertura/conteúdo; não são um segundo cache de entidades |

[QueryProvider](../src/providers/QueryProvider/index.tsx) cria QueryClient com useState e configura handlers globais de QueryCache/MutationCache. Não define staleTime/retry globais próprios. Há opções locais, como retry false no detalhe de usuário e staleTime 30 segundos nas métricas financeiras.

O cache Query do navegador e os mecanismos de fetch/renderização do Next têm donos distintos. `router.refresh()` não equivale a invalidar Query; `invalidateQueries()` não invalida automaticamente dados do servidor Next. Nos fluxos de usuários e definições financeiras não há hidratação compartilhada RSC→Query nem revalidateTag/revalidatePath explícitos. Não se presume uma política universal de cache a partir disso.

As keys estão nos componentes; agrupe opções por domínio quando houver reuso e oriente invalidação pelos consumidores afetados. Métricas usam `["billing", "dashboard", card.title]`, separadas de `["billing", "charge-definitions", ...]`; invalidar definições não atualiza automaticamente a contagem. Esse descompasso precisa ser considerado ao alterar mutações e métricas.

## Tipos, schemas e formulários

[types](../src/types) contém contratos estáticos, muitos globais em .d.ts. [schemas](../src/schemas) valida dados em runtime; TypeScript não valida parâmetros recebidos remotamente. O wrapper exige schema de resposta, mas isso não implica que toda Action valide sua entrada.

[Form](../src/components/common/form/index.tsx) integra useForm, FormProvider e zodResolver, submetendo via handleSubmit com `noValidate`. O resolver ainda usa cast `any`. [chargeDefinitionFormSchema](../src/schemas/billing/chargeDefinition.ts) converte strings de campos numéricos e aplica regras condicionais; o mesmo arquivo contém schemas de resposta. A tipagem força correspondência com ChargeDefinitionFormData por cast, embora input de formulário e output transformado sejam distintos.

Create/update financeiros recebem ChargeDefinitionRequest e o serializam sem parse Zod próprio de payload/ID no servidor. Reaplicar indiscriminadamente o schema de formulário ao DTO já numérico pode ser incorreto. A separação e normalização definitivas ainda não foram implementadas.

## Fluxos de referência

### Usuários: lista no servidor, URL e mutação de status

1. `src/app/(auth)/(dashboard)/admin/users/page.tsx` aguarda searchParams e chama [parseAdminUserSearchParams](../src/utils/searchParam/admin/user.ts). O parser ignora valores inválidos/desconhecidos e usa status ACTIVE como padrão. A página omite status ALL ao montar a consulta; na aba applications não busca a lista de usuários.
2. A página chama serverFetchWrapper GET com adminUserListResponseSchema e entrega dados/parâmetros a AdminUsersPage. [listAdminUsersAction](../src/actions/admin/users/list.ts) existe, mas não é usada para essa leitura inicial; blocos Query comentados não são comportamento ativo.
3. AdminUsersPage altera filtros/sort/paginação na URL. A navegação entrega nova leitura RSC; UserManagementView recebe dados e handlers. O detalhe usa Query, conforme a fronteira descrita acima.
4. Ativar/desativar abre UserStatusConfirmationModal e executa useMutation com [patchUserStatusAction](../src/actions/admin/users/patchStatus.ts). A Action chama PATCH, valida resposta com adminUserSchema e retorna o usuário. O fluxo de sucesso atualiza a lista com router.refresh, não com cache Query de listagem.

Este é um exemplo de convivência RSC/URL e Query, não uma regra de que todo o módulo de usuários busca dados no servidor.

### Definições financeiras: Query, formulário e mutação

1. `src/app/(auth)/(dashboard)/admin/gestao-financeira/page.tsx` compõe FinancialManagement sem carregar lista no servidor. O componente cliente escolhe abas por permissões e estado local.
2. ChargeDefinitions usa queryKey `["billing", "charge-definitions", searchParams]`, enabled canRead e placeholderData anterior. [listChargeDefinitionsAction](../src/actions/billing/chargeDefinitions/list.ts) chama GET via actionFetchWrapper e valida página/resumo. Table recebe loading, fetching, erro e mensagem vazia.
3. [EditChargeDefinitionModal](../src/components/pages/admin/gestao-financeira/EditChargeDefinitionModal.tsx) carrega `["billing", "charge-definitions", id]` com getChargeDefinitionAction. Enquanto carrega exibe loading; sem dados após a tentativa oferece erro/retry; com dados monta Form. O fechamento fica disponível.
4. Criação/edição passam dados do Form a [create](../src/actions/billing/chargeDefinitions/create.ts)/[update](../src/actions/billing/chargeDefinitions/update.ts), com POST/PUT e schema de resposta. Em sucesso mostram toast, invalidam o prefixo `["billing", "charge-definitions"]` e fecham o modal.
5. Há onError local nos modais e handlers globais no QueryProvider; uma mesma falha pode produzir feedback duplicado. A invalidação não cobre automaticamente as keys de dashboard. Considere os handlers globais e os consumidores de cada key ao alterar esse fluxo.
