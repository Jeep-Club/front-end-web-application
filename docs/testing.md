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

Os testes de [Table](../tests/browser/table/table-interactions.spec.ts) e [login](../tests/browser/login/login-form.spec.ts) são organizados por comportamento, compartilham [fixtures locais](../tests/browser/fixtures.ts) e usam seletores por papel/nome acessível. Quando houver vários specs da mesma funcionalidade, agrupe-os em uma pasta, mantendo testes funcionais e de acessibilidade próximos. A fixture preserva isolamento, verificações de runtime e capturas exploratórias. Os cenários verificam:

- Table: a story existente `componentes-table--composicao-completa`, busca, limpeza por teclado, filtro, paginação e apresentação em tabela desktop ou acordeão nas larguras menores. Usa `embed=true`, que desativa autoplay no Storybook instalado, para que só o Playwright conduza essas interações. Isso não executa nem aprova o `play` da story.
- Login: campos, máscara de CPF, sequência de foco, indicador de foco do campo senha, alternância da senha e validação real de CPF inválido. Não envia credenciais válidas nem testa autenticação. Requisições não locais, APIs e métodos diferentes de GET são bloqueados e fazem o teste falhar; erros JavaScript não tratados também falham o piloto.
- Reflow: elementos principais visíveis, comportamento próprio de cada largura e ausência de overflow horizontal da página. Rolagem interna intencional da tabela não é proibida. Essas verificações não aprovam todos os conteúdos ou requisitos de acessibilidade.

Selecione a execução pelo impacto: ajustes locais pedem specs/cenários diretamente relacionados no projeto adequado; mudanças compartilhadas incluem consumidores afetados e outros motores/larguras conforme o risco; alterações estruturais, de fixture ou configuração pedem a suíte completa. Avalie sempre a cobertura existente; acrescente testes somente para comportamentos ou riscos relevantes ainda não demonstrados.

```sh
# Arquivo e projeto específicos
npm run test:browser -- tests/browser/table/table-interactions.spec.ts --project=chromium-mobile
# Mesmo fluxo nos três viewports de um motor, com filtro pelo nome do teste
npm run test:browser -- tests/browser/login/login-form.spec.ts --project="webkit-*" --grep="Login:"
# Conferir seleção sem executar o navegador
npm run test:browser -- --list --project="firefox-*"
# Suíte completa nos nove projetos
npm run test:browser
```

A digitação sequencial do `play` de Table pode deixar a busca com caracteres incompletos e interromper suas assertions. O piloto Playwright preenche a busca com `fill` e verifica os resultados reais, mas não cobre essa sequência de eventos por caractere. Investigue separadamente a interação entre o campo controlado, React Hook Form e a atualização dos filtros antes de considerar esse comportamento aprovado; não altere o componente apenas para fazer a automação passar.

No login, campos renderizados no servidor podem ficar visíveis antes de receber os handlers React. No WebKit, o preenchimento imediato do CPF perdeu o valor nas três larguras configuradas; em investigação após a hidratação, a mesma entrada recebeu a máscara corretamente. A ocorrência pode variar com o momento da interação e a ordem de execução: desktop também já passou sem mudança nas assertions. Visibilidade e o evento `load` não garantem prontidão interativa. As assertions continuam exigindo o valor mascarado, sem retries ou esperas fixas para ocultar essa condição. A sincronização entre disponibilidade dos controles e hidratação requer tratamento próprio; esses cenários não estão aprovados apenas porque a máscara funciona depois da hidratação.

Cada teste salva uma captura exploratória de página inteira, anexada ao relatório HTML em `playwright-report/`, e arquivos por cenário em `test-results/`. Falhas preservam screenshot e trace do Playwright; o relatório oferece acesso ao trace. Esses diretórios são ignorados pelo Git e a próxima execução substitui os resultados anteriores. A captura exploratória mostra o estado final alcançado, inclusive quando houve falha, e não representa uma referência visual aprovada.

