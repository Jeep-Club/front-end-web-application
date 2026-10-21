---
name: create-ui-component
description: Criar ou adaptar componentes React do Jeep Club, incluindo composição, apresentação, estados e acessibilidade. Use para trabalho em componentes compartilhados ou específicos de tela; não para uma tarefa exclusivamente de consulta, operação de servidor ou documentação.
---

# Criar ou adaptar componente

Siga o [AGENTS.md](../../../AGENTS.md). Esta Skill trata do componente; coordenação de rota, Query e operação remota só entram quando necessárias ao requisito.

## Referências

Consulte [design](../../../docs/design.md) para contexto visual, [desenvolvimento](../../../docs/development.md) para granularidade e [componentes e páginas](../../../docs/components-and-pages.md) para composição. Valores e APIs permanecem no código.

## Procedimento

1. Localize o consumidor e procure equivalentes em `src/components/common` e na pasta da tela. Inspecione props, exports e estados antes de criar outra implementação. Determine qual comportamento precisa mudar.
2. Decida a responsabilidade: common para apresentação/interação sem regra de domínio; components/pages para coordenação específica. Prefira compor; extraia quando houver reuso ou ganho concreto. Um componente principal por TSX admite helpers privados coesos, como os de Table.Content.
3. Use o contexto visual e a primitiva existente. [Table](../../../src/components/common/table/index.ts) oferece composição de listas; [ChargeDefinitionFormFields](../../../src/components/pages/admin/gestao-financeira/ChargeDefinitionFormFields.tsx) compartilha campos entre criação/edição sem virar formulário universal. Não adicionar variante só para um consumidor se composição local resolver.
4. Preserve atributos nativos, labels, erros e nomes acessíveis. Defina loading, erro, vazio, sucesso e disabled quando pertinentes. Comece pela menor largura e confira conteúdo longo, teclado e foco; limite de altura/scroll não comprova acessibilidade de modal. Consulte as lacunas de Select/ModalRoot no guia antes de reproduzi-las.
5. Revise os consumidores afetados pela mudança de props/estilo. Mantenha dados e operações com seus donos atuais; não levar uma Action de domínio para uma primitiva nem criar fetch duplicado para preencher o componente.

## Verificação e entrega

Selecione checks em [testing](../../../docs/testing.md): tipos/lint e testes de comportamento afetado, quando aplicáveis. O teste [editChargeDefinitionModal](../../../tests/editChargeDefinitionModal.spec.ts) é referência de erro/retry e callbacks em Node, não prova visual ou de foco. Para UI, registre estados/viewports/interações realmente verificados e o que exige navegador. Entregue componente alterado, consumidores, motivo do reuso/extração e limitações, sem criar catálogo ou ferramenta adicional.

## Quando não é necessária

Não usar para somente alterar query keys/cache, integração backend ou texto documental. Uma página que apenas compõe componentes existentes pode seguir o procedimento de página sem executar esta Skill.
