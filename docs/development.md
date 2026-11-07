# Convenções de desenvolvimento

Use este guia para organização e práticas gerais; [architecture.md](architecture.md) explica as fronteiras técnicas, [design.md](design.md) define apresentação e [components-and-pages.md](components-and-pages.md) descreve a implementação de telas. Comandos e ambiente ficam no [README](../README.md); estratégias de verificação em [testing.md](testing.md).

## Organização e responsabilidade

Preserve App Router e a estrutura existente. Entradas de rota/layout ficam em src/app, controles compartilhados em components/common e coordenação de tela em components/pages. Operações remotas seguem actions por domínio; schemas validam contratos runtime e services concentram HTTP/token. Não adicionar camada que apenas renomeia uma chamada.

Antes de criar arquivo, procure símbolo, contrato e consumidor equivalente. Código comentado não é implementação ativa. Crie arquivos com responsabilidade e conteúdo reais, sem pastas vazias para completar uma estrutura idealizada.

Prefira **um componente público principal por TSX**, admitindo helpers privados coesos. [Table.Content](../src/components/common/table/table-content.tsx) mantém StateMessage e MobileAccordionRow locais. Extraia quando houver reuso concreto, fronteira Server/Client, comportamento próprio ou ganho de leitura/testabilidade; não use contagem de linhas/componentes como regra mecânica.

[ChargeDefinitionFormFields](../src/components/pages/admin/gestao-financeira/ChargeDefinitionFormFields.tsx) exemplifica reuso de domínio entre criação/edição. Isso não exige promovê-lo a common ou criar um renderizador universal de formulários. Props/tipos/helpers de uso único podem permanecer junto ao consumidor.

## Nomes

| Elemento | Convenção e referência |
| --- | --- |
| Componentes/tipos | PascalCase: UserManagementView, EditChargeDefinitionModal, TableRootProps |
| Hooks | Prefixo use: [useModalFocusRestoration](../src/components/pages/admin/users/useModalFocusRestoration.ts); extrair comportamento quando houver motivo concreto |
| Funções/callbacks | camelCase: parseAdminUserSearchParams, handleSortChange; props de evento com intenção clara, como onConfirm |
| Schemas | camelCase com sufixo Schema e finalidade explícita: chargeDefinitionFormSchema |
| Operações | Manter nomes locais como listChargeDefinitionsAction; Action também aparece em leituras |
| Constantes | Nomes locais como PAGE_SIZE e LIGHT_FIELD_CLASS; não centralizar valor de um único consumidor sem necessidade |

Arquivos e diretórios misturam index, kebab-case, camelCase e PascalCase. Para arquivo novo, siga a família próxima e torne a responsabilidade identificável. Evite renomeações cosméticas e reorganização global junto de correção funcional.

## TypeScript e Zod

