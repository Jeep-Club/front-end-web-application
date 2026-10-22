# Jeep Club — instruções de trabalho

## Contexto

Frontend do Jeep Clube Tamoios com Next.js App Router, React, TypeScript,
Tailwind CSS, TanStack Query e React Hook Form com Zod.
O código, os schemas e as configurações são as referências executáveis.

## Orquestração de subagentes

O agente principal mantém a responsabilidade por implementação, integração e
entrega. Use os agentes em `.codex/agents/` apenas quando a tarefa for
delimitada e a delegação reduzir o custo total; tarefas triviais permanecem
diretas e tarefas simples usam no máximo um agente quando houver ganho claro.
Envie contexto e escopo mínimos, não repita investigação ou testes e execute no
máximo dois subagentes simultaneamente. Prefira investigação,
documentação, testes direcionados ou revisão independentes; preserve a ordem
Investigar → Implementar → Documentar → Testar → Revisar → Corrigir → Validar.
Modelos e esforços são escolhas explícitas dos arquivos TOML; não presuma
troca automática do modelo do agente principal durante uma sessão.

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
4. Identifique a menor alteração que atende ao requisito e os critérios verificáveis de aceite.

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
- Em componentes interativos, use `cursor-pointer` para indicar a ação disponível; preserve um cursor de estado apropriado, como `cursor-not-allowed`, quando o controle estiver desabilitado.
- Para superfícies alternativas de campos compartilhados, prefira `variant="white"` como padrão e `variant="gray"` para a versão cinza explícita; mantenha essa convenção também ao adaptar inputs.
- Documente contratos e decisões não evidentes conforme [documentação no código](docs/development.md#documentação-no-código), incluindo testes e infraestrutura.
- Mantenha stories e documentação interativa coerentes com mudanças relevantes de interface, seguindo [storybook-story](.agents/skills/storybook-story/SKILL.md).
- Distinga limitações do código de padrões a reproduzir. Se um requisito exigir
  definir um contrato ou comportamento ainda ambíguo, esclareça essa parte.

## Validação

- Avalie Jest, Playwright, acessibilidade e demais verificações conforme [docs/testing.md](docs/testing.md); selecione pelo comportamento e impacto, sem exigir todas as ferramentas para toda edição.
- Em toda alteração de interface, avalie a validade e as lacunas dos testes existentes e selecione a execução conforme o impacto, seguindo [playwright-test](.agents/skills/playwright-test/SKILL.md). Avaliar é obrigatório; criar teste novo depende de benefício concreto.
- Execute TypeScript, ESLint e testes relevantes quando aplicáveis, usando os
  comandos existentes. Não exija build ou suíte completa para toda edição.
- Conduza investigação, implementação, documentação pertinente e validação como um único ciclo, sem aguardar pedidos separados para stories, testes ou correções dentro do escopo autorizado. Investigue falhas, corrija regressões causadas pela alteração e reexecute as verificações afetadas conforme [tratamento de falhas](docs/testing.md#tratamento-de-falhas). Repita até atender ao aceite ou comprovar um impedimento real; não enfraqueça testes, ignore erros ou altere requisitos para obter aprovação.
- Revise o diff e os consumidores afetados antes de finalizar.
- Diferencie regressões de falhas preexistentes com evidências comparáveis.
- Informe limitações e verificações não executadas. Não declare aprovação de
  testes não executados nem apresente teste Node como validação visual ou E2E.

## Entrega

Antes de declarar conclusão, confira cada requisito e seus resultados de verificação: implementação, documentação/stories e cobertura pertinentes devem estar coerentes, sem falhas introduzidas ainda abertas. Falhas preexistentes não autorizam ampliar o escopo nem devem ser apresentadas como regressões resolvidas. Se faltar acesso, ferramenta, definição de contrato ou autorização necessária, ou se uma verificação obrigatória não puder ser concluída, informe a parte incompleta, as evidências e a decisão necessária; não declare aceite integral.

Resuma o que mudou, os arquivos envolvidos, as verificações executadas e os
problemas ou pendências relevantes. Evite relatórios extensos e documentação
adicional sem necessidade. Não inicie trabalho fora do pedido.
