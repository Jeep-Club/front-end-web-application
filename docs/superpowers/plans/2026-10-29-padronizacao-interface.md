# Correções dirigidas de interface — plano revisado

**Goal:** mitigar defeitos dos componentes atuais e prevenir novos problemas por documentação, skills e testes, sem migração geral.

**Spec:** [Escopo revisado pelo usuário](../specs/2026-10-29-padronizacao-interface.md).

**Decisão:** executar diretamente no checkout compartilhado `chore/config-agents`, preservando mudanças alheias. O pedido revisado autoriza este ciclo delimitado; não há nova etapa de aprovação. Não criar worktree, dependência, publicação ou commit.

## 1. Padrões e documentação

- [x] Trocar a exigência white/gray por tema/tokens em AGENTS e guias relevantes.
- [x] Registrar semântica, cursor de ação, teclado/foco, descrições e uso proporcional de tooltips também para controles locais.
- [x] Atualizar skills ui-component, storybook-story e playwright-test sem impor reorganização de páginas.
- [x] Validar frontmatter, links e coerência dos exemplos; verificar os resultados com uma revisão independente.

## 2. Regressões reproduzíveis

- [x] Acrescentar stories/testes de ID e ajuda no Input, erro/ajuda no Textarea, indicador de radio e opções Select desabilitadas.
- [x] Executar antes da implementação e confirmar falhas pelo motivo esperado.
- [x] Inspecionar contraste e `aria-hidden-focus` nos estados reais; corrigir somente a causa demonstrada.

## 3. Corrigir componentes atuais

Arquivos: `src/components/common/input/input.tsx`, `input-radio-group.tsx`, família
`select`, `textarea/textarea.tsx`, botões e `src/app/globals.css` conforme evidência.

- [x] Respeitar IDs externos e compor ajuda+erro por IDs reais.
- [x] Usar tokens dependentes do tema como padrão; variantes legadas apenas por compatibilidade.
- [x] Corrigir seleção visual/teclado, contraste e cursores nas fronteiras afetadas.
- [x] Preservar funcionalidades, estados pendentes, RHF, máscaras e semântica nativa.

## 4. Storybook e provas visuais

- [x] Adicionar alternância de tema ao preview, alcançando root e portais.
- [x] Atualizar documentação dos componentes afetados e adicionar Textarea, que não tinha story.
- [x] Demonstrar o uso atual nos dois temas; não extrair páginas apenas para preencher categorias.
- [x] Executar specs relacionados, axe e inspeção de imagens/teclado nas larguras configuradas.

## 5. Validação e entrega

- [x] TypeScript, ESLint afetado, build Storybook, revisão do diff e dos consumidores.
- [x] Registrar comandos/resultados, falhas anteriores e verificações impossibilitadas.
- [x] Entregar links e limitações sem declarar conformidade WCAG ou integração não executada.

## Ambiente de teste

A configuração padrão Playwright tentou iniciar Next isolado e encontrou outro
`next dev` já usando o lock do checkout. Não encerrar o processo do usuário.
As verificações dirigidas podem usar configuração temporária ignorada que inicia
somente Storybook e conserva fixture/projetos/scanner existentes. Isso não valida
Login ou integração autenticada. Manter o bloqueio da execução padrão explícito.

## Resultado da execução

- TypeScript e ESLint dos arquivos afetados: exit 0.
- Build Storybook: exit 0, com avisos de tamanho de chunks.
- Jest dirigido: 4 suítes, 33 testes aprovados (tema, máscaras de CPF/telefone e senha).
- Playwright componentes: 264 casos nos nove projetos funcionais e dois axe; 263 passaram na execução ampliada. Um caso Firefox registrou erro de HMR do Storybook durante edição de módulo, sem falha nas assertions do campo. Com arquivos estáveis, 18 verificações dirigidas nos três motores passaram, incluindo esse caso e o indicador disabled do Select. Não houve redução de assertions ou regras.
- Os crashes iniciais do Firefox foram reproduzidos em página vazia dentro do sandbox; fora da restrição de processos o diagnóstico e os testes funcionaram, com as mesmas fixtures e rede bloqueada.
- As 50 coletas axe geraram zero violações. Resultados incomplete foram analisados e continuam registrados, sem equivaler a aprovação de acessibilidade integral.
- Skills: frontmatter validado com js-yaml instalado e 48 referências locais verificadas; o quick_validate.py oficial não pôde iniciar por falta de PyYAML, sem instalar dependências. Revisão independente confirmou que novo botão local e input escuro não exigem migração ou variante.
- Documentação: 170 links locais dos 23 arquivos Markdown/MDX afetados verificados; build validou os imports.
- Inspeção visual: toolbar de tema, Docs de Textarea e seis capturas mobile de Input/Select/Table nos dois temas; controles e menus renderizados com o CSS real.

Comandos principais: `npx --no-install tsc --noEmit`, ESLint dos TS/TSX alterados, `npm run build-storybook`, Jest com `--runInBand --coverage=false --cache=false --runTestsByPath` e Playwright com as configurações temporárias abaixo.

Artefatos locais ignorados: `playwright-report/component-check/` preserva a execução ampliada, inclusive o erro de HMR; `playwright-report/final-check/` contém a reexecução verde. `test-results/component-check.config.ts` e `final-check.config.ts` reproduzem a seleção sem iniciar outro Next. Capturas manuais ficam em `test-results/manual-ui/`.

### Limites verificados

Login/E2E autenticado não foi reexecutado: o Next já aberto ocupa o lock do checkout e seu processo foi preservado. A fixture de componentes continua sem backend. Leitor de tela, dispositivos físicos e comparação por baselines não foram executados. Os plays não são aprovados pelo uso de embed=true. O CLI de review não reconheceu o devserver, embora o índice e as páginas respondessem HTTP 200; os links foram conferidos diretamente no catálogo local.

Incomplete do axe: bypass pede contexto de página completa nas stories isoladas; aria-valid-attr-value pede revisão da relação combobox/listbox em portal (ID e Escape conferidos no DOM); aria-hidden-focus envolve guardas de foco Radix; aria-prohibited-attr aponta o aria-label antigo do span de paginação. Este último permanece como pendência semântica preexistente, não padrão a reproduzir. Não foram ocultados nós ou desativadas regras.
