# Termos de Uso e Política de Privacidade

Termos de Uso e Política de Privacidade: versão 1.2, de 30/10/2026. As cláusulas de imagem e voz e ciência de riscos estão consolidadas nos Termos de Uso, conforme pedido do usuário. Não há fichas de preenchimento, formulários de assinatura ou documentos separados para o visitante.

Rotas públicas: `/termos-de-uso`, `/politica-de-privacidade` e `/contato`. As antigas rotas `/termo-de-imagem` e `/termo-de-risco` redirecionam para `/termos-de-uso#imagem-voz` e `/termos-de-uso#riscos-trilhas`. Ficam fora dos grupos de autenticação. O rodapé mantém os links dos documentos gerais, contato e a página `/equipe`, identificada como “Equipe técnica”.

## Identificação e atendimento

Inicialmente não havia dados institucionais e canais confirmados. Em 30/10/2026, o usuário forneceu orientação do presidente com o canal `dpo@jeeptamoios.com.br` e o domínio `www.jeeptamoios.com.br`. O e-mail passou a ser o padrão em `src/config/legal.ts`, sem modificar arquivos de ambiente; uma configuração explícita do servidor continua prevalecendo. A administração deve confirmar que a caixa funciona e é monitorada. Não foi inventada a identidade de um encarregado.

O CNPJ informado no modelo estava mascarado e não foi publicado como identificação válida. Razão social completa, documento e endereço seguem pendentes. As páginas mostram essas lacunas. Isso não substitui a identificação do controlador.

Definir uma pessoa física ou jurídica efetivamente responsável pelas decisões sobre os dados. A ausência de CNPJ não impede a identificação de pessoa física como controlador. Publicar somente os dados de identificação necessários; não divulgar CPF pessoal indiscriminadamente. Configurar no servidor, usando `.sampleenv` como referência:

- `LEGAL_CONTROLLER_NAME`: nome da pessoa física ou razão social responsável.
- `LEGAL_CONTROLLER_DOCUMENT`: identificação institucional pertinente, se houver; opcional.
- `LEGAL_CONTROLLER_ADDRESS`: endereço de atendimento apropriado.
- `LEGAL_PRIVACY_EMAIL`: endereço monitorado para direitos LGPD; se ausente, utiliza o e-mail informado pelo presidente.
- `LEGAL_SUPPORT_EMAIL`: atendimento geral, opcional.

Essas variáveis são públicas por finalidade. Nunca colocar nelas senhas ou chaves. As páginas legais são renderizadas no servidor a cada solicitação e não exigem variáveis `NEXT_PUBLIC_`. Não há formulário de envio de pedidos de privacidade.

O componente `src/components/common/site-footer/index.tsx` compartilha o rodapé entre a página inicial, a equipe e as páginas legais. Preencha `src/config/footer.ts` com o nome/razão social, CNPJ, endereço com CEP e os links HTTPS dos perfis oficiais. Campos vazios são omitidos; o título “Redes sociais” permanece visível e os ícones aparecem ao preencher os links. Se houver identificação institucional configurada nas variáveis `LEGAL_CONTROLLER_NAME`, `LEGAL_CONTROLLER_DOCUMENT` e `LEGAL_CONTROLLER_ADDRESS`, esses valores prevalecem no rodapé. Em produção, recompile/republique após alterar o arquivo.

## Imagem e trilhas nos Termos de Uso

As regras completas estão nas seções `imagem-voz` e `riscos-trilhas` do mesmo documento. Os campos, checkboxes e botões de preparação para impressão da implementação anterior foram removidos. A navegação não solicita qualificação adicional ou assinatura. A organização continua responsável por informar as condições concretas de cada atividade e completar sua identificação institucional.

Incluir as regras no mesmo texto não converte navegação ou aceite genérico em consentimento específico para toda utilização de imagem. O site também não afirma ter registrado ciência individual de risco apenas porque a página foi consultada.

O modelo do presidente foi adaptado para preservar revogação, reparação e acesso à Justiça. Não foram incluídas isenção total civil/criminal, promessa de não processar, irrevogabilidade geral do que já foi publicado, consentimento promocional obrigatório para participar, transferência de toda responsabilidade de menores ou ambiental, nem exigência genérica de documentos dos dois pais com firma reconhecida para qualquer menor de 12 anos. Essas regras não devem ser reintroduzidas como condição de um checkbox. O prazo de retirada de até 15 dias é compromisso operacional proposto pelo clube e precisa ser atendido na operação; não foi apresentado como prazo legal geral.

### Integração futura de inscrições e aceites

