---
name: query
description: Implementar, corrigir ou manter consultas e mutations TanStack Query do Jeep Club, incluindo keys, parâmetros, estados, cache e invalidação por consumidor. Use para integração de dados remotos no cliente; não para converter uma leitura RSC/URL adequada ou implementar sozinho um endpoint de servidor.
---

# Implementar consulta ou mutation

Siga o [AGENTS.md](../../../AGENTS.md). Esta Skill cuida da integração Query; não redefine transporte, autorização ou aparência da página.

## Referências

Consulte [architecture](../../../docs/architecture.md) para dados/cache e [components-and-pages](../../../docs/components-and-pages.md) para conexão à tela. As opções efetivas estão no [QueryProvider](../../../src/providers/QueryProvider/index.tsx) e nos consumidores.

## Procedimento

1. Identifique quem já lê os dados. Preserve RSC/URL quando adequado: a lista de usuários já recebe dados do servidor. Busque query keys, chamadas e consumidores antes de acrescentar Query ou useEffect; não refaça no mount uma leitura que já atende ao requisito.
2. Reutilize a função e seus contratos de entrada/saída. Confira se ela rejeita falha ou retorna resultado discriminado antes de conectar queryFn/mutationFn; um retorno de erro resolvido não pode disparar sucesso de negócio. Alteração no contrato remoto pertence ao procedimento de servidor.
3. Inspecione keys e shapes no domínio. Definições usam `["billing", "charge-definitions", searchParams]` para lista e `["billing", "charge-definitions", id]` para detalhe. Inclua os parâmetros que mudam o resultado, diferencie shapes e mantenha a convenção dos consumidores tocados. Não criar registry global ou hook por endpoint.
4. Defina enabled e estados conforme parâmetros e acesso, sem confundir enabled com autorização. Confira loading inicial, erro, vazio, refetch e dados anteriores/em cache. [ChargeDefinitions](../../../src/components/pages/admin/gestao-financeira/index.tsx) usa enabled por permissão e placeholderData anterior. Ajuste staleTime/retry somente com motivo do fluxo; o provider não estabelece valores globais próprios.
5. Na mutation, confira input, pending e sucesso/falha; mapeie lista, detalhe e derivados antes de escolher invalidateQueries/setQueryData. O prefixo de definições não cobre `["billing", "dashboard", card.title]`, usado por [FinancialDashboard](../../../src/components/pages/admin/gestao-financeira/FinancialDashboard.tsx). Não invalidar tudo nem copiar essa lacuna como padrão. router.refresh e cache Query não são intercambiáveis.
6. Confira handlers globais e locais antes de adicionar toast/logout. [EditChargeDefinitionModal](../../../src/components/pages/admin/gestao-financeira/EditChargeDefinitionModal.tsx) exemplifica leitura de detalhe, retry e mutation, mas há feedback local/global que pode duplicar. Não inventar contrato global de erro ou política universal de cache para resolver um consumidor.

## Verificação e entrega

Conforme [testing](../../../docs/testing.md), exercite parâmetros/keys, ausência de chamada quando desabilitada, sucesso/falha e consumidores realmente atualizados. Distingua mock de hooks de execução real do cache/rede. Relate dono dos dados, opções justificadas, efeito de invalidação e limitações; não declarar backend, cache integrado ou refetch validados apenas por inspeção.

## Quando não é necessária

Dispensável para leitura exclusivamente RSC/URL sem uso de Query e para alteração puramente visual. A criação de uma operação remota não exige adicionar cache cliente.
