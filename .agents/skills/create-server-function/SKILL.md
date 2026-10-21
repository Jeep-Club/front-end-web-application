---
name: create-server-function
description: Criar ou adaptar operações de servidor do Jeep Club, como Server Functions e Actions ou leituras server-side, reutilizando autenticação, wrappers e contratos backend existentes. Use para validação, integração e execução no servidor; não para apenas configurar Query, compor UI ou expor remotamente toda função auxiliar.
---

# Implementar operação de servidor

Siga o [AGENTS.md](../../../AGENTS.md). Esta Skill trata da fronteira servidor/backend; cache Query e composição de tela só entram quando o requisito também os alterar.

## Referências

Leia as seções pertinentes de [architecture](../../../docs/architecture.md) e os contratos reais em `src/actions`, `src/services`, `src/schemas`, `src/types` e `src/utils/http`. Use [development](../../../docs/development.md) para organização/tipagem.

## Procedimento

1. Localize operação equivalente, chamadores, URL em HttpAPIRoutes, schemas e tipos. Decida se o chamador precisa de função remota com `use server` ou leitura comum no servidor. A página de usuários chama serverFetchWrapper diretamente; list/get de definições são funções remotas de leitura. `server-only` protege importação, não cria endpoint.
2. Confira sessão e contexto de cookies antes de escolher o wrapper. [serverFetchWrapper](../../../src/services/fetchWrapper/serverFetchWrapper.ts) lê sem renovar; [actionFetchWrapper](../../../src/services/fetchWrapper/actionFetchWrapper.ts) pode renovar/escrever cookies e repetir a chamada. Não usar o segundo em render RSC por conveniência. Preserve Bearer e credencial privada, sem levá-los ao cliente.
3. Identifique autorização da operação e validação de parâmetros/payload, sem confiar em botão oculto ou tipo TypeScript. Reutilize contratos que correspondam à entrada real; diferencie formulário textual, output transformado e DTO. [create](../../../src/actions/billing/chargeDefinitions/create.ts)/[update](../../../src/actions/billing/chargeDefinitions/update.ts) financeiros validam resposta, mas não fazem parse próprio da entrada/ID: não copiar a omissão como regra nem reaplicar schema textual a números. Se faltar contrato de negócio, esclareça-o em vez de inventar um global.
4. Execute a integração pelo mecanismo existente apropriado. [fetchWrapper](../../../src/services/fetchWrapper/fetchWrapper.ts) exige schema de resposta e retorna status/data; arquivos/multipart têm operações próprias. Reutilize-as quando aplicáveis, sem criar novo wrapper/service apenas para renomear chamada.
5. Analise falhas esperadas, resposta segura e o que realmente atravessa a fronteira cliente. [apiError](../../../src/utils/http/apiError.ts) reconhece o envelope atual; message/cause de Error não são contrato público garantido. O catch do refresh abrange a repetição e pode mascarar outro erro como expiração: não tratar essa inconsistência como regra obrigatória. Não retornar rawData, tokens ou detalhes internos por conveniência.
6. Confira os chamadores e o efeito após êxito. Preserve o contrato de leitura/retorno e o dono da atualização: router.refresh na lista de usuários ou invalidação Query no consumidor financeiro. Não introduzir revalidação/cache universal ou alterar permissões para contornar falha de integração.

## Verificação e entrega

Selecione checks em [testing](../../../docs/testing.md): entradas inválidas/limites, resposta incompatível, sucesso/falha e credenciais/autorização afetadas. [frontendApiRefresh.spec.ts](../../../tests/frontendApiRefresh.spec.ts) verifica credencial no retry com mocks, sem cobrir todo o refresh real. Teste isolado não prova integração backend nem serialização em produção. Relate operação/chamadores, contratos preservados, verificações e lacunas que exigem validação própria.

## Quando não é necessária

Dispensável para alterar apenas layout, componente ou opções de Query sem modificar execução no servidor. Não expor helper como Server Function somente para organizá-lo em actions.