O repositório não contém módulo de eventos/inscrições, endpoint de consentimentos ou acesso a banco durável. Por isso não foi criada tabela `consents`, captura de IP ou assinatura digital fictícia. Não há checkbox ou coleta adicional na página dos termos; a interface não declara aceite registrado.

Antes de disponibilizar aceite eletrônico, implementar no backend:

1. Identidade autenticada e verificação proporcional da representação do menor; cada adulto registra sua própria vontade. Não assumir que preencher nome/CPF comprova identidade ou poderes.
2. Documentos versionados e imutáveis, texto canônico e hash calculado no servidor; evento, titular, representante e cada finalidade escolhida associados ao registro. Separar `imagem_voz` de `ciencia_risco_trilha`, sem nomear o registro como isenção total.
3. Data/hora do servidor, origem e dados de auditoria estritamente necessários. IP deve vir de infraestrutura confiável, não de campo do navegador nem de cabeçalho arbitrário não validado. Documentar base legal e retenção.
4. Gravação durável e transacional, autorização, proteção CSRF e contra repetição, recibo acessível ao titular e tratamento de falhas. Só confirmar o aceite após sucesso do servidor. IP, hash e checkbox isolados não comprovam tudo.
5. Registro de revogação, bloqueio de novos usos e fluxo de retirada/desfoque, inclusive para operadores. Dar tratamento restrito à prova eventualmente conservada.
6. Conferência da ciência de riscos e das condições de segurança na inscrição, sem exigir imagem promocional como contrapartida. Dados de saúde exigem fluxo próprio e restrito.
7. Definir se e como será utilizado provedor de assinatura eletrônica, inclusive gov.br. Não equiparar checkbox a assinatura gov.br nem prometer blindagem jurídica ou obrigatoriedade universal de assinatura física e digital simultâneas.

Os documentos e os procedimentos devem ser revisados por assessoria jurídica do clube antes da coleta de assinaturas e utilização operacional, sobretudo nas atividades com menores, no compromisso de retirada e na definição de responsáveis.

## Inventário confirmado no código

| Operação | Dados e destino | Referências |
| --- | --- | --- |
| Registro | Nome, CPF, nascimento (`birthData` no contrato atual), e-mail, telefone, senha; enviados à API | `src/schemas/auth/register/registerRequest.ts`, `src/actions/auth/registerAction.ts` |
| Login e recuperação | CPF/senha, tokens de recuperação e sessão; API e cookies | `src/actions/auth/`, `src/utils/auth/`, `src/proxy.ts` |
| Perfil | Nome, CPF, RG, nascimento, foto, e-mail, telefone, status e datas; consulta à API | `src/schemas/user/profile.ts` |
| Edição pessoal | Alterações e foto convertida em base64 ficam na memória/cache de consulta; atualmente não há ação de gravação permanente | `src/components/pages/profile/tabs/personal/PersonalDataTab.tsx`, `EditPersonalDataModal.tsx` |
| Veículos | Placa, Renavam, fotos e características; API | `src/types/vehicles/include.d.ts`, `src/actions/vehicles/` |
| Dependentes | Identificação, contato, parentesco, dados médicos e indicadores de consentimento previstos em contrato de dados; não comprova fluxo ativo de cadastro | `src/schemas/admin/dependent.ts` |
| Perfil médico | Saúde, plano e contato de emergência; consulta/edição administrativa pela API | `src/schemas/admin/medical-profile.ts`, `src/actions/admin/medical-profile/put.ts` |
| Carteirinha | Dados exibidos são convertidos em imagens/PDF no navegador, com download local | `src/utils/card-export/exportCard.ts` |
| Cookies | `AuthAccessToken`, `AuthRefreshToken`, `AccessTokenExpiration`, `Me`, `Permissions`; cookies de sessão, removidos no logout | `src/utils/auth/login.ts`, `me.ts`, `logout.ts`, `src/proxy.ts` |
| Recursos externos | Avatar remoto do Google na barra superior; pode transmitir informações técnicas ao provedor | `src/components/common/layout-admin/Topbar.tsx` |

Não foram encontrados trackers de publicidade, analytics, geolocalização, pagamentos, processamento biométrico ou envio de newsletter. O feed está em desenvolvimento. Os campos `test1` a `test5` do formulário de cadastro não fazem parte do schema enviado à API. Não tratá-los como um serviço de armazenamento de documentos.

## Pontos que os textos não resolvem no servidor

