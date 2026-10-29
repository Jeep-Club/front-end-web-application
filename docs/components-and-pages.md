# Implementar componentes e páginas

Use [development.md](development.md) para convenções, [architecture.md](architecture.md) para fronteiras/transporte/cache e [design.md](design.md) para apresentação. Este guia organiza a implementação a partir de componentes e fluxos existentes.

## 1. Identificar a referência e o escopo

Localize rota/consumidores, permissões e contrato existentes. Procure primeiro por componente, operação, schema, tipo e query do mesmo domínio. Escolha uma referência da tarefa: lista de usuários para RSC/URL; definições financeiras para interação Query/formulário. Não copiar o módulo inteiro nem blocos comentados.

Defina o resultado verificável, os estados necessários e a menor alteração. Se exigir decidir permissão, regra de negócio ou contrato não definido, esclareça o comportamento antes de implementar a parte dependente. Não introduzir uma nova biblioteca para completar uma receita.

## 2. Escolher componente comum ou de página

- **Comum:** comportamento/apresentação reutilizável sem conhecimento de backend/domínio. Consulte [button](../src/components/common/button), [input](../src/components/common/input), [select](../src/components/common/select), [Form](../src/components/common/form/index.tsx), [Table](../src/components/common/table/index.ts) e [PageHeader](../src/components/common/page-header/index.tsx).
- **Específico:** coordenação de operação, permissão e interação daquela tela, em components/pages do domínio. [UserManagementView](../src/components/pages/admin/users/UserManagementView.tsx) recebe dados/handlers; [AdminUsersPage](../src/components/pages/admin/users/index.tsx) conecta navegação e operações.
- **Composição de domínio:** [ChargeDefinitionFormFields](../src/components/pages/admin/gestao-financeira/ChargeDefinitionFormFields.tsx) reúne campos usados por dois modais. Reuso real justifica o arquivo, sem promovê-lo a common ou criar formulário por configuração.

Inspecione props e estados da primitiva antes de alterar sua API. Prefira composição à introdução de dezenas de flags. Use um componente principal por TSX como preferência, admitindo helpers privados coesos; os critérios de extração estão em development.md. Os contratos atuais de modal/campos têm limitações; não substituir famílias em lote para implementar um consumidor.

## 3. Montar rota e fronteira Server/Client

Mantenha entrada da rota/layout pequena para parâmetros e composição. Inspecione o grupo/layout pai e quem fornece sessão/shell. Em rotas administrativas, reutilize o shell e PageHeader em vez de montar outra navegação. Aguarde params/searchParams como nos exemplos atuais e valide conforme o contrato do domínio; não esconder ID inválido com cast.

Coloque estado de interação, hooks e handlers na fronteira cliente necessária. A página servidor pode compor um componente cliente sem migrar toda leitura. A referência de usuários tem página de lista servidora, mas detalhe cliente/Query, inclusive quando aberto pela rota interceptada. Se alterar navegação de detalhe, conferir acesso direto, refresh, voltar/avançar, slot/modal e conflito com `/new`; consulte os caminhos e fluxo em architecture.md.

## 4. Escolher e conectar a leitura

| Procedimento RSC/URL — referência usuários | Procedimento Query — referência financeira |
| --- | --- |
| Inspecionar `src/app/(auth)/(dashboard)/admin/users/page.tsx` e [parser](../src/utils/searchParam/admin/user.ts). Identificar filtros válidos/defaults e montar consulta somente com parâmetros do contrato | Inspecionar [ChargeDefinitions](../src/components/pages/admin/gestao-financeira/index.tsx) e operações list/get. Identificar dados que variam, permissão e parâmetros antes de montar a query |
| Buscar a lista no servidor com wrapper/schema existentes; passar dados/parâmetros à tela. Não acrescentar Query para buscar novamente a mesma lista no mount | Reutilizar a key existente de lista `["billing", "charge-definitions", searchParams]` ou detalhe `["billing", "charge-definitions", id]`. Não usar a mesma key para shapes diferentes ou omitir parâmetros que mudam o resultado |
| Alterar filtros/página/sort com o fluxo URL da tela. A referência usa router.replace, transição e reset de página nos filtros; preservar navegação compartilhável | Conferir enabled, placeholderData e defaults do QueryProvider. Lista financeira usa enabled por permissão e dados anteriores; não presumir staleTime/retry globais personalizados |
| Após mutação de status, o consumidor usa router.refresh para obter nova lista; não invalidar uma Query de listagem que não é o dono desses dados | Após mutação, mapear quais consumidores precisam atualizar. O prefixo de definições alcança lista/detalhe, mas não as métricas em outra key |

