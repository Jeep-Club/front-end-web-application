# Testes e verificações

Os comandos disponíveis ficam no [README](../README.md). Este guia descreve o alcance das verificações, isolamento e critérios para avaliar alterações.

## Ferramentas disponíveis

| Ferramenta/configuração | Alcance e limite |
| --- | --- |
| [Jest + ts-jest](../jest.config.ts) | Testes TypeScript em ambiente Node; globs tests/**/*.spec.ts e tests/**/*.test.ts. Não há DOM/browser configurado nem descoberta de specs .tsx por essas globs |
| [ESLint](../eslint.config.mjs) | Regras Next core-web-vitals e TypeScript; o script lint usa ESLint CLI. Executar só arquivos alterados não equivale ao lint da raiz |
| [TypeScript](../tsconfig.json) | Strict/noEmit, aliases e tipos Next gerados. Typecheck é comando direto; não há script typecheck. Não valida runtime/backend |
| Build Next | Compilação/build de produção, dependente de ambiente/rede/fontes. Não substitui lint, Jest ou navegação |
| [Storybook](../.storybook/main.ts) | Catálogo isolado de Button, Input e PageHeader com autodocs, controles e seletor de viewport. Não executa uma suíte visual ou E2E |

O Jest coleta cobertura por padrão, com relatórios text/lcov/html em coverage. A coleta está restrita aos utilitários definidos na configuração, não à aplicação inteira. Os argumentos sem cobertura/cache no README evitam esses artefatos, mas testes individuais ainda podem escrever arquivos.

## Organização e escolha do teste

Os testes ficam em [tests](../tests), com arquivos .spec.ts e cenários em describe/it. Nomeie pelo comportamento/domínio. Não crie estrutura de fixtures/helpers sem reuso concreto.

Use testes unitários para parsing, transformação, schemas e regras com entradas/saídas claras. Testes de comportamento de componente no harness Node são úteis para requisitos delimitados, como recuperação de erro; stubs não devem substituir a parte essencial do comportamento avaliado.

| Referência | Cobertura real |
| --- | --- |
| [identityProfile.spec.ts](../tests/identityProfile.spec.ts) | Schema de identidade/adminUser, foto ausente e URL de proxy; não cobre CRUD/navegação de usuários |
| [billingManagement.spec.ts](../tests/billingManagement.spec.ts) | URLs/parâmetros, schemas, operações financeiras e visibilidade de módulo, com wrapper mockado |
| [editChargeDefinitionModal.spec.ts](../tests/editChargeDefinitionModal.spec.ts) | Render estático/callbacks de loading, erro, retry, valores, submit, invalidação e Escape simulado; hooks/Form/operações substituídos, sem integração RHF/Query ou foco real |
| [useTour.spec.ts](../tests/useTour.spec.ts) | Ordem/presença dos passos, permissão booleana e callbacks desktop/mobile; não executa driver.js no navegador |
| [frontendApiRefresh.spec.ts](../tests/frontendApiRefresh.spec.ts) | Retry troca Bearer e preserva credencial privada em cenário mockado; não cobre todos os erros após refresh |
| [financialExport.spec.ts](../tests/financialExport.spec.ts) | CSV, normalização, estrutura e limites de PDF; não aprova aparência do documento |

Assertions semânticas verificam presença, ausência, quantidade, ordem e efeitos relevantes. Comparação de referência entre objetos não substitui contrato de conteúdo/comportamento; correspondência parcial genérica também pode esconder erro.

## Mocks e isolamento

- Use jest.mock/jest.mocked na fronteira fora do objetivo do teste; valide chamadas e retorno de quem está sob teste. Módulos default precisam manter o formato necessário, como __esModule/default.
- mockReset remove implementação/chamadas; clearAllMocks limpa chamadas, sem equivaler a reset completo. Configure retorno por cenário e restaure spies substituídos.
- Testes de headers/deployment/refresh usam process.env sintético e restauram o original. Nunca carregar credenciais reais ou usar produção como fixture.
- useTour restaura window; o teste do modal restaura document/useEffect em finally. EventTarget simula eventos locais, não DOM/layout.
- Fake timers/setSystemTime fixam instante, não timezone. Restaure timers e explicite relógio/fuso conforme o contrato testado; não escolha timezone para fazer uma expectativa passar.
- O mapper usa [styleMock.cjs](../tests/__mocks__/styleMock.cjs), que retorna objeto vazio. Permite importação CSS transitiva sem validar estilos, nomes de classes ou aparência.

