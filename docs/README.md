# Documentação do frontend

Ponto de entrada para desenvolvedores e futuras instruções. Para instalar, configurar o ambiente local e executar os comandos atuais, consulte o [README da raiz](../README.md).

## Disponível

| Documento | Fonte de referência |
| --- | --- |
| [Início rápido](../README.md) | Apresentação, requisitos confirmados, ambiente local e comandos |
| [Runbook da Vercel](../deploy/vercel.md) | Implantação, configuração dos ambientes publicados e integração operacional com a API |

O código e suas configurações continuam sendo a fonte dos comportamentos executáveis. O README descreve o setup local; o runbook concentra os procedimentos de deploy. Em caso de divergência, confirme o comportamento antes de atualizar a documentação.

## Planejado — ainda não disponível

Os nomes abaixo definem os destinos previstos; não são links nem instruções já implementadas. Os guias serão escritos e validados em tarefas próprias.

| Arquivo previsto em docs/ | Responsabilidade |
| --- | --- |
| `architecture.md` | Organização do frontend, fronteiras servidor/cliente, dados, autenticação e decisões arquiteturais |
| `development.md` | Convenções de código e fluxo de desenvolvimento |
| `components-and-pages.md` | Critérios de composição, reutilização e construção de componentes e páginas |
| `design.md` | Identidade visual e linguagem de design, com referências às fontes executáveis de tokens e componentes |
| `testing.md` | Estratégia de testes, verificações existentes, limites e futuras validações funcionais/visuais/responsivas |
| `codex.md` | Fluxo de trabalho com Codex, navegação das instruções e uso de Agents/Skills quando adotados |

Este índice organiza os assuntos; cada guia deve manter os detalhes de sua responsabilidade e referenciar as outras fontes, evitando cópias das mesmas regras. Adicione links somente quando o documento existir.

## Pendências de onboarding

A versão oficial de Node/npm, os browsers suportados e a política de ambiente de testes ainda precisam de decisão do responsável (D06/E0-03 no roadmap de implantação). O mínimo declarado pelo Next instalado no README não resolve essa pendência.

Storybook, AGENTS.md, Skills e os guias acima não foram implantados nesta etapa. Sua listagem não constitui aprovação de ferramentas ou de padrões futuros.
