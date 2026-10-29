This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Análise administrativa de pagamentos

Acesse **Painel administrativo → Análise de pagamentos** (`/admin/pagamentos`).
O backend configurado em `API_URL` deve expor `/billing/member-payments`.

- `BILLING_PAYMENT_READ`: libera o módulo, a listagem, os detalhes e os comprovantes.
- `BILLING_PAYMENT_CONFIRM` e `BILLING_PAYMENT_REJECT`: liberam cada decisão separadamente, junto à leitura.
- A listagem usa o filtro de status disponível na API, com paginação de 10, 20 ou 50 itens e parâmetros preservados na URL.
- Apenas pagamentos `PENDING_VALIDATION` podem ser decididos. Rejeitar exige motivo de até 500 caracteres.
- Comprovantes PDF, JPEG, PNG e WebP são consultados pela rota autenticada `/api/payments/{id}/receipt`.

Para validar manualmente, compare um usuário somente com leitura e outro com permissões de decisão; filtre pagamentos pendentes, abra um comprovante e confirme ou rejeite. Confira o novo status nos detalhes e na listagem. Uma decisão concorrente deve exibir o erro da API e recarregar o estado atual.

Testes do fluxo: `npm test -- --runInBand --coverage=false payment`.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

Consulte [a configuração deste projeto na Vercel](deploy/vercel.md) para a
branch de produção, variáveis de ambiente e integração com a API na VPS.

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
