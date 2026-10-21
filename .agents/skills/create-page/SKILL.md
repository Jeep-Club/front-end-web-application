---
name: create-page
description: Implementar ou adaptar páginas e fluxos do Jeep Club no Next.js App Router, compondo layouts, fronteiras Server/Client, permissões, dados e navegação. Use para tarefas de tela ou funcionalidade; não para uma alteração isolada de primitiva, query ou operação backend.
---

# Implementar página ou fluxo

Siga o [AGENTS.md](../../../AGENTS.md). Esta Skill coordena a tela; consulte a responsabilidade específica de componente, Query ou servidor apenas se houver trabalho nessa fronteira, sem exigir todas as Skills.

## Referências

Use [architecture](../../../docs/architecture.md) para fronteiras e donos dos dados, [components-and-pages](../../../docs/components-and-pages.md) para execução e [design](../../../docs/design.md) para o contexto visual.

## Procedimento

1. Encontre a rota em `src/app`, seus layouts/grupos e consumidores em `src/components/pages`. Identifique requisito, parâmetros, permissões de entrada/operação e resultado verificável. Preserve o shell administrativo e PageHeader quando aplicáveis.
2. Confira os contratos de params/searchParams e a fronteira interativa necessária. Mantenha leitura/composição de servidor onde apropriado; hooks e handlers ficam no cliente. A lista em `src/app/(auth)/(dashboard)/admin/users/page.tsx` usa RSC/URL; seu detalhe é cliente/Query. Não inferir o mecanismo só pelo componente pai.
3. Escolha o dono da leitura/atualização antes de implementar. [AdminUsersPage](../../../src/components/pages/admin/users/index.tsx) altera filtros na URL e atualiza lista por router.refresh; [FinancialManagement](../../../src/components/pages/admin/gestao-financeira/index.tsx) usa Query e estado local. Preserve o fluxo adequado, sem introduzir Query, BFF ou camada intermediária por padrão.
4. Componha os controles, Form, Table e modais existentes. Separe comportamento específico da view quando trouxer clareza, sem gerar arquivos automaticamente. Reutilize as operações/schemas encontrados; trate mudanças remotas ou de cache no procedimento específico, sem duplicá-lo aqui.
5. Confira visibilidade de ação, acesso direto e autorização da operação separadamente. Menu financeiro e rota têm regras diferentes no código; não ampliar acesso para fazer a tela aparecer. Se o requisito depender de regra ambígua, esclareça essa parte sem inventar política.
6. Complete os estados de carga, erro/recuperação, vazio, mutação e atualização. Preserve valores em falha e as ações permitidas. Confira navegação direta, refresh e voltar/avançar; em usuários, verifique slot `@modal`, detalhe interceptado e conflito com `/new` se afetados.
7. Identifique os componentes da interface e suas stories. Avalie se a view ou composição alterada tem um exemplo isolável útil; nesse caso siga [create-storybook-story](../create-storybook-story/SKILL.md) para documentação, composição, referências e validação. Não force uma página com backend/sessão real a executar no catálogo nem extraia uma view apenas para preencher uma categoria. Mudanças internas sem efeito nos exemplos não exigem stories novas; mantenha o trabalho no escopo da tarefa.

## Verificação e entrega

Avalie os testes do fluxo e de seus componentes com [create-playwright-test](../create-playwright-test/SKILL.md) para decidir o que reutilizar, atualizar, acrescentar e executar conforme o impacto.

Use [testing](../../../docs/testing.md) para checks proporcionais. Verifique os consumidores da mutação, formulário e navegação alterados, além de responsividade, conteúdo longo e teclado no ambiente disponível. Relate fluxo escolhido, componentes/operações reutilizados, resultados e limites; testes Node não comprovam navegação ou layout completos.

## Quando não é necessária

Não usar para um ajuste isolado de componente, política de cache ou função de servidor sem composição de tela. Não exige criar nova rota quando a funcionalidade pertence a uma página existente.
