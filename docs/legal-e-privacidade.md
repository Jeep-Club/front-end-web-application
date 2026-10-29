# Termos de Uso e Política de Privacidade

Versão dos documentos: 1.0, de 28/10/2026.

Rotas públicas: `/termos-de-uso`, `/politica-de-privacidade` e `/contato`. Ficam fora dos grupos de autenticação para consulta antes do login e após encerramento da conta. Os links estão na página inicial, login, cadastro e área interna. O contato provisório de WhatsApp da página inicial foi substituído pela página de contato.

## Identificação e atendimento

O responsável informou que o clube não possui os dados institucionais e canais solicitados. Não foram inventados CNPJ, endereço, e-mail ou encarregado. As páginas mostram as lacunas com transparência. Isso não substitui a identificação do controlador e um canal efetivo para os titulares.

Definir uma pessoa física ou jurídica efetivamente responsável pelas decisões sobre os dados. A ausência de CNPJ não impede a identificação de pessoa física como controlador. Publicar somente os dados de identificação necessários; não divulgar CPF pessoal indiscriminadamente. Configurar no servidor, usando `.sampleenv` como referência:

- `LEGAL_CONTROLLER_NAME`: nome da pessoa física ou razão social responsável.
- `LEGAL_CONTROLLER_DOCUMENT`: identificação institucional pertinente, se houver; opcional.
- `LEGAL_CONTROLLER_ADDRESS`: endereço de atendimento apropriado.
- `LEGAL_PRIVACY_EMAIL`: endereço monitorado para direitos LGPD.
- `LEGAL_SUPPORT_EMAIL`: atendimento geral, opcional.

Essas variáveis são públicas por finalidade. Nunca colocar nelas senhas ou chaves. As páginas legais são renderizadas no servidor a cada solicitação e não exigem variáveis `NEXT_PUBLIC_`. Na ausência de e-mail não aparece link fictício nem formulário sem entrega.

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
