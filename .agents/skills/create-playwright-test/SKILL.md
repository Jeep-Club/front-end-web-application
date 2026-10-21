---
name: create-playwright-test
description: Criar, manter, executar e investigar testes de navegador do Jeep Club com Playwright, na aplicação Next.js ou em stories existentes. Use também para avaliar cobertura e selecionar testes afetados por mudanças de interface; não para testes unitários Jest ou para documentar stories sem trabalho de testes no navegador.
---

# Testes de navegador

Siga o [AGENTS.md](../../../AGENTS.md). Consulte [testing](../../../docs/testing.md#testes-de-navegador) para ambiente, isolamento, artefatos e limitações; os comandos de preparação ficam no [README](../../../README.md#comandos). Esta Skill não autoriza mudar produção ou instalar ferramentas para fazer um teste passar.

## Investigar e escolher a cobertura

1. Leia a implementação, os consumidores e os testes da funcionalidade em [tests/browser](../../../tests/browser). Confira a [configuração](../../../playwright.config.ts), as stories e seus IDs reais quando aplicáveis. Identifique os comportamentos alterados, estados, erros, interações, teclado/foco e riscos de reflow. Consulte arquitetura ou design apenas para os contratos relevantes.
2. Decida se os testes existentes continuam válidos, precisam de atualização ou deixam uma lacuna relevante. Acrescente teste quando ele provar um comportamento ou risco ainda não coberto; não duplique cenários, copie uma assertion por prop ou crie teste apenas porque houve edição. Registre a justificativa quando nenhum teste novo for útil.
3. Escolha a fronteira: Storybook para componentes/composições isoláveis e seus estados; aplicação para navegação, formulários e integração da interface com layouts/providers reais. Um teste isolado não comprova um fluxo completo nem autorização no backend. Não crie stories ou extraia views somente para acomodar testes sem benefício concreto.

## Implementar ou adaptar

- Organize specs por comportamento/funcionalidade, como [Table](../../../tests/browser/table-interactions.spec.ts) e [login](../../../tests/browser/login-form.spec.ts), sem impor um arquivo por componente. Mantenha-os em `tests/browser/`, excluídos do [Jest](../../../jest.config.ts).
- Reutilize [fixtures.ts](../../../tests/browser/fixtures.ts) para cenários locais sem backend: bloqueia operações remotas, detecta erros JavaScript e anexa capturas. Confira se essa fronteira serve ao requisito; não remova proteções para executar operações reais. Integração autenticada exige ambiente e dados próprios autorizados, ainda não fornecidos por esses pilotos. Extraia outra fixture apenas com necessidade concreta.
- Use papéis/nomes acessíveis, labels e dados sintéticos determinísticos. Prefira assertions sobre resultados visíveis, valores, foco, estados e efeitos. Evite classes CSS, seletores de implementação, posições arbitrárias e textos voláteis; CSS pode ser verificado quando o próprio requisito for apresentação, como indicador de foco.
- Use o auto-wait e assertions com retry do Playwright; não acrescente sleeps, retries de cenário, skips ou tolerâncias para ocultar falhas. Visibilidade e `load` não garantem hidratação: investigue prontidão observável e perda de eventos sem recorrer a detalhes privados do React nos testes. Preserve as verificações existentes quando a falha revelar comportamento real.
- Em stories com `play`, escolha conscientemente quem conduz as interações. O piloto usa `embed=true` no Storybook instalado para desativar autoplay; isso não valida o `play`. Confirme esse recurso antes de reutilizá-lo em outra versão.
- Reutilize os projetos configurados para motores e larguras, sem copiar testes por navegador. Verifique reflow, conteúdo, foco/teclado e elementos alcançáveis; overflow de página difere de scroll interno intencional. Screenshots complementam assertions, não certificam acessibilidade. Não crie ou atualize baselines visuais sem referência estável e aprovada.

## Selecionar e executar

Defina a abrangência pelos consumidores afetados, sem executar tudo automaticamente:

| Impacto | Execução |
| --- | --- |
| Pequeno e localizado | Arquivo/cenário relacionado e projeto adequado ao risco; Chromium é uma primeira verificação comum, mas uma falha específica de motor deve ser reproduzida nele |
| Componente compartilhado | Specs do componente e dos consumidores afetados; amplie motores/larguras conforme CSS, foco, inputs e demais riscos |
| Estrutura, fixture ou configuração compartilhada | Suíte completa nos projetos configurados |

Use arquivos, `--project` e `--grep` conforme os exemplos em testing.md. Confira a seleção com `--list` quando houver dúvida. Não deixe de executar testes relevantes para economizar tempo; se infraestrutura impedir, registre o bloqueio e o que ficou sem validar.

## Verificação e entrega

Execute TypeScript e ESLint proporcionais aos arquivos alterados; confirme que o Jest não coleta specs Playwright se tocar descoberta ou organização. Analise screenshots, trace, contexto de erro e logs nas falhas, comparando cenário/motor com evidências anteriores. Distinga ambiente, sincronização, expectativa desatualizada e defeito funcional; não diminua assertions ou altere produção só para obter verde.

Informe arquivos, motivo da cobertura/seleção, comandos, projetos e resultados realmente executados, caminhos dos artefatos e limitações. A existência da Skill ou uma listagem de testes não comprova ativação automática nem execução de navegador.

Referências oficiais, conforme necessário: [boas práticas](https://playwright.dev/docs/best-practices), [locators](https://playwright.dev/docs/locators), [assertions](https://playwright.dev/docs/test-assertions), [projetos](https://playwright.dev/docs/test-projects) e [fixtures](https://playwright.dev/docs/test-fixtures). Confirme recursos na versão instalada antes de adotar APIs novas.
