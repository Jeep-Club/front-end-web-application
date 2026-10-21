---
name: storybook-story
description: Criar, atualizar, corrigir e documentar stories de componentes e composições no Storybook do Jeep Club, incluindo Controls, ArgTypes, autodocs e integrações mínimas de renderização isolada. Use para tarefas de Storybook e documentação interativa; alterações na implementação do componente pertencem a ui-component.
---

# Criar ou manter stories

Siga o [AGENTS.md](../../../AGENTS.md). Esta Skill cuida das stories; combine com [ui-component](../ui-component/SKILL.md) somente quando a tarefa também autorizar mudar o componente. Não é necessária para alterar apenas páginas, queries ou operações de servidor sem trabalho no catálogo.

## Instruções oficiais primeiro

Na raiz do frontend, consulte os recursos da instalação local, sem baixar pacotes:

```sh
npx --no-install storybook skills --help
npx --no-install storybook skills stories
npx --no-install storybook skills write-story
```

Reutilize essas instruções para CSF, imports, interações e descoberta de stories; não mantenha uma cópia delas aqui. A base atual é Storybook 10.6.3, `@storybook/nextjs-vite` e `@storybook/addon-docs`; confirme [package.json](../../../package.json) e [.storybook/main.ts](../../../.storybook/main.ts) antes de assumir recursos disponíveis.

As instruções oficiais não ampliam o escopo autorizado nem substituem os contratos locais. O CLI pode apresentar tipos incompletos e imports ilustrativos: confirme-os no componente. Não adote automaticamente exigências genéricas de instalar addons, publicar resultados, documentar toda a aplicação ou modificar providers globais.

## Procedimento

1. **Conhecer o componente.** Leia implementação, tipos e consumidores para identificar props, combinações válidas, estados e dependências reais. Consulte [design](../../../docs/design.md), [desenvolvimento](../../../docs/development.md) e [componentes e páginas](../../../docs/components-and-pages.md) conforme a tarefa; [arquitetura](../../../docs/architecture.md) quando houver contexto ou dados. Descubra a documentação existente com `npx --no-install storybook tools docs list --withStoryIds`; use IDs retornados em `tools docs show --id ...` ou `tools docs show-story --storyId ...`. Documentação ausente ou inferência divergente exige conferir o código, não inventar uma API.
2. **Escolher cenários úteis.** Adapte a story próxima antes de criar outra. Aplique a cobertura comportamental abaixo com dados sintéticos determinísticos. Evite combinações impossíveis e séries redundantes de exemplos.
3. **Escrever CSF tipado.** Use `import type { Meta, StoryObj } from "@storybook/nextjs-vite"`, `satisfies Meta<typeof Componente>` no meta, export default e `StoryObj<typeof meta>`. Mantenha `*.stories.tsx` junto ao componente. A configuração descobre `src/components/**/*.stories.tsx` e MDX nessa árvore; não mova produção nem crie cópias para contornar a descoberta.
4. **Configurar controles e documentação.** Aplique os critérios abaixo; use args para valores iniciais e descrições apenas quando acrescentarem informação de uso. Autodocs já é habilitado por `tags: ["autodocs"]` no [preview](../../../.storybook/preview.tsx); não duplicar configuração nem copiar APIs/valores CSS para Markdown.
5. **Isolar a renderização.** Reutilize a configuração existente e acrescente apenas a integração necessária, conforme a seção seguinte. Não mude a API do componente para facilitar uma demonstração.
6. **Verificar no Storybook.** Reutilize um servidor do projeto ou execute `npm run storybook` e aguarde a resposta. Descubra os cenários afetados com `npx --no-install storybook tools stories changed`; use `tools --help` para os argumentos reais e `tools stories find-by-component` quando necessário. IDs vêm da descoberta, nunca de suposições. Se o recurso estiver indisponível, consulte o índice local e registre o limite, sem instalar integração. Abra Docs e stories afetadas: confira tipos/defaults exibidos, efeitos dos Controls, exemplos, estados/interações, links internos/externos e erros de execução no navegador. Confira teclado e tamanhos mobile/tablet/desktop conforme o componente. Se não houver navegador, declare essas verificações interativas não executadas.
7. **Validar e entregar.** Siga [testing](../../../docs/testing.md) e os comandos do [README](../../../README.md): TypeScript, ESLint dos arquivos alterados e `npm run build-storybook` para criação/alteração de stories ou integração. Build não comprova renderização. Use `play` e utilitários de `storybook/test` quando houver comportamento relevante a verificar, com assertions sobre o resultado. Informe arquivos, cenários, comandos, resultados e limites. Compartilhe links reais quando disponíveis; recursos de review só devem ser usados se disponíveis e compatíveis com o escopo, sem publicação externa não autorizada.