financialExport pode escrever um preview se FINANCIAL_PDF_PREVIEW estiver definida. É opção do teste, não requisito da aplicação. Confira efeitos/variáveis antes de executar suítes que geram artefatos. Mock de autenticação não comprova autorização real.

## Cuidados técnicos conhecidos

As expectativas temporais de [getCurrentDateAndTime](../tests/getCurrentDateAndTime.spec.ts) e [validateBirthDate](../tests/validateBirthDate.spec.ts) combinam instantes UTC com código que usa calendário local. Congelar o tempo não torna o resultado independente da máquina. Teste data civil, bissextos, fronteiras de idade e horário conforme a semântica da função; não ajuste regra de negócio apenas para satisfazer a expectativa.

O cenário de erro de [medicalProfileActions](../tests/medicalProfileActions.spec.ts) deve representar o envelope reconhecido por [apiError](../src/utils/http/apiError.ts). Confira code/status/detail e erros de campo antes de flexibilizar parser ou fixture.

No lint, não use casts any, interfaces vazias, desativação de regra ou alteração de dependências de hooks só para silenciar diagnóstico. Diferencie regra de tipos, dependência de efeito e símbolo não usado; preserve comportamento ao corrigir. Avisos e erros têm severidades distintas, e o resultado global precisa ser observado na execução.

TypeScript inclui tipos de rotas gerados pelo Next. Se um diagnóstico apontar rota ausente em .next, confronte o artefato com o checkout e o mecanismo de geração antes de alterar produção ou tsconfig. Não editar tipos gerados manualmente nem ocultar erro por configuração.

## Verificação proporcional e regressões

| Alteração | Verificação relevante |
| --- | --- |
| Documentação | Links, caminhos/símbolos, conteúdo versus fonte, diff/whitespace |
| Schema/regra/DTO | Valores válidos/inválidos, fronteiras e transformações, lint e TypeScript |
| Operação/query/mutação | Sucesso/falha e atualização dos consumidores; mock de wrapper não comprova HTTP real |
| UI | Estados e callbacks no ambiente atual; teclado, foco, layout e responsividade precisam de browser |
| Código compartilhado/configuração | Checks dirigidos e ampliação para suítes afetadas/Jest completo conforme impacto; build quando necessário |

Não adicionar teste que só espelha implementação ou texto trivial. Execute a suíte relevante e amplie quando houver dependência compartilhada ou dúvida de regressão. Não altere teste/snapshot apenas para obter verde.

Para comparar falhas, registre revisão do código, diff, comando/flags e ambiente. Use o mesmo alvo e condições; totais iguais não provam falhas iguais. Confronte suíte/cenário/diagnóstico. Sem referência comparável, classifique como inconclusivo e investigue, sem descartar trabalho local. Não confunda falha de ambiente, contrato de fixture e regressão funcional.

## Limites e registro de resultados

Não há harness de navegador/E2E, suíte visual, automação de acessibilidade ou ambiente de integração real com backend configurado. Alguns testes combinam módulos com mocks; isso não equivale a integração completa. Playwright não está instalado. No Storybook, use o seletor de viewport para inspecionar mobile, tablet e desktop, controles para alterar props e navegação por teclado para conferir interação. As stories ficam junto aos componentes como *.stories.tsx; demonstre apenas estados suportados pela API existente. O Input usa register=false no piloto, sem integrar React Hook Form.

O preview importa o CSS global e carrega as variáveis de Geist/Geist Mono como o layout. Preserva a resolução atual de font-sans, incluindo a divergência descrita em [design.md](design.md); não representa uma correção da tipografia da aplicação. O carregamento de fontes pode exigir rede.

Para validação de interface, conferir interação, DOM, teclado, foco, zoom, conteúdo longo e diferentes viewports. Screenshots complementam essas verificações; não certificam acessibilidade nem substituem avaliação humana. Uma integração real precisa de API isolada, dados sintéticos, credenciais próprias e limpeza controlada.

Ao entregar uma alteração, informe arquivos/escopo, comandos realmente executados, resultados/exit codes, falhas comparadas, artefatos e limitações. Separe inspeção estática, teste automatizado e avaliação manual. Não apresente resultados anteriores ou checks não executados como aprovação atual.