[tsconfig.json](../tsconfig.json) habilita strict e alias @/* para src/*. Existem tipos globais .d.ts em [types](../src/types) e tipos exportados por módulos/componentes. Preserve compatibilidade ao tocar contratos, sem converter todo o projeto para um único formato.

TypeScript não valida entrada remota nem resposta HTTP. Reutilize schemas que representem o contrato correto e diferencie input textual de formulário, output transformado e DTO. Inferência e z.input/z.output podem expressar essa distinção quando adequados; não exigem migração geral.

O [schema financeiro](../src/schemas/billing/chargeDefinition.ts) transforma strings em números e força tipagem por cast. [Form](../src/components/common/form/index.tsx) usa cast any no resolver. São limitações, não receitas a copiar. Não acrescente casts para ocultar divergências; localize o contrato real. As restrições de entrada/DTO e transporte estão detalhadas na arquitetura.

## Imports e exports

Use @/ entre áreas de src e relativos dentro de uma família, seguindo o arquivo tocado. Agrupe imports de forma legível; use import type/export type quando a dependência for apenas de tipo. Não há ordenação personalizada configurada no [ESLint](../eslint.config.mjs).

Consuma a API pública da família quando existir: [button/index.ts](../src/components/common/button/index.ts) exporta membros nomeados; [table/index.ts](../src/components/common/table/index.ts) publica composição e tipos. Imports diretos existentes, como InputRegister, não exigem novo barrel. Named/default coexistem; respeite consumidores e os exports exigidos pelo Next. Não crie índice global nem converta todos os exports por preferência.

## React e Next.js

Mantenha hooks no topo e dependências de efeitos coerentes. Use handlers para efeitos de interação; não adicione useEffect apenas para copiar estado derivável de props/URL. Dados remotos, permissões e estado local têm donos distintos, descritos na arquitetura. Memoização exige motivo concreto, sem envolver preventivamente todo callback.

Defina use client na fronteira interativa necessária. Função comum de servidor não precisa virar endpoint remoto com use server. Não importar credenciais ou módulos de servidor na UI. Params/searchParams assíncronos seguem os consumidores atuais do App Router.

Prefira children, props pequenas e callbacks significativos a muitas flags combináveis. Uma primitiva não deve conhecer API/regra de um domínio por causa de um consumidor. Identifique os demais usos antes de alterar contrato compartilhado; modal e campos possuem lacunas reais, não APIs novas unificadas.

Use `cursor-pointer` em ações clicáveis quando a affordance não estiver clara; não force cursor de ação em campos de texto. Um controle desabilitado deve comunicar visual e semanticamente seu estado.

Os tokens CSS resolvidos por `data-theme` determinam a superfície dos campos. Props `variant="white"`/`variant="gray"` mantidas por componentes legados continuam válidas para seus consumidores; não as exija em novos campos nem migre telas em massa. Prefira reuso quando adequado ao contexto, não como requisito de uniformização.

Todo controle interativo precisa da semântica apropriada, nome acessível e descrição quando necessária, operação por teclado e foco visível. Inclua estados disabled/pending tanto na apresentação quanto na semântica compatível com o elemento. Disponibilize ajuda relevante junto ao campo ou ação; tooltip é complemento útil para ações ambíguas e deve responder a foco e hover, fechar com Escape e não substituir nome acessível, instruções persistentes ou mensagens de validação.

## Documentação no código

Use JSDoc em funções, métodos e APIs compartilhadas quando o contrato ou a responsabilidade precisar de explicação além do nome e da tipagem. Aplique o mesmo critério a código de aplicação, testes, fixtures, utilitários e infraestrutura; não exija um bloco para cada símbolo exportado.

- Descreva parâmetros e retornos quando houver significado, formato, unidade ou condição não evidente; não repita os tipos já expressos em TypeScript. Registre efeitos colaterais, erros propagados, pré-condições e restrições relevantes.
- Explique decisões técnicas não evidentes e os limites da responsabilidade. Para constantes, configurações e variáveis, documente significado, origem ou motivo do valor quando o nome não bastar; não transforme todo valor local em constante apenas para comentá-lo.
- Prefira comentários sobre o motivo e o contrato. Evite narrar operações óbvias, manter código morto comentado ou copiar guias completos para o arquivo.
- Atualize ou remova comentários na mesma alteração que mudar o comportamento. Descreva o contrato implementado, distinguindo limitações de garantias; não registre apenas a intenção de uma proposta.

[auditAccessibility](../tests/browser/accessibility.ts) exemplifica um contrato com efeitos em arquivos/relatório e assertions soft: a função terminar não significa que o teste passou. A [fixture de navegador](../tests/browser/fixtures.ts) explica o alcance da interceptação e do ciclo por teste, sem confundir requisições do browser com chamadas do servidor Next. Mantenha detalhes executáveis no código e estratégias de validação em [testing.md](testing.md).

## Minimal Implementation

1. Delimite comportamento e arquivos; confira estado Git/diff e preserve alterações anteriores.
2. Procure reuso e confirme o contrato. Repetição não torna um defeito um padrão válido.
3. Prefira modificar código existente ou compor. Crie helper/hook/service/interface apenas para responsabilidade ou duplicação concretas.
4. Não misture alteração funcional com reformatação, renomeação, dependência ou arquitetura fora do escopo.
5. Atualize a fonte documental quando mudar uma convenção, usando referências cruzadas em vez de copiar regras.

## Verificação e entrega

Aplique verificações proporcionais descritas em testing.md e comandos do README. Documentação exige links/caminhos/conteúdo/diff; regras e operações exigem tipos, lint e cenários afetados; UI exige também estados, teclado e responsividade conforme o ambiente disponível.

Informe arquivos e motivo da mudança, comandos/resultados realmente observados, falhas preexistentes versus regressões e limites de validação. Revise consumidores afetados e diff final. Não crie teste que apenas espelha alteração trivial nem mude uma assertion só para obter verde. Testes Node não comprovam layout/foco real; acesso ao backend não deve usar dados de produção como fixture.