## Documentação progressiva e navegação

- Ao criar ou alterar interface, avalie impacto em props, aparência, estados, interação e composição. Mantenha as stories e seus consumidores afetados no mesmo escopo; mudanças internas sem impacto no contrato/exemplos não exigem stories artificiais. Não documente em massa nem crie exemplos para preencher categorias.
- Siga os títulos hierárquicos existentes, incluindo famílias como `Componentes/Input/...`. Use `Composições/<contexto>/<nome>` ou `Interfaces/<contexto>/<nome>` somente quando houver um exemplo útil correspondente; não reorganize famílias existentes apenas por serem compostas. A introdução fica em `.storybook/Introduction.mdx`; não é necessário criar uma story para cada rota.
- Em componentes simples, use Autodocs e `parameters.docs.description.component`/descrições por story. Explique finalidade, quando usar e quando evitar, exemplos práticos, restrições e limitações técnicas ou de acessibilidade conhecidas. Documente somente o que a implementação comprova; não apresente uma limitação como garantia. Não replique APIs ou tokens mantidos no código.
- Reserve MDX para guias e relações de composição: importe `Meta`, `Canvas` e `Controls` de `@storybook/addon-docs/blocks`, associe a página com `Meta of={Stories}` e incorpore stories com `Canvas of={Stories.Exemplo}`. Ao substituir Autodocs por MDX, use `tags: ["!autodocs"]` no meta para evitar páginas duplicadas.
- Identifique apenas os componentes constituintes relevantes, seus papéis e links para documentação já existente. Descubra os IDs/destinos no índice real e confira-os após mudanças de títulos; não deduza IDs pelo nome. Não crie stories dos constituintes só para completar links.
- Use [InputSearch](../../../src/components/common/input/InputSearch.mdx) e sua [story](../../../src/components/common/input/InputSearch.stories.tsx) como referência: formulário real e eventos observáveis, sem backend. Prefira views/composições isoláveis a páginas com sessão real. Os guias permanentes são importados de `docs/` pelas páginas de [.storybook/docs](../../../.storybook/docs/Architecture.mdx) na categoria `Documentação`. Prefira seus destinos renderizados no Storybook a Markdown bruto; confira também links externos e para código, sem inventar URLs.

## Conteúdo e cobertura comportamental

Ao alterar a interface documentada ou sua composição, avalie o impacto nos testes de navegador com [playwright-test](../playwright-test/SKILL.md). Ela centraliza criação e execução proporcional de specs; não duplique um teste apenas por existir uma story.

- Identifique props, variantes e estados suportados antes de escolher exemplos: vazio/preenchido, enabled/disabled, loading/sucesso/erro, valores válidos/inválidos, limites, seleção/remoção e recuperação. Demonstre somente os casos pertinentes; um controle ou exemplo interativo pode cobrir vários casos sem stories adicionais.
- Para entradas de dados ou arquivos, exercite aceitação, rejeição e limites reais quando existirem. Explique como reproduzir o resultado e qual camada aplica cada restrição, distinguindo comportamento do navegador, biblioteca e componente. Não simule validação ou erro apenas exibindo uma mensagem artificial.
- Investigue bibliotecas relevantes e consulte suas documentações oficiais compatíveis com a versão instalada. Explique a responsabilidade da integração e referencie as APIs efetivamente utilizadas, sem copiar seus manuais. Identifique providers, contextos, dados simulados e diferenças em relação ao uso na aplicação.
- Em composições, mostre um exemplo funcional e explique como os constituintes relevantes interagem, com links existentes conforme a seção de navegação. Documente o uso e as limitações observáveis; detalhes internos dos testes não substituem instruções de utilização.

## Controls e TypeScript

- Confira todas as props públicas relevantes na implementação e na tabela Docs: tipo exibido, obrigatoriedade, controle e default real. Investigue `unknown`, `any` ou `object` que não representem a API. Diferencie falha de TypeScript de limitação do docgen; complemente `argTypes.type`/`table.type` quando necessário. Diferencie defaults do componente e args do exemplo. Não amplie o contrato de produção para corrigir a tabela.
- Exercite cada controle configurável relevante e confirme o efeito no DOM e no comportamento, não apenas no painel. Para valores complexos, prefira opções simples e válidas com `options`/`mapping` e uma fronteira tipada na story quando necessária; identifique argumentos exclusivos da demonstração. Não exponha controles que produzam estados incompatíveis com o contrato.

