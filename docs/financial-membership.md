# Gestão financeira

## Dashboard da gestão financeira

Os indicadores de cobranças usam `totalElements` das consultas para apresentar contagens do conjunto total, independentemente da página carregada. A distribuição mostra cobranças por estado `PAID`, `PENDING` e `CANCELED`; ela descreve estados de cobranças e não mede a adimplência de pessoas associadas. A fila operacional exibe no máximo cinco registros por categoria. Os valores nela são valores unitários dos registros, não um total de caixa nem uma soma de uma página.

Os indicadores e itens da fila levam às áreas existentes de definições, ciclos e movimentações, preservando os filtros de estado aplicáveis. A atualização dos dados do Dashboard é manual pelo controle de atualizar. Histórico mensal, despesas, saldo e reserva dependem de endpoints agregados ainda não disponíveis; esses dados não devem ser inferidos nem apresentados como valores reais em produção.

## Cobrança de referência da associação

O bloco configura qual definição de cobrança participa da avaliação de regularidade. A configuração é global e não possui `cycleId`. Definições, atribuições e ciclos continuam nas áreas existentes. A autorização é verificada no servidor; a visibilidade do bloco não substitui essa verificação.

## Configuração

O contrato da API administrativa é:

| Operação | Contrato |
| --- | --- |
| `GET /admin/membership-billing-configuration` | Retorna `{ id, chargeDefinitionId, enforcementEnabled, createdAt, updatedAt }`. Resposta `204` significa que ainda não há configuração. |
| `PUT /admin/membership-billing-configuration` | Recebe `{ chargeDefinitionId, enforcementEnabled }`. |
| `PATCH /admin/membership-billing-configuration/enforcement` | Existe no backend, mas não é exposto por esta tela; o bloqueio de acesso fica fora deste fluxo. |

As permissões de backend `MEMBERSHIP_BILLING_CONFIGURATION_READ` e `MEMBERSHIP_BILLING_CONFIGURATION_UPDATE` correspondem, respectivamente, ao módulo `MEMBERSHIP` com as ações `BILLING_CONFIGURATION_READ` e `BILLING_CONFIGURATION_UPDATE`.

Somente definições ativas podem ser selecionadas. Todas as recorrências e todos os valores de `required` são aceitos. Como o bloco não oferece controle de `enforcementEnabled`, a primeira configuração usa `false`; ao atualizar, a Server Function lê o valor armazenado e o preserva no `PUT`. Alterar pelo bloco exige as permissões de leitura e atualização. A API não oferece versão ou atualização exclusiva da referência: o GET seguido de PUT não protege contra alterações simultâneas feitas por outro administrador.

Os demais contratos reutilizados são:

| Operação | Permissão de backend | Uso |
| --- | --- | --- |
| `GET /billing/charge-definitions` | `BILLING_CHARGE_DEFINITION_READ` | Opções paginadas; a tela oferece apenas as ativas. |
| `GET /billing/charge-definitions/{id}` | `BILLING_CHARGE_DEFINITION_READ` | Nome e dados da referência atual. |
| `GET /billing/charge-definitions/{id}/cycles` | `BILLING_CHARGE_CYCLE_READ` | Ciclos da referência salva, com paginação. |
| `POST /billing/charge-definitions/{id}/assignments/users/{userId}` | `BILLING_CHARGE_ASSIGNMENT_CREATE` | Atribuição individual na funcionalidade existente. O identificador é o ID do usuário, não sua matrícula. |
| `POST /billing/charge-definitions/{id}/assignments/all-members` | `BILLING_CHARGE_ASSIGNMENT_CREATE` | Atribuição a todos os associados. |
| `POST /billing/charge-definitions/{id}/cycles` | `BILLING_CHARGE_CYCLE_GENERATE` | Geração existente com `{ code, dueDate }`; cria débitos para os usuários elegíveis. |
| `GET /billing/member-charges?userId={id}` | `BILLING_MEMBER_CHARGE_READ` | Consulta existente dos débitos; `effectiveStatus` vem do backend. |

Sem leitura de definições, um operador com leitura e atualização da configuração pode informar o código diretamente; o backend valida se a definição existe e está ativa. As permissões de configuração não concedem acesso implícito aos dados de Billing.

## Ciclos e avaliação

Os ciclos continuam sendo gerenciados nas telas existentes, em `/billing/charge-definitions/{id}/cycles`. A seleção da cobrança aplicável é feita pelo backend a partir do período que contém `dueDate` e da recorrência registrada no snapshot do ciclo: `ONE_TIME` sempre se aplica, `MONTHLY` usa o mês/ano atual e `YEARLY` o ano atual. Ciclos `ARCHIVED` são ignorados. Havendo mais de um ciclo candidato, o backend prioriza o vencimento de hoje ou anterior mais recente; se não houver, escolhe o futuro mais próximo. Empates são resolvidos pelo maior ID.

O resultado interno da avaliação segue estas regras:

| Estado | Resultado |
| --- | --- |
| `PENDING` dentro de `WITHIN_PAYMENT_PERIOD` | Permite |
| `PAID` ou `SATISFIED` | Permite |
| `CANCELED` | Permite |
| `OVERDUE` ou pagamento expirado | `PAYMENT_REQUIRED` (HTTP `402` quando o enforcement estiver ativo) |
| Sem cobrança aplicável | `CHARGE_NOT_FOUND` (HTTP `503` quando o enforcement estiver ativo) |

A ausência de cobrança não cria dívida automaticamente. Não foi identificado endpoint HTTP para consultar a regularidade; esses estados descrevem a avaliação interna do backend, não uma API pública de situação do associado.

## Fluxo operacional

1. Criar uma definição de cobrança.
2. Atribuir o público pela funcionalidade existente de atribuições.
3. Gerar o ciclo da definição.
4. Enviar e confirmar o pagamento pelos fluxos existentes.
5. No Dashboard, selecionar a definição como referência da associação.