RSC/URL e Query coexistem; não elegem um mecanismo único para todas as páginas. Para evitar requisições duplicadas, procure consumidores da key, leitura inicial existente e ownership antes de adicionar fetch/efeito. Não espelhar dados Query em Zustand/useState sem motivo concreto. Evite inventar um hook/registry por endpoint.

Keys/opções ainda estão distribuídas nos componentes; confira os consumidores antes de alterar a invalidação. Ajustar cache/staleTime/retry exige considerar frequência, erro e consumidores; não adotar números da métrica financeira como default universal. Uma nova operação deve explicitar seu efeito no cache, sem invalidar tudo por hábito ou replicar a lacuna conhecida.

## 5. Reutilizar operação de servidor e contrato

Localize a Action/função e seus chamadores antes de criar outra. Verifique entrada, schema de resposta, método e permissões por operação. Reutilize serviço/URL já existente; mantenha segredos no servidor. A escolha entre função comum de leitura e função remota deve respeitar o contexto de cookies descrito em architecture.md, não o sufixo Action.

Na gestão financeira, [create](../src/server/actions/billing/chargeDefinitions/create.ts) e [update](../src/server/actions/billing/chargeDefinitions/update.ts) serializam ChargeDefinitionRequest e validam a resposta. Isso **não** comprova validação de entrada/ID no servidor. As funções atuais não fazem parse próprio desses parâmetros. Não criar BFF/serviço paralelo ou aplicar transformação de formulário duas vezes para contornar a pendência.

Confirme as limitações de erro/refresh descritas na arquitetura antes de reutilizar a operação. Não transportar cause como contrato público nem transformar retorno de erro em sucesso. Mudança de contrato precisa preservar os consumidores e ter comportamento definido.

## 6. Implementar formulário

1. Localizar schema, tipos, formulário e campos equivalentes. Separar entrada digitada, output transformado e DTO; conferir defaults e dados carregados antes de preencher edição.
2. Compor Form existente e campos RHF, com nomes correspondentes ao contrato. InputRegister usa contexto/controller; Select exportado pela família é o adaptador registrado, e Select.Unregister é a base sem registro.
3. Usar os tokens de aparência resolvidos por `data-theme`, conforme design.md. Props de variante `white`/`gray` existentes são legado de compatibilidade; não são requisito para campos novos nem motivo para migração em massa. Reutilizar a composição financeira quando apropriada, sem espalhar overrides do domínio.
4. Compartilhar somente os campos realmente comuns, como criação/edição financeira. useWatch em ChargeDefinitionFormFields mostra dias de tolerância conforme política; preservar regra/valores do contrato, sem inferir autorização a partir de visibilidade.
5. Conectar submit à operação/useMutation existente, indicar pending, impedir envio duplicado e preservar valores em falha. Verificar sucesso/falha antes de fechar ou mostrar confirmação.
6. Conferir semântica, label/required/erro/ajuda, descrição acessível, foco e comportamento de teclado também em controles locais que não usam componentes compartilhados. Mensagens de erro devem ser associadas por descrição acessível. Reuso não comprova acessibilidade completa.

Referências: [CreateChargeDefinitionModal](../src/components/pages/admin/gestao-financeira/CreateChargeDefinitionModal.tsx), [EditChargeDefinitionModal](../src/components/pages/admin/gestao-financeira/EditChargeDefinitionModal.tsx) e [schema](../src/schemas/billing/chargeDefinition.ts). Casts atuais do schema/resolver e a transformação string→número são limitações a avaliar, não padrão para copiar. Confirme a entrada e a saída esperadas antes de reutilizar esse schema.

## 7. Completar estados e feedback

