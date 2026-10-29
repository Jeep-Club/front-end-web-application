# Auditoria de contratos e permissões

Os contratos foram conferidos no código dos controllers, DTOs, enums e handlers
do `jeep-club-backend`, e comparados com os schemas utilizados pelo front-end.
O ambiente local não publica `/v3/api-docs`. Nenhum código da API foi alterado.

## Correções no front-end

| Contrato da API | Ajuste |
| --- | --- |
| Roles: `ACTIVE`, `INACTIVE`, `ARCHIVED` | Removido `DELETED` dos schemas/types, filtros, rótulos e condições de edição. |
| Veículos: `ACTIVE`, `INACTIVE`, `ARCHIVED` | Removidos `SOFT_DELETED` e `PENDING`; o schema da listagem agora preserva `status`. |
| Ferramentas e dependentes | Removidos estados que seus enums não retornam (`DELETED` e `DISABLED`, respectivamente). |
| `IdentityMeResponseDTO` e `AdminUserResponseDTO` | Preservado `membershipNumber`; identidade também preserva `profileCompletionPending`. Campos pessoais ausentes continuam aceitando `null` ou omissão conforme o DTO. |
| Carteirinha | Usa o número de associação recebido, preservando zeros à esquerda; deixou de criar um número a partir do ID do usuário. |
| `TemporaryPasswordAdminResponseDTO` | Rota corrigida para `authentication/admin/password-recovery/requests/users/{userId}/temporary-password`; schema próprio, sem exigir `userId` inexistente no corpo. A action acrescenta o ID solicitado ao resultado usado pela tela. |
| Recuperação de senha | Resposta pública validada por schema. Redefinição deixou de simular sucesso e chama `POST authentication/password-recovery/requests/token/reset`, com `{token,newPassword}`, aceitando `204`. Limites de senha: 8–100 caracteres. |
| Primeiro acesso | Remove o desafio de uso único assim que a troca de senha é aceita, antes de carregar os contextos de identidade/autorização. Uma falha posterior não permite reenviar o desafio consumido. |
| Nome do titular de perfil médico | Removida chamada a `admin/medical-profiles/{id}/owner`, que não existe. Para usuário, consulta identidade apenas com `IDENTITY_USER_READ`; sem essa permissão, mantém a identificação pelo ID. |
| Schemas de segurança e publicações | Extraídos das actions para `src/schemas`, permitindo testar o mesmo schema que a aplicação usa. Inscrição em evento valida os campos e nulabilidades retornados pelo record da API. |

As actions continuam em `src/server/actions`, sem adapters em `/actions`,
`bindAction` ou envelopes de resultado. Erros seguem pelo wrapper e pelos
handlers compartilhados de query/mutation.

## Dados fictícios

`tests/e2e/seed-contract-audit.mjs` lê as configurações locais de
`application-dev.properties`, autentica o administrador de desenvolvimento e
persiste os dados **pelas APIs de domínio**, no banco configurado pela API.
Não faz inserts SQL, não muda o schema e não altera regras globais de cobrança.
O script recusa URLs de API fora de localhost.

Cada execução gera usuários identificados por `E2E-CONTRACT-<timestamp>`:

| Perfil | Acesso |
| --- | --- |
| Reader | Leitura administrativa, sem atualização nem exportação. |
| Writer | Atualização médica e confirmação de pagamento, sem leitura administrativa. |
| Member | Recursos próprios, feed, comentários, solicitações de serviço e inscrições. |
| NoPermissions | Autenticado sem cargos/permissões atribuídos. |
| FirstAccess | Cadastro mínimo, sem e-mail, com senha provisória ainda não utilizada. |

O administrador root existente e requisições anônimas completam a matriz.
São criados cargos, ferramenta e veículo arquivados, dependente, perfis médicos,
cobranças, pagamentos com comprovante PNG, reembolso, aviso, evento, inscrição,
comentário, serviço aprovado, solicitação pendente e candidatura à associação.
Os dados permanecem no ambiente local para inspeção. Rodar novamente cria outro
conjunto independente; os testes só excluem recursos descartáveis criados por eles.
Credenciais e tokens não são gravados no relatório da auditoria.

## Execução

Com a API local e seu banco ativos, Chrome instalado e dependências instaladas:

```sh
npm run build
npm run test:e2e:contracts
npm test -- --runInBand --coverage=false
npm run test:production-errors
```

Os testes já geram seus próprios dados. Para gerar somente o conjunto fictício:

```sh
npm run seed:e2e:contracts
```

As suítes iniciam Next em produção em portas disponíveis, usam Chrome instalado
(`E2E_BROWSER_CHANNEL` permite outro canal) e não alteram a configuração
compartilhada do Playwright. `E2E_API_URL` permite escolher outra URL **local**.

## Cobertura e limites

Validação local concluída em 29/10/2026: **69 testes Playwright aprovados**,
**398 testes Jest aprovados (54 suítes)**, build de produção e TypeScript
aprovados, três cenários de erros de Server Actions em produção aprovados,
ESLint dos arquivos alterados e `git diff --check` sem erros.

- **49 contratos JSON reais**, relacionados em `tests/e2e/contract-cases.mjs`,
  validam os schemas da aplicação: identidade, sessão, autorização, segurança,
  usuários, cargos, permissões, ferramentas, veículos, dependentes, saúde,
  financeiro, associação, publicações, comentários e inscrições.
- **35 combinações de permissão**: sete rotas administrativas × anônimo,
  usuário sem permissões, writer, reader e root.
- Respostas reais `200`, `201` vazio, `204`, `400` com erros de campo, `401`,
  `403`, `404` e `409`; titularidade de recursos; exportações CSV/PDF;
  autorização e bytes do comprovante; primeiro acesso sem e-mail; troca e
  recuperação de senha com rejeição do token reutilizado; navegação e toasts.
- Os cenários `402 MEMBERSHIP_PAYMENT_REQUIRED`,
  `503 MEMBERSHIP_CHARGE_UNAVAILABLE`, falhas de refresh e respostas de arquivo
  com conteúdo inválido usam o proxy controlado da suíte `http-contracts`.
  Eles verificam o cliente HTTP e a sessão, sem alegar reproduzir uma falha
  real do motor de cobrança da API.
- O relatório `test-results/contract-audit.json` contém rota, status e resultado
  da validação para os 49 casos; não contém respostas pessoais completas.
- A cobertura não representa todas as combinações possíveis de estados e
  endpoints da API.

Para dependentes, a API médica retorna o ID do dependente, mas não o ID do
responsável. A consulta administrativa de dependente exige ambos no caminho
`users/{userId}/dependents/{id}`. Sem essa relação no contrato médico, a tela
mantém o ID como identificação, sem tentar endpoints inexistentes.

Também foram corrigidos dois testes unitários anteriores: relógio local/UTC e
comparação por valor dos passos do tour. `identity-obj-proxy`, já referenciado
pelo Jest, foi incluído nas dependências de desenvolvimento que faltavam.
