# Jeep Club — instruções de trabalho

## Contexto

Frontend do Jeep Clube Tamoios com Next.js App Router, React, TypeScript,
Tailwind CSS, TanStack Query e React Hook Form com Zod.
O código, os schemas e as configurações são as referências executáveis.

## Documentação por tarefa

Consulte apenas os guias relevantes ao trabalho, na profundidade necessária:

- Arquitetura, integração e dados: [docs/architecture.md](docs/architecture.md).
- Interface e identidade visual: [docs/design.md](docs/design.md).
- Convenções de código: [docs/development.md](docs/development.md).
- Componentes, páginas e formulários: [docs/components-and-pages.md](docs/components-and-pages.md).
- Testes e validações: [docs/testing.md](docs/testing.md).

Setup e comandos disponíveis ficam no [README.md](README.md);
o [índice documental](docs/README.md) organiza as demais referências.
Não é necessário ler todos os guias integralmente para uma alteração pequena.

## Minimal Implementation

Antes de modificar:

1. Confira o estado Git e preserve alterações existentes.
2. Inspecione a implementação e seus consumidores.
3. Procure componentes, funções, tipos, schemas e padrões reutilizáveis.
4. Identifique a menor alteração que atende ao requisito.

Durante a implementação:

- Prefira modificar código existente a criar novos arquivos.
- Não crie abstrações para problemas de uso único sem benefício concreto.
- Evite wrappers, helpers, services, hooks e interfaces desnecessários.
- Preserve a organização e os padrões adotados; não refatore fora do escopo.
- Não introduza dependências desnecessárias; justifique e obtenha autorização
  antes de adicionar bibliotecas.

## Implementação

- Reutilize componentes compartilhados quando adequados à responsabilidade.
- Respeite as fronteiras servidor/cliente e mantenha credenciais no servidor.
- Escolha leitura e atualização conforme o contexto existente; não imponha
  RSC/URL ou TanStack Query como solução universal.
- Preserve contratos e validações; respeite autenticação, autorização e regras
  de negócio. Visibilidade de interface não substitui autorização da operação.
- Siga o design documentado e considere mobile-first, estados e acessibilidade.
- Distinga limitações do código de padrões a reproduzir. Se um requisito exigir
  definir um contrato ou comportamento ainda ambíguo, esclareça essa parte.

## Validação

- Selecione verificações proporcionais conforme docs/testing.md.
- Execute TypeScript, ESLint e testes relevantes quando aplicáveis, usando os
  comandos existentes. Não exija build ou suíte completa para toda edição.
- Revise o diff e os consumidores afetados antes de finalizar.
- Diferencie regressões de falhas preexistentes com evidências comparáveis.
- Informe limitações e verificações não executadas. Não declare aprovação de
  testes não executados nem apresente teste Node como validação visual ou E2E.

## Entrega

Resuma o que mudou, os arquivos envolvidos, as verificações executadas e os
problemas ou pendências relevantes. Evite relatórios extensos e documentação
adicional sem necessidade. Não inicie trabalho fora do pedido.