| Situação | O que verificar no procedimento |
| --- | --- |
| Loading inicial | Distinguir espera de erro/ausência. Usar skeleton/loading da região ou boundary existente quando adequado, sem novo wrapper obrigatório |
| Erro de leitura | Mensagem contextual, fechamento/navegação disponíveis e retry quando aplicável; o modal de edição financeira é uma referência |
| Vazio | Só representar resposta válida sem itens; distinguir filtros sem resultado e falta de permissão. Oferecer limpar/criar apenas se permitido |
| Atualização/refetch | Indicar fetching e preservar contexto quando o componente permitir. Table.Content ainda substitui dados pelo ramo error: isso é limite atual, não comportamento desejado universal |
| Mutação | Pending/erro/sucesso explícitos; sem sucesso falso ou fechamento em falha. Verificar lista, detalhe e derivados após êxito |
| Feedback | Identificar handlers globais e locais antes de acrescentar toast. Há feedback global e local que pode se duplicar; uma falha não deve gerar mensagens redundantes |

Table.Root/Content/Pagination já oferecem composição/estados; inspecione os consumidores antes de criar outra tabela. Os contratos técnicos de erros/cache permanecem na arquitetura, não são redefinidos por esta tabela de UX.

## 8. Permissões, navegação e ação perigosa

Mapeie visibilidade, acesso direto à rota e autorização por operação separadamente. Consulte helpers/configuração existentes; não ampliar permissão para liberar UI nem considerar `enabled: canRead` uma barreira de segurança. Menu, rota e checagem local por operação não estão uniformizados na gestão financeira; confira as diferenças descritas na arquitetura.

Use [UserStatusConfirmationModal](../src/components/pages/admin/users/UserStatusConfirmationModal.tsx) como referência de confirmação com identificação do usuário, consequência e indicação de operação em andamento. [patchUserStatusAction](../src/server/actions/admin/users/patchStatus.ts) é a operação conectada na tela. Reutilizar intenção não significa copiar cegamente bloqueio de fechamento, toast ou foco; conferir as limitações do modal e o comportamento esperado. Nunca depender apenas da cor vermelha para explicar risco. Não criar confirmação destrutiva onde o fluxo não exige, nem mudar regra de negócio por estilo.

## 9. Apresentação, mobile-first e acessibilidade

Siga contexto e fontes executáveis de design.md; o Design System atual consiste nas primitivas/tokens existentes, com contratos ainda em evolução. Geist é a fonte de referência, mas o mapeamento global ainda não está alinhado.

Comece com fluxo vertical e ações essenciais alcançáveis; aumente colunas quando houver espaço de conteúdo. Escolha ordem/resumo da tabela mobile conscientemente, sem remover função só para caber. Verifique texto longo, valores, zoom, erros, vazio e altura com teclado virtual. Todo controle, inclusive o implementado localmente, deve oferecer semântica, nome/descrição acessíveis conforme necessidade, operação por teclado, foco visível e estados disabled/pending comunicados. Ajuda importante deve estar visível ou ser descrita; tooltips para ações ambíguas precisam funcionar por foco/hover e Escape, como complemento. Verifique também scroll e fechamento de modal/drawer; ModalRoot não garante foco/inert completos. Consulte o contrato executável ao modificar componentes ou variantes legadas.

## 10. Validar e entregar

Escolha verificações conforme [testing.md](testing.md) e comandos do README. Para lógica de formulário/contrato, testar valores válidos/inválidos, limites e conversões; para query/mutação, erro, retry e atualização dos consumidores; para permissão, presença/ausência das ações e acesso autorizado conforme contrato confirmado. Teste não deve só repetir identidade de objeto ou implementação.

Referências existentes: [editChargeDefinitionModal.spec.ts](../tests/editChargeDefinitionModal.spec.ts) verifica loading/erro/retry/fechamento/sucesso com harness Node; [useTour.spec.ts](../tests/useTour.spec.ts) verifica semanticamente passos/callbacks desktop/mobile. Nenhum comprova layout, foco real ou comportamento completo em browser. Para validar integração DOM, use ambiente apropriado; o harness atual não substitui essa verificação.

Na revisão final: conferir caminho feliz e falha, dados longos/estados, tipo/lint/testes relevantes, diff e consumidores afetados; relatar resultados e limites. Se browser/ambiente isolado não estiver disponível, dizer o que falta em vez de aprovar screenshots inexistentes. Não atualizar snapshots/referências automaticamente para ocultar regressão.