- Confirmar controlador e canal real de atendimento; organizar resposta, verificação proporcional de identidade, correção, exportação, exclusão e encerramento de conta. A interface não implementa protocolo de solicitações.
- Inventariar API, hospedagem, banco, backups, envio de e-mail, manutenção, eventuais suboperadores, países e acessos externos. Completar destinatários, finalidades, contratos e garantias de transferência internacional.
- Definir prazos por categoria, critérios de retenção, execução de exclusão e ciclo de backups. Não afirmar que existem rotinas automáticas sem implementá-las.
- Documentar a base legal de cada operação. Para tratamento rotineiro de saúde baseado em consentimento, implementar obtenção específica e destacada, finalidade, versão, titular/representante, data e revogação; armazenar evidências no servidor. O aviso administrativo incluído não é uma coleta nem prova de consentimento.
- Validar representação de dependentes e melhor interesse de menores, inclusive aplicabilidade do ECA e do Estatuto Digital da Criança e do Adolescente (Lei 15.211/2025). Não presumir autorização apenas porque o associado preencheu os campos.
- Verificar controle de autorização na API, sigilo de dados médicos, HTTPS de produção, gestão de chaves, armazenamento seguro de senhas, minimização de logs e resposta a incidentes. A política não certifica esses controles. Há configurações diferentes de `secure` entre login e renovação no proxy, que merecem revisão própria de autenticação.
- Persistir correções de perfil no backend antes de apresentá-las como efetivas. O texto atual explica a limitação existente.
- Se forem introduzidos cookies opcionais, implementar escolhas e bloqueio antes da ativação quando o consentimento for necessário. Não adicionar um botão genérico de aceite como substituto.

Os documentos foram adaptados às funcionalidades encontradas, com referências oficiais, sem copiar as renúncias amplas do exemplo anexado. A publicação dos textos não comprova conformidade integral. A administração deve validar o tratamento efetivo e obter revisão jurídica compatível com a operação, em especial para dados sensíveis e de menores.

## Verificação desta alteração

Na versão 1.2, a verificação se concentra nas seções integradas, na ausência de campos e checkboxes, nos links do sumário e nos redirecionamentos das antigas páginas. Os controles de preenchimento e impressão da versão anterior não fazem mais parte da interface. O estilo de impressão dos documentos gerais permanece disponível para a impressão comum pelo navegador.

Verificação inicial de 28/10/2026:

- Análise ESLint dos novos componentes, páginas e configuração: passou.
- Renderização direta com React das três páginas e layout: passou, com um título principal por página, links legais presentes e destinos dos sumários existentes. Cenários de contato configurado e ausente também foram verificados.
- `git diff --check`: passou.
- `tsc --noEmit`: os mesmos dois erros já presentes antes da alteração, em `input-password.tsx` (tipo `InputProps` não exportado) e `Sidebar.tsx` (propriedade `role` fora da interface). Não apareceram erros novos nos documentos.
- Build de produção: interrompido pela indisponibilidade de acesso às fontes Geist/Geist Mono no Google Fonts.
- Navegação HTTP e inspeção visual: não concluídas. O comando normal de desenvolvimento encontrou restrição de criação de processo; a inicialização direta retornou erro de arquivo interno do Next ausente, inclusive na página inicial. A renderização direta não substitui essa verificação de integração.

## Referências oficiais consultadas

- [LGPD, texto atualizado na Câmara](https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-normaatualizada-pl.html).
- [Marco Civil da Internet](https://www.gov.br/mj/pt-br/assuntos/sua-protecao/sedigi/LEIN12.965DE23DEABRILDE2014.pdf).
- [Guia da ANPD sobre cookies](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_orientativo_cookies_e_protecao_de_dados_pessoais).
- [ANPD: dados de crianças e adolescentes](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-divulga-enunciado-sobre-o-tratamento-de-dados-pessoais-de-criancas-e-adolescentes).
- [ANPD: transferências internacionais](https://www.gov.br/anpd/pt-br/assuntos/assuntos-internacionais/transferencia-internacional-de-dados).
- [ANPD: comunicação de incidentes](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-aprova-o-regulamento-de-comunicacao-de-incidente-de-seguranca).
- [CDC, arts. 25 e 51, texto atualizado na Câmara](https://www2.camara.leg.br/legin/fed/lei/1990/lei-8078-11-setembro-1990-365086-normaatualizada-pl.html).
- [ANPD: direitos dos titulares, inclusive revogação](https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados/direito-dos-titulares).
- [Governo Digital: tipos e requisitos de assinatura eletrônica](https://www.gov.br/governodigital/pt-br/identidade/assinatura-eletronica/saiba-mais-sobre-a-assinatura-eletronica).
- [TJPE: regras e exceções de autorização para viagens nacionais de menores](https://portal.tjpe.jus.br/web/infancia-e-juventude/viagens-nacionais).