Não há snapshots visuais definitivos. Para adicionar comparações com `expect(page).toHaveScreenshot()` no futuro, primeiro estabilize dados, fontes, estado, SO e versão do navegador, aprove uma referência e versione as imagens resultantes. Revise diferenças antes de qualquer atualização explícita; não atualize snapshots automaticamente para resolver falhas. Consulte as referências oficiais de [webServer](https://playwright.dev/docs/test-webserver), [rede](https://playwright.dev/docs/network) e [comparação visual](https://playwright.dev/docs/test-snapshots).

## Limites e registro de resultados

O piloto Playwright não cobre fluxos autenticados, integração real com backend ou regressão visual por snapshots. As verificações axe descritas abaixo não constituem auditoria completa de acessibilidade. Os testes Node com mocks continuam sem equivaler a integração completa. No Storybook, use o seletor de viewport para complementar a inspeção mobile, tablet e desktop, controles para alterar props e navegação por teclado para conferir interação. As stories ficam junto aos componentes como *.stories.tsx; demonstre apenas estados suportados pela API existente. O Input usa register=false no piloto, sem integrar React Hook Form.

## Acessibilidade automatizada

Os specs [login.a11y](../tests/browser/login/login.a11y.spec.ts) e [table.a11y](../tests/browser/table/table.a11y.spec.ts) reutilizam o isolamento local e o scanner [accessibility.ts](../tests/browser/accessibility.ts). O login é analisado inicialmente e após validação de campos vazios; Table, inicialmente, após expansão mobile/filtro desktop e no estado vazio. Os testes funcionais existentes continuam responsáveis pelos demais fluxos e pelas falhas de hidratação: a análise axe não comprova prontidão do formulário.

O adaptador `@axe-core/playwright` 4.11.1 usa regras axe-core 4.11.x. As tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` e `wcag22aa` selecionam as regras disponíveis para WCAG até 2.2 A/AA; elas não cobrem todos os critérios da norma. O axe verifica condições identificáveis no DOM renderizado, como labels, nomes acessíveis, ARIA, contraste textual e relações semânticas. Cada estado gera um JSON completo no relatório, com regra, impacto, seletor, explicação, referência e resultados `incomplete` que exigem análise humana. Violações fazem o teste falhar; assertions soft permitem coletar também os estados seguintes sem ignorar falhas.

```sh
npm run test:a11y
npm run test:a11y -- tests/browser/login/login.a11y.spec.ts --project=a11y-chromium-desktop
```

O piloto usa somente dois projetos Chromium: 1440×900 e 375×812, pois Table troca sua estrutura entre tabela e acordeão. Os nove projetos funcionais Chromium/Firefox/WebKit ignoram `*.a11y.spec.ts`; os projetos `a11y-chromium-*` coletam somente esses specs. `npm run test:browser` inclui ambos os grupos. Para executar apenas os funcionais, selecione `--project="chromium-*" --project="firefox-*" --project="webkit-*"`. Amplie auditorias para outros motores ou larguras quando houver diferenças relevantes, sem repetir cada scan nos nove projetos por padrão.

O relatório HTML, screenshots e traces de falha usam os mecanismos existentes. Não desative regras nem exclua elementos para fazer um scan passar. Revise especialmente contraste indeterminado, navegação e retorno de foco, leitura/anúncio dos erros com leitor de tela, zoom/reflow e controles com aparência de link. Problemas de teclado, contexto e experiência assistiva podem passar pelo axe. São necessárias avaliações manuais complementares; aprovação automatizada não certifica conformidade. Referências: [Playwright e axe](https://playwright.dev/docs/accessibility-testing) e [API do axe-core](https://github.com/dequelabs/axe-core/blob/develop/doc/API.md).

O scanner aguarda fontes e o término das animações finitas em andamento, sem espera fixa, e grava `axe-<estado>.json` no diretório do cenário antes de verificar violações. No código atual, a regra `color-contrast` identifica os seguintes problemas (mínimo esperado: 4,5:1):

| Contexto | Contraste observado | Referência para avaliação da correção |
| --- | --- | --- |
| Cor de texto dos campos CPF/senha em erro, vermelho sobre cinza | 1,71:1 | [Input](../src/components/common/input/input.tsx): rever a aplicação de text-input-border-error conforme a superfície, conferindo também conteúdo preenchido e placeholder, sem alterar indiscriminadamente o token global |
| Mensagens de validação vermelhas sobre o fundo azul do login | 3,92:1 | [Input](../src/components/common/input/input.tsx): rever a cor do texto de erro no contexto escuro |
| Rótulos Nome/Veículo do acordeão mobile | 3,69:1 | [Table.Content](../src/components/common/table/table-content.tsx): avaliar contraste do texto secundário text-j-gray-400 |

Há resultados `incomplete` para o contraste do botão Voltar no login e para `aria-label` aplicado ao span de paginação de [Table.Pagination](../src/components/common/table/table-pagination.tsx), sem papel que suporte claramente esse nome. Precisam de avaliação manual e semântica, respectivamente; não são equivalentes a aprovações nem são descartados pelo relatório. As correções de produção devem ser avaliadas separadamente.

O preview importa o CSS global e carrega as variáveis de Geist/Geist Mono como o layout. Preserva a resolução atual de font-sans, incluindo a divergência descrita em [design.md](design.md); não representa uma correção da tipografia da aplicação. O carregamento de fontes pode exigir rede.

Para validação de interface, conferir interação, DOM, teclado, foco, zoom, conteúdo longo e diferentes viewports. Screenshots complementam essas verificações; não certificam acessibilidade nem substituem avaliação humana. Uma integração real precisa de API isolada, dados sintéticos, credenciais próprias e limpeza controlada.

Ao entregar uma alteração, informe arquivos/escopo, comandos realmente executados, resultados/exit codes, falhas comparadas, artefatos e limitações. Separe inspeção estática, teste automatizado e avaliação manual. Não apresente resultados anteriores ou checks não executados como aprovação atual.
