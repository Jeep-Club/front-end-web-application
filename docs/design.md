# Design do Jeep Clube Tamoios

A identidade combina o emblema do clube, azul profundo, amarelo e fotografias de trilha, aventura e comunidade. A composição acompanha a tarefa: site público expressivo, autenticação concentrada e administração legível. Mobile-first, clareza e acessibilidade orientam a apresentação.

Este guia define intenção visual. [globals.css](../src/app/globals.css) contém valores e aliases; componentes definem APIs e comportamentos. Consulte [components-and-pages.md](components-and-pages.md) para implementar interfaces e [testing.md](testing.md) para validá-las.

## Marca e imagens

Preserve o emblema, o lettering e as proporções. Escolha o arquivo por resolução, fundo e tamanho de aplicação; nenhum asset é obrigatório em todos os contextos. Não invente área de proteção ou tamanho mínimo sem referência de marca.

| Referência | Uso e cuidado |
| --- | --- |
| [jeepclube-emblema.png](../public/images/jeepclube-emblema.png) | Emblema usado na carteirinha. Verificar nitidez antes de ampliar o raster |
| [logo_grande.jpg](../public/images/logo_grande.jpg) | Versão maior sobre fundo branco, usada na Home; não tratar como imagem transparente |
| [Logo](../src/components/common/logo/index.tsx) | Atualmente usa favicon em área quadrada com object-cover e alt genérico. Verificar recorte e nome acessível ao alterar sua aplicação |
| [hero-jeep.jpg](../public/images/hero-jeep.jpg) | Fotografia vertical de jipe azul em trilha noturna; corte focal e contraste dependem do viewport e do overlay |
| [HomeClient](../src/components/pages/root/HomeClient.tsx) | Também usa jeep_vermelho.jpeg e mato.jpeg nos blocos de experiências; manter relação entre fotografia e conteúdo |

Não distorça nem recorte o emblema para preencher um container. Fotos informativas precisam de alternativa contextual; ornamentação não deve gerar ruído para leitores de tela.

## Linguagem por contexto

| Contexto | Diretriz e referência |
| --- | --- |
| Público editorial | Fotografias, fundos escuros, títulos expressivos e seções amplas, como na Home. Não transferir escala de hero e CTA de campanha para CRUD |
| Autenticação | Superfície navy, campos escuros e ação amarela; [Login](../src/components/pages/login/index.tsx) concentra ajuda e acesso. Isso não estabelece dark mode global |
| Público transacional | Formulários longos podem usar superfície clara, como [ApplyForm](../src/components/pages/membership/ApplyForm.tsx), com cabeçalho institucional |
| Dashboard/admin | Navegação azul, detalhe amarelo, conteúdo cinza claro e cards brancos; [DashboardShell](../src/components/common/layout-admin/DashboardShell.tsx) e [PageHeader](../src/components/common/page-header/index.tsx) são referências |
| Documento/exportação | Carteirinha mantém proporção, fonte e composição próprias, conforme seção de exportação |

Os contextos compartilham marca e semântica de cor, mas variam densidade e composição. Não uniformizar fundos e escalas de tarefas diferentes.

## Cores por papel

Azul profundo e amarelo formam a base institucional. Use o azul para estruturar navegação e o amarelo para destaque, ação principal e seleção. Superfícies de trabalho claras recebem texto escuro; superfícies escuras recebem texto claro com contraste suficiente.

Verde indica sucesso, vermelho erro/destruição, amarelo/âmbar atenção e azul informação. Texto, ícone ou forma devem complementar a cor. CTA amarelo e aviso amarelo precisam de composição e rótulos que distingam suas funções.

Reutilize a paleta j-* e os aliases semânticos existentes; não mantenha outra tabela de valores no Markdown. A Home mistura hex locais e cores Tailwind nativas; nem todo tom editorial é equivalente a um token administrativo. ApplyForm usa text-j-gray-800, sem esse alias no CSS global atual: conferir o contrato executável antes de reproduzir a classe. A existência de um token não garante contraste em todos os pares, opacidades e estados.

## Tipografia e hierarquia

**Geist é a fonte de referência da interface. Arial permanece na carteirinha até validação específica da exportação.** Geist Mono não é fonte geral.

O layout carrega Geist/Geist Mono, mas o body declara Arial/Helvetica e não há mapeamento explícito de font-sans para Geist. Essa divergência de implementação exige conferir fonte computada e quebra de texto ao alinhar o CSS.

Organize a leitura em título, contexto/ações, conteúdo e metadados. PageHeader usa título xl/md:2xl e breadcrumb xs/md:sm; métricas financeiras usam 3xl e a Home, 5xl/md:7xl. Reserve pesos muito altos para títulos/métricas e uppercase/tracking expansivo para trechos editoriais curtos. Não reduza fonte para acomodar conteúdo. Textos pequenos ou translúcidos de login/breadcrumb precisam de atenção à legibilidade.

## Grid, espaçamento e elevação

Use a escala Tailwind e receitas existentes por contexto: gutters administrativos compactos, cards com padding crescente e seções públicas mais amplas. Alinhe título, filtros e dados; use espaço para agrupar conteúdo sem criar um card para cada campo.

Table.Root combina borda, rounded-2xl e shadow-sm; modais financeiros usam rounded-3xl e shadow-2xl; o login possui sombra própria. Borda organiza superfície, sombra distingue elevação. Esses exemplos não impõem o mesmo raio ou sombra a todos os elementos. Tokens de raios/sombras comentados em globals.css não são contratos ativos.

