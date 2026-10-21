# Testes e verificações

Os comandos disponíveis ficam no [README](../README.md). Este guia descreve o alcance das verificações, isolamento e critérios para avaliar alterações.

## Ferramentas disponíveis

| Ferramenta/configuração | Alcance e limite |
| --- | --- |
| [Jest + ts-jest](../jest.config.ts) | Testes TypeScript em ambiente Node; globs tests/**/*.spec.ts e tests/**/*.test.ts, excluindo tests/browser/. Não há DOM/browser configurado nem descoberta de specs .tsx por essas globs |
| [ESLint](../eslint.config.mjs) | Regras Next core-web-vitals e TypeScript; o script lint usa ESLint CLI. Executar só arquivos alterados não equivale ao lint da raiz |
| [TypeScript](../tsconfig.json) | Strict/noEmit, aliases e tipos Next gerados. Typecheck é comando direto; não há script typecheck. Não valida runtime/backend |
| Build Next | Compilação/build de produção, dependente de ambiente/rede/fontes. Não substitui lint, Jest ou navegação |
| [Storybook](../.storybook/main.ts) | Catálogo isolado de Button, Input e PageHeader com autodocs, controles e seletor de viewport. Não executa uma suíte visual ou E2E |
| [Playwright](../playwright.config.ts) | Chromium, Firefox e WebKit reais; pilotos em tests/browser/, excluídos da coleta Jest. Interações, teclado, reflow e capturas exploratórias, sem autenticação ou backend |

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

## Testes de navegador

Os comandos de preparação dos navegadores, execução, seleção por projeto e abertura do relatório estão no [README](../README.md#comandos). A configuração inicia os dois servidores por `webServer`, sem reutilizar processos existentes, e usa um worker sem retries. O Next recebe apenas valores sintéticos de sessão e um backend local inacessível. Os projetos combinam os perfis oficiais Desktop Chrome, Desktop Firefox e Desktop Safari com viewports de 375×812, 768×1024 e 1440×900: são nove projetos, reutilizando os mesmos testes. Os nomes seguem `<motor>-<largura>`. Isso não emula aparelhos reais ou touch; WebKit gerenciado pelo Playwright não equivale ao Safari instalado em macOS/iOS. A instalação dos binários é explícita e independente da execução; consulte [navegadores](https://playwright.dev/docs/browsers) e [projetos](https://playwright.dev/docs/test-projects).

O [piloto](../tests/browser/pilot.spec.ts) usa seletores por papel/nome acessível e verifica:

- Table: a story existente `componentes-table--composicao-completa`, busca, limpeza por teclado, filtro, paginação e apresentação em tabela desktop ou acordeão nas larguras menores. Usa `embed=true`, que desativa autoplay no Storybook instalado, para que só o Playwright conduza essas interações. Isso não executa nem aprova o `play` da story.
- Login: campos, máscara de CPF, sequência de foco, indicador de foco do campo senha, alternância da senha e validação real de CPF inválido. Não envia credenciais válidas nem testa autenticação. Requisições não locais, APIs e métodos diferentes de GET são bloqueados e fazem o teste falhar; erros JavaScript não tratados também falham o piloto.
- Reflow: elementos principais visíveis, comportamento próprio de cada largura e ausência de overflow horizontal da página. Rolagem interna intencional da tabela não é proibida. Essas verificações não aprovam todos os conteúdos ou requisitos de acessibilidade.

A digitação sequencial do `play` de Table pode deixar a busca com caracteres incompletos e interromper suas assertions. O piloto Playwright preenche a busca com `fill` e verifica os resultados reais, mas não cobre essa sequência de eventos por caractere. Investigue separadamente a interação entre o campo controlado, React Hook Form e a atualização dos filtros antes de considerar esse comportamento aprovado; não altere o componente apenas para fazer a automação passar.

No login, campos renderizados no servidor podem ficar visíveis antes de receber os handlers React. No WebKit em 375px e 768px, o preenchimento imediato do CPF perdeu o valor; em investigação após a hidratação, a mesma entrada recebeu a máscara corretamente. Visibilidade e o evento `load` não garantem prontidão interativa. As assertions continuam exigindo o valor mascarado, sem retries ou esperas fixas para ocultar essa condição. A sincronização entre disponibilidade dos controles e hidratação requer tratamento próprio; esses cenários não estão aprovados apenas porque a máscara funciona depois da hidratação.

Cada teste salva uma captura exploratória de página inteira, anexada ao relatório HTML em `playwright-report/`, e arquivos por cenário em `test-results/`. Falhas preservam screenshot e trace do Playwright; o relatório oferece acesso ao trace. Esses diretórios são ignorados pelo Git e a próxima execução substitui os resultados anteriores. A captura exploratória mostra o estado final alcançado, inclusive quando houve falha, e não representa uma referência visual aprovada.

Não há snapshots visuais definitivos. Para adicionar comparações com `expect(page).toHaveScreenshot()` no futuro, primeiro estabilize dados, fontes, estado, SO e versão do navegador, aprove uma referência e versione as imagens resultantes. Revise diferenças antes de qualquer atualização explícita; não atualize snapshots automaticamente para resolver falhas. Consulte as referências oficiais de [webServer](https://playwright.dev/docs/test-webserver), [rede](https://playwright.dev/docs/network) e [comparação visual](https://playwright.dev/docs/test-snapshots).

## Limites e registro de resultados

O piloto Playwright não cobre fluxos autenticados, integração real com backend, regressão visual por snapshots ou auditoria automatizada de acessibilidade. Os testes Node com mocks continuam sem equivaler a integração completa. No Storybook, use o seletor de viewport para complementar a inspeção mobile, tablet e desktop, controles para alterar props e navegação por teclado para conferir interação. As stories ficam junto aos componentes como *.stories.tsx; demonstre apenas estados suportados pela API existente. O Input usa register=false no piloto, sem integrar React Hook Form.

O preview importa o CSS global e carrega as variáveis de Geist/Geist Mono como o layout. Preserva a resolução atual de font-sans, incluindo a divergência descrita em [design.md](design.md); não representa uma correção da tipografia da aplicação. O carregamento de fontes pode exigir rede.

Para validação de interface, conferir interação, DOM, teclado, foco, zoom, conteúdo longo e diferentes viewports. Screenshots complementam essas verificações; não certificam acessibilidade nem substituem avaliação humana. Uma integração real precisa de API isolada, dados sintéticos, credenciais próprias e limpeza controlada.

Ao entregar uma alteração, informe arquivos/escopo, comandos realmente executados, resultados/exit codes, falhas comparadas, artefatos e limitações. Separe inspeção estática, teste automatizado e avaliação manual. Não apresente resultados anteriores ou checks não executados como aprovação atual.
