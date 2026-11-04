# Contratos HTTP e erros de Server Actions

Versões estáveis verificadas no npm: Next.js 16.4.3, React e React DOM 19.3.1.
Types de React/React DOM e eslint-config-next foram atualizados em conjunto.

As funções reais ficam somente em src/server/actions. Componentes, queries,
mutations e outras actions importam diretamente desse diretório. A função executa
sua operação e retorna os dados de sucesso; falhas são lançadas. Catch local existe
apenas para comportamento específico, como retornar null para um 404 ou limpar os
cookies de uma sessão parcialmente criada no login. Não há adaptadores por action,
fábricas de action, envelopes ActionResult, bindAction ou captureAction.

O actionFetchWrapper concentra autenticação, refresh e normalização em ActionError.
Ele preserva status HTTP, code e errors do Problem Details, priorizando a mensagem
do campo inválido e depois detail. Apenas 401 com código de access token inválido
tenta refresh. Credenciais incorretas são exibidas no formulário. 402, 403, 409 e
503, inclusive após refresh, não se tornam expiração de sessão. Uma indisponibilidade
durante refresh mantém a sessão; um refresh rejeitado exige novo login.

Next.js/React continuam removendo mensagens e propriedades de exceções em produção.
Isso foi verificado no protocolo real depois da atualização. ActionError prepara
centralmente um digest identificado e contendo somente os campos públicos destinados
à interface: message, status, code e errors. O framework preserva esse digest.
Causas, stacks, resposta bruta e diagnósticos internos não entram nele. Erros
inesperados conservam o digest opaco e a mensagem genérica do framework. Esse
transporte usa uma propriedade do erro, sem alterar os retornos das actions nem
configurar o framework para divulgar exceções arbitrárias.

Os handlers globais mutationErrorHandler e queryErrorHandler compartilham a mesma
implementação em QueryProvider/handlers/onError.ts. Eles recuperam os campos públicos
antes dos callbacks locais, atualizam error.message e mostram o toast. Somente a
expiração de sessão navega até a rota que limpa os cookies. Os componentes mantêm
feedback de sucesso, validação local e efeitos específicos; não repetem toasts de
falhas HTTP. Fluxos imperativos de salvar perfil e concluir onboarding usam o mesmo
MutationCache por meio de useMutation.

fetchWrapper mantém os contratos JSON existentes. HTTP 204 retorna sem consumir o
corpo nem validar JSON. Downloads usam responseType blob, schema Blob e uma lista
explícita de Content-Types aceitos. Status e Content-Type são verificados antes dos
bytes. Problem Details e JSON de erro, mesmo com HTTP 200 incorreto, não viram arquivo.

Validação:

- npx tsc --noEmit
- npm run build
- npm test -- --runInBand --coverage=false
- npm run test:production-errors
- npx playwright test tests/e2e/http-contracts.spec.mjs --workers=1

O Playwright usa Chrome instalado, ou E2E_BROWSER_CHANNEL. A suíte é independente
do arquivo de configuração compartilhado da outra branch e exige backend dev ativo.
Ela lê application-dev.properties e cria usuário e ferramentas E2E HTTP via API no
MySQL local, imprimindo apenas IDs. Registros sintéticos ficam identificados para
inspeção; a ferramenta do teste DELETE é removida pela própria operação. Também é
possível executar node tests/e2e/seed-local.mjs para preparar dados.

JSON, validação, 204, 403 por propriedade, 409 por estado e CSV usam o backend local.
402/503, falhas de refresh e exportações inválidas usam uma API intermediária local.
Os testes de navegador exercitam toast de mutation, toast de query e manutenção de
sessão. O teste de produção também verifica que exceções inesperadas continuam
sanitizadas. Nenhum cenário usa a API publicada.