- **Valores limitados:** confira a união real e use `select` ou `radio` com opções válidas. A [story de Button](../../../src/components/common/button/Button.stories.tsx) define `type` como select com `button`, `submit` e `reset`, inicial `button`; `tabIndex` é numérico. A documentação automática pode mostrar `any` para atributos herdados: isso não é o contrato. Não contornar inferência com `any`, casts, suppressions ou control `object` para uma string.
- **ReactNode/children:** confirme onde o componente renderiza o conteúdo. Texto pode usar control `text`, como Button. JSX exige `render` ou `mapping` de opções serializáveis para elementos React; um objeto JSON não cria JSX. Desative controles sem representação útil com `control: false`. A [story de Input](../../../src/components/common/input/Input.stories.tsx) usa `ComIcone` com JSX, padding e ícone decorativo; children é irmão do input nativo em seu container. Preserve esse exemplo. [PageHeader](../../../src/components/common/page-header/PageHeader.stories.tsx) compõe `actions` por render e desativa seu controle.
- **Callbacks e estado:** use `fn()` de `storybook/test` para eventos existentes e inspecione o feedback de Actions. Um spy sozinho não testa interação: quando o cenário exigir essa prova, use `play`, interação e assertion da chamada/efeito esperado. Para props controladas, verifique se a edição exige atualizar args ou um estado local de demonstração; não invente callbacks. Só documente disabled, loading, erro ou variantes que o componente realmente suporta.

## Integrações mínimas

- **CSS/fontes/viewport:** o preview já importa globals.css, carrega variáveis de Geist/Geist Mono, referencia `vite/client` para assets e configura viewports. Preserve tokens e a tipografia efetiva, incluindo a divergência descrita em design.md. Use decorators locais para superfícies e dimensões adequadas; viewport e screenshots não certificam responsividade ou acessibilidade.
- **Next.js:** reutilize o adaptador e `nextjs.appDirectory` do preview para roteamento; ajuste parâmetros locais se necessário. Não importe layouts com sessão, credenciais ou operações exclusivas do servidor para obter contexto visual.
- **React Hook Form:** Input oferece `register=false` para renderização sem formulário, como no piloto. Se o objetivo for a integração registrada, componha o Form/provider existente em decorator ou render local, com schema e valores pertinentes; não apresente o modo isolado como teste de formulário.
- **TanStack Query/contextos:** confira se o componente precisa deles; prefira decorator local e cliente de cache isolado quando necessário. Use dados/mocks determinísticos e restaure estado entre cenários, sem sessão real ou chamadas ao backend de produção. Para mock de módulo, consulte o mecanismo oficial instalado; registre apenas o mock exigido quando tecnicamente necessário, sem adicionar providers globais para um único caso.
- **Novas integrações:** antes de a11y, Vitest, MSW, ferramentas visuais ou MCP, confira dependências/configuração e documentação oficial compatível. Não instalar ou configurar sem autorização. Testes `play` não significam que exista um runner automatizado ou suíte E2E.

## Referências oficiais

- [ArgTypes](https://storybook.js.org/docs/api/arg-types), [Controls](https://storybook.js.org/docs/essentials/controls), [MDX e Doc Blocks](https://storybook.js.org/docs/writing-docs/mdx) e [testes de interação](https://storybook.js.org/docs/writing-tests/interaction-testing): consulte conforme o recurso utilizado, confirmando disponibilidade na instalação local.

- [Recursos de IA do Storybook](https://storybook.js.org/docs/ai): documentação, descoberta e MCP; CLI local é a referência executável para comandos disponíveis.
- [Skill stories oficial para Codex](https://github.com/storybookjs/mcp/blob/main/packages/codex-plugin/plugins/storybook/skills/stories/SKILL.md) e [plugin experimental](https://github.com/storybookjs/mcp/blob/main/packages/codex-plugin/README.md): integração opcional. Não pressupor plugin/addon instalado; preferir `skills`/`tools` confirmados no CLI local a comandos legados do plugin.
- [Skills do Codex](https://developers.openai.com/codex/skills/): descoberta em `.agents/skills` e seleção pela descrição. A existência do arquivo não comprova ativação automática em uma tarefa real.