## Componentes e referências de reutilização

| Necessidade | Referência e aplicação |
| --- | --- |
| Lista administrativa | [AdminUsersPage](../src/components/pages/admin/users/index.tsx) coordena navegação/ações; [UserManagementView](../src/components/pages/admin/users/UserManagementView.tsx) compõe PageHeader e família [Table](../src/components/common/table/index.ts) |
| Formulário financeiro claro | [ChargeDefinitionFormFields](../src/components/pages/admin/gestao-financeira/ChargeDefinitionFormFields.tsx) é compartilhado por criação/edição; adapta InputRegister, TextareaRegister e Select com labels e campos claros |
| Filtros | UserManagementView usa Select e labels claros dentro de Table.Header/Filters. A API de variantes não está unificada entre todos os campos |
| Campos | [Input](../src/components/common/input/input.tsx), [Select](../src/components/common/select/select.tsx) e [Form](../src/components/common/form/index.tsx) são referências. Campos claros em superfícies claras e escuros em escuras preservam comportamento, label, ajuda, erro e foco |
| Ações | [Button](../src/components/common/button/Button.tsx) e [ButtonIcon](../src/components/common/button/ButtonIcon.tsx) oferecem base de estados; ações por ícone precisam de nome acessível |
| Cards de dados | [FinancialDashboard](../src/components/pages/admin/gestao-financeira/FinancialDashboard.tsx) distingue título, métrica, descrição e ação; não fazer card informativo parecer clicável sem indicar interação |
| Modais | [ModalRoot](../src/components/common/modal/root/index.tsx) fornece overlay/Escape; o [modal financeiro](../src/components/pages/admin/gestao-financeira/EditChargeDefinitionModal.tsx) limita altura, permite scroll e mantém fechamento |

Há campos claros por overrides e uma família [SelectField](../src/components/common/SelectField.tsx) paralela. Reutilize o consumidor adequado; não crie outra família só para obter a superfície correta. A aparência não garante semântica: Select usa texto do erro em aria-describedby em vez de ID, e ModalRoot não centraliza papel/nome, foco inicial/contenção/retorno ou fundo inerte.

## Estados e interação

| Estado | Critério de apresentação |
| --- | --- |
| Loading inicial | Reservar espaço próximo da região em espera; [TableSkeleton](../src/components/common/table/table-skeleton.tsx) é referência de lista |
| Refetch | Indicar atualização preservando contexto quando possível. Table.Content tem barra/aria-busy, mas seu ramo error precede os dados e pode substituir a tabela |
| Erro | Mensagem contextual e recuperação adequada; edição financeira oferece retry e fechamento. Não apresentar erro como vazio ou loading infinito |
| Vazio | Explicar ausência de registros ou resultado dos filtros; criar/limpar somente quando a ação fizer sentido e houver permissão |
| Sucesso | Confirmar resultado sem depender apenas de cor ou toast; evitar repetir a mesma mensagem em handlers globais e locais |
| Hover/focus/selected/disabled | Manter sinais distintos, foco visível por teclado e estado selecionado programático. Hover não pode ser requisito para uso touch |

O [Loading global](../src/components/common/loading/index.tsx) tem dimensão própria e não deve ser copiado para toda célula. Mensagem de validação deve ficar associada ao campo. A semântica de transporte de erro pertence à [arquitetura](architecture.md), não à aparência do alerta.

## Mobile-first e acessibilidade

Comece em uma coluna, mantendo ações essenciais disponíveis, e aumente colunas quando o conteúdo permitir. O shell usa drawer abaixo de md; Table.Content muda para accordion abaixo de lg, com duas primeiras células no resumo. Escolha ordem e conteúdo desse resumo conscientemente, sem esconder funções para caber.

Verifique nomes longos, valores monetários, erro/vazio, zoom, orientação, altura disponível e teclado virtual. Classes overflow-hidden não provam ausência de clipping. Preserve labels e alvos alcançáveis, navegação por teclado, ordem/foco visível, fechamento e retorno de foco de modal/drawer. A recuperação de senha no login usa span onClick: não serve de referência de navegação acessível.

Meça contraste nos pares reais, inclusive estados e transparências sobre foto. Avalie redução de movimento no tour/animações. Capturas ajudam a comparação, mas não substituem interação, DOM, teclado ou avaliação humana. Não presumir que classes responsivas comprovem funcionamento em dispositivos reais.

## Carteirinha e exportação

[MembershipCard](../src/components/pages/profile/tabs/personal/MembershipCard.tsx) usa SVG 856×540, frente/verso, Arial, cores locais NAVY/GOLD/MUTED e emblema incorporado. A visualização pode rotacionar no mobile; faces de captura ficam fora da tela. [CardExportActions](../src/components/common/card-export/CardExportActions.tsx) oferece exportação; [buildMembershipCardPdf](../src/utils/card-export/buildMembershipCardPdf.ts) produz PDF landscape.

Preserve esse tratamento como exceção à UI. Antes de alterar fonte, cores ou composição, compare frente/verso em PNG/PDF, proporção, foto/nome longo e legibilidade no tamanho físico. Relatórios financeiros seguem sua finalidade e não devem receber a estética da carteirinha indiscriminadamente.
