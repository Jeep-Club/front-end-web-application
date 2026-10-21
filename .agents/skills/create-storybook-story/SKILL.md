---
name: create-storybook-story
description: Criar, atualizar, corrigir e documentar stories no Storybook do Jeep Club, incluindo Controls, ArgTypes, autodocs e integrações mínimas de renderização isolada. Use para tarefas de Storybook e documentação interativa de componentes existentes; alterações na implementação do componente pertencem a create-ui-component.
---

# Criar ou manter stories

Siga o [AGENTS.md](../../../AGENTS.md). Esta Skill cuida das stories; combine com [create-ui-component](../create-ui-component/SKILL.md) somente quando a tarefa também autorizar mudar o componente. Não é necessária para alterar apenas páginas, queries ou operações de servidor sem trabalho no catálogo.

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
2. **Escolher cenários úteis.** Adapte a story próxima antes de criar outra. Cubra estados distintos suportados e uso real, com dados sintéticos determinísticos. Evite combinações impossíveis e séries redundantes de exemplos.
3. **Escrever CSF tipado.** Use `import type { Meta, StoryObj } from "@storybook/nextjs-vite"`, `satisfies Meta<typeof Componente>` no meta, export default e `StoryObj<typeof meta>`. Mantenha `*.stories.tsx` junto ao componente. O glob atual cobre apenas `src/components/common/**/*.stories.tsx`: para uma família fora dele, identifique a necessidade de configuração dentro do escopo, sem mover produção ou criar cópias para contornar a descoberta.
4. **Configurar controles e documentação.** Aplique os critérios abaixo; use args para valores iniciais e descrições apenas quando acrescentarem informação de uso. Autodocs já é habilitado por `tags: ["autodocs"]` no [preview](../../../.storybook/preview.tsx); não duplicar configuração nem copiar APIs/valores CSS para Markdown.
5. **Isolar a renderização.** Reutilize a configuração existente e acrescente apenas a integração necessária, conforme a seção seguinte. Não mude a API do componente para facilitar uma demonstração.
6. **Verificar no Storybook.** Reutilize um servidor do projeto ou execute `npm run storybook` e aguarde a resposta. Descubra os cenários afetados com `npx --no-install storybook tools stories changed`; use `tools --help` para os argumentos reais e `tools stories find-by-component` quando necessário. IDs vêm da descoberta, nunca de suposições. Se o recurso estiver indisponível, consulte o índice local e registre o limite, sem instalar integração. Abra as stories afetadas e confira Controls, documentação, DOM, interação, teclado e tamanhos mobile/tablet/desktop. Se não houver navegador, declare a renderização/interação não verificadas.
7. **Validar e entregar.** Siga [testing](../../../docs/testing.md) e os comandos do [README](../../../README.md): TypeScript, ESLint dos arquivos alterados e `npm run build-storybook` para criação/alteração de stories ou integração. Build não comprova renderização. Use `play` e utilitários de `storybook/test` quando houver comportamento relevante a verificar, com assertions sobre o resultado. Informe arquivos, cenários, comandos, resultados e limites. Compartilhe links reais quando disponíveis; recursos de review só devem ser usados se disponíveis e compatíveis com o escopo, sem publicação externa não autorizada.

## Controls e TypeScript

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

- [Recursos de IA do Storybook](https://storybook.js.org/docs/ai): documentação, descoberta e MCP; CLI local é a referência executável para comandos disponíveis.
- [Skill stories oficial para Codex](https://github.com/storybookjs/mcp/blob/main/packages/codex-plugin/plugins/storybook/skills/stories/SKILL.md) e [plugin experimental](https://github.com/storybookjs/mcp/blob/main/packages/codex-plugin/README.md): integração opcional. Não pressupor plugin/addon instalado; preferir `skills`/`tools` confirmados no CLI local a comandos legados do plugin.
- [Skills do Codex](https://developers.openai.com/codex/skills/): descoberta em `.agents/skills` e seleção pela descrição. A existência do arquivo não comprova ativação automática em uma tarefa real.
