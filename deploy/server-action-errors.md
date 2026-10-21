# Mensagens de erro em produção

As funções em `src/server/actions` são as Server Actions reais. Elas retornam
`ActionResult<T>`: sucesso com `data`, ou falha com uma mensagem preparada para
exibição. Falhas esperadas não devem atravessar essa fronteira como exceções:
o Next.js oculta as mensagens de exceções do servidor em builds de produção.

Os adaptadores em `src/actions` mantêm a API usada pelas telas. Eles recebem o
resultado e só então reconstroem `ActionError` no chamador. Assim, os fluxos
existentes de React Query (`onError`, `mutation.error`, `mutateAsync`) continuam
funcionando, sem importar cookies ou credenciais no navegador.

Para criar uma ação:

1. Implemente a operação em `src/server/actions` e envolva sua execução com
   `captureAction`. Prepare falhas esperadas com `ActionError` e
   `extractApiErrorMessage`, preservando a causa quando disponível.
2. Exponha um adaptador em `src/actions` usando `unwrapActionResult`.
3. Importe o adaptador nas telas. Não importe a Server Action diretamente
   se a tela espera que erros sejam tratados pelo React Query.

O extrator prioriza a mensagem de validação de campo e depois `detail` da API.
Erros inesperados recebem uma mensagem genérica; stacks e causas não integram
o resultado enviado ao navegador. Redirecionamentos do Next.js são relançados.
A expiração de sessão continua sendo tratada pelo handler global, mesmo quando
a mutação possui tratamento local. Os demais erros geram toast global apenas
quando a mutação não possui seu próprio `onError`.

Para disponibilizar a correção, faça um novo build e deploy do frontend após
integrar a branch. Não exige alteração nem novo deploy do backend.

Validação: `npm run build` e `npm test -- --runInBand --coverage=false`.
Após o build, `npm run test:production-errors` inicia o Next.js em produção e
uma API simulada local para conferir a mensagem no protocolo HTTP real das
Server Actions, sem acessar a API publicada.
`tests/serverActionErrors.spec.ts` cobre transporte JSON, mensagens da API,
sucesso, validação, sessão expirada, redirecionamentos e toasts duplicados.
