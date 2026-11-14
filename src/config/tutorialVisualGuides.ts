export interface TutorialImageStep {
    id: string;
    desktopSrc: string;
    mobileSrc: string;
    caption: string;
    alt: string;
}

function createGuideSteps(
    tutorialId: string,
    steps: Array<{ caption: string; alt: string }>,
): TutorialImageStep[] {
    return steps.map((step, index) => {
        const number = index + 1;
        return {
            id: `${tutorialId}-step-${number}`,
            desktopSrc: `/images/tutoriais/desktop/${tutorialId}-step-${number}.png`,
            mobileSrc: `/images/tutoriais/mobile/${tutorialId}-step-${number}.png`,
            caption: step.caption,
            alt: step.alt,
        };
    });
}

/**
 * Passos ilustrados (Desktop e Mobile) para dúvidas frequentes dos associados.
 * As imagens ficam em `public/images/tutoriais/desktop` e `public/images/tutoriais/mobile`.
 */
export const MEMBER_VISUAL_GUIDES: Record<string, TutorialImageStep[]> = {
    "member-vehicles": createGuideSteps("member-vehicles", [
        {
            caption: "1. No menu lateral esquerdo (ou na barra inferior / avatar no celular), toque em 'Conta'.",
            alt: "Menu principal destacando a opção Conta e o atalho no avatar.",
        },
        {
            caption: "2. Escolha a aba 'Veículos' e clique em 'Incluir Veículo'.",
            alt: "Tela de Conta com a aba Veículos selecionada e o botão Incluir Veículo destacado.",
        },
        {
            caption: "3. Preencha modelo, placa, ano, adicione as fotos do 4x4 e salve.",
            alt: "Modal de cadastro de veículo com os campos obrigatórios e o botão Salvar destacados.",
        },
    ]),
    "member-medical": createGuideSteps("member-medical", [
        {
            caption: "1. No menu principal ou no seu avatar no topo, acesse 'Conta'.",
            alt: "Menu principal destacando a opção Conta.",
        },
        {
            caption: "2. Selecione a aba 'Dados médicos' e toque em 'Editar informações'.",
            alt: "Tela de Conta na aba Dados médicos destacando o botão Editar informações.",
        },
        {
            caption: "3. Informe tipo sanguíneo, alergias, medicações e contato de emergência.",
            alt: "Formulário da ficha médica com os campos de emergência e botão salvar destacados.",
        },
    ]),
    "profile-account": createGuideSteps("profile-account", [
        {
            caption: "1. No menu principal ou no seu avatar no topo, clique em 'Conta'.",
            alt: "Menu principal destacando a opção Conta.",
        },
        {
            caption: "2. Confira seus dados na aba 'Dados pessoais' ou toque em 'Editar' para atualizar.",
            alt: "Cartão de dados pessoais com o botão de edição destacado.",
        },
        {
            caption: "3. Veja a Carteirinha frente/verso ao lado e baixe em PNG ou PDF.",
            alt: "Carteira de Associado com os botões de alternar frente/verso e exportar em PNG ou PDF destacados.",
        },
    ]),
    "member-dependents": createGuideSteps("member-dependents", [
        {
            caption: "1. No menu principal ou no seu avatar no topo, acesse 'Conta'.",
            alt: "Menu principal destacando a opção Conta.",
        },
        {
            caption: "2. Toque na aba 'Dependentes' e clique em 'Incluir dependente'.",
            alt: "Aba Dependentes da Conta com o botão Incluir dependente em destaque.",
        },
        {
            caption: "3. Preencha nome, parentesco, foto opcional e confirme o cadastro.",
            alt: "Modal de cadastro de dependente destacando os campos principais e o botão salvar.",
        },
    ]),
    "member-tools": createGuideSteps("member-tools", [
        {
            caption: "1. No menu principal ou no seu avatar no topo, abra 'Conta'.",
            alt: "Menu principal destacando a opção Conta.",
        },
        {
            caption: "2. Escolha a aba 'Ferramentas' e clique em 'Incluir Ferramenta'.",
            alt: "Aba Ferramentas com o botão Incluir Ferramenta destacado.",
        },
        {
            caption: "3. Informe o nome e a foto opcional do equipamento de resgate e salve.",
            alt: "Modal de inclusão de ferramenta destacando os campos e botão de confirmação.",
        },
    ]),
    "feed-home": createGuideSteps("feed-home", [
        {
            caption: "1. Use os filtros no topo do Mural para alternar entre Tudo, Serviços, Avisos e Eventos.",
            alt: "Mural do clube destacando os botões de filtro Tudo, Serviços, Avisos e Eventos.",
        },
        {
            caption: "2. Clique em um evento e toque em 'Participar do evento' para abrir a inscrição.",
            alt: "Detalhes de evento destacando o botão Participar do evento.",
        },
        {
            caption: "3. Selecione seu veículo 4x4, marque dependentes ou convidado e confirme.",
            alt: "Modal de inscrição em evento destacando a seleção de veículo e botão de confirmação.",
        },
    ]),
    "member-agenda": createGuideSteps("member-agenda", [
        {
            caption: "1. No menu principal (ou na barra inferior do celular), toque em 'Agenda'.",
            alt: "Menu lateral e barra de navegação destacando o link Agenda.",
        },
        {
            caption: "2. Navegue pelos meses e toque em um dia com evento marcado para ver os detalhes.",
            alt: "Calendário mensal da Agenda destacando os dias com eventos e os botões de navegação.",
        },
    ]),
    "member-financial": createGuideSteps("member-financial", [
        {
            caption: "1. No menu lateral esquerdo (ou menu ☰ no celular), clique em 'Histórico financeiro'.",
            alt: "Menu principal destacando o item Histórico financeiro.",
        },
        {
            caption: "2. Use os filtros de status e ordenação para conferir vencimentos e valores.",
            alt: "Tela Histórico financeiro destacando os filtros de status e a lista de cobranças.",
        },
    ]),
    "member-services": createGuideSteps("member-services", [
        {
            caption: "1. No menu lateral esquerdo (ou menu ☰ no celular), clique em 'Serviços'.",
            alt: "Menu principal destacando a opção Serviços.",
        },
        {
            caption: "2. Explore os serviços da comunidade e toque em 'Ver detalhes' ou 'Contato'.",
            alt: "Tela de Serviços destacando os cartões publicados e os botões Ver detalhes e Contato.",
        },
    ]),
    "member-settings": createGuideSteps("member-settings", [
        {
            caption: "1. No rodapé do menu lateral (ou menu ☰ no celular), toque em 'Configurações'.",
            alt: "Menu lateral destacando a opção Configurações.",
        },
        {
            caption: "2. Escolha uma categoria para ajustar notificações, privacidade, tema ou refazer tutoriais.",
            alt: "Tela de Configurações destacando as categorias laterais e as preferências do usuário.",
        },
    ]),
    "member-change-password": createGuideSteps("member-change-password", [
        {
            caption: "1. Em Configurações, selecione a categoria 'Conta e segurança'.",
            alt: "Tela de Configurações destacando a categoria Conta e segurança.",
        },
        {
            caption: "2. Na lista de opções, clique em 'Senha' e depois em 'Alterar minha senha'.",
            alt: "Tela de Configurações destacando a opção Senha e o botão Alterar minha senha.",
        },
        {
            caption: "3. Informe sua senha atual, digite a nova senha (mínimo 8 caracteres) e confirme.",
            alt: "Formulário de alteração de senha com campos Senha atual, Nova senha e Confirmar nova senha.",
        },
    ]),
    "member-password-recovery": createGuideSteps("member-password-recovery", [
        {
            caption: "1. Na tela de login, toque em 'Esqueceu a senha?' logo abaixo do campo de senha.",
            alt: "Tela de login destacando o atalho Esqueceu a senha.",
        },
        {
            caption: "2. Informe seu CPF e clique em 'Enviar' para receber as instruções.",
            alt: "Tela Recuperar Senha destacando o campo de CPF e o botão Enviar.",
        },
    ]),
    "public-landing-home": createGuideSteps("public-landing-home", [
        {
            caption: "1. No topo da página inicial, use 'Entrar' (já sócio) ou 'Quero ser sócio'.",
            alt: "Página inicial do Jeep Club destacando os botões Entrar e Quero ser sócio.",
        },
        {
            caption: "2. Role a página para ver experiências, história do clube e o formulário de adesão.",
            alt: "Seções da página inicial destacando experiências off-road e atalho de associação.",
        },
    ]),
    "member-membership-apply": createGuideSteps("member-membership-apply", [
        {
            caption: "1. Na página inicial ou na tela de login, toque em 'Quero ser sócio' para abrir o formulário.",
            alt: "Tela de solicitação de associação exibindo o cabeçalho e o botão de ajuda.",
        },
        {
            caption: "2. Preencha seus dados pessoais (Nome, CPF, Celular e E-mail) e escreva sua carta de apresentação.",
            alt: "Formulário Quero ser sócio destacando os campos de identificação e apresentação.",
        },
        {
            caption: "3. Confira as informações e clique em 'Enviar solicitação' para análise da diretoria.",
            alt: "Botão Enviar solicitação destacado no final do formulário de associação.",
        },
    ]),
    "tutorials-hub": createGuideSteps("tutorials-hub", [
        {
            caption: "1. Digite sua dúvida na barra de busca e toque em 'Ver tutorial' para abrir as imagens.",
            alt: "Central de Tutoriais destacando a barra de busca e o botão Ver tutorial no card.",
        },
        {
            caption: "2. No cabeçalho das telas do sistema, clique no botão de ajuda para iniciar o tour interativo.",
            alt: "Cabeçalho da tela destacando o botão branco de ajuda contextual.",
        },
    ]),
};
