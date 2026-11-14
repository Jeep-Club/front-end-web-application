import type { DriveStep } from "driver.js";

function createStepHeader(title: string, svgPath: string, badge?: string): string {
    const badgeHtml = badge
        ? `<span style="margin-left:auto; background:var(--accent-surface); color:var(--accent-text); font-size:10px; font-weight:800; padding:2px 7px; border-radius:6px; text-transform:uppercase; letter-spacing:0.04em;">${badge}</span>`
        : "";

    return `
        <div style="display:flex; align-items:center; gap:8px; width:100%; margin-bottom:2px;">
            <span style="display:inline-flex; align-items:center; justify-content:center; width:24px; height:24px; min-width:24px; border-radius:6px; background:#061e50; color:#fed01b;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    ${svgPath}
                </svg>
            </span>
            <span style="font-weight:800; color:var(--accent-text); font-size:15px; letter-spacing:-0.01em;">${title}</span>
            ${badgeHtml}
        </div>
    `;
}

// Ícones Lucide como paths SVG inline
const ICONS = {
    compass: `<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>`,
    sidebar: `<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/>`,
    smartphone: `<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>`,
    feed: `<path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/>`,
    user: `<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
    shield: `<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>`,
    checkCircle: `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>`,
    logIn: `<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/>`,
    idCard: `<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>`,
    key: `<path d="m21 2-2 2m-1.5 1.5L16 7l-1.5-1.5L13 7l-1.5-1.5L10 7l-1.5-1.5L7 7l-1.5-1.5L4 7a4.24 4.24 0 0 0 6 6l1.5-1.5L13 13l1.5-1.5L16 13l1.5-1.5L19 13l1.5-1.5L22 10l-2-2z"/>`,
    helpCircle: `<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>`,
    userPlus: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>`,
    layers: `<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 12.5-8.58 3.91a2 2 0 0 1-1.66 0L2 12.5"/><path d="m22 17.5-8.58 3.91a2 2 0 0 1-1.66 0L2 17.5"/>`,
    users: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
    wallet: `<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>`,
    plus: `<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="16"/><line x1="8" x2="16" y1="12" y2="12"/>`,
    sliders: `<line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="1" x2="7" y1="14" y2="14"/><line x1="9" x2="15" y1="8" y2="8"/><line x1="17" x2="23" y1="16" y2="16"/>`,
    heartPulse: `<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>`,
    car: `<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>`,
    wrench: `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>`,
    arrowDown: `<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>`,
    mapPin: `<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>`,
    calendar: `<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>`,
    store: `<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/>`,
    settings: `<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>`,
};

// Tour da tela inicial (Home / Landing Page)
export function getHomeTourSteps(): DriveStep[] {
    return [
        {
            element: "#tour-home-member-btn",
            popover: {
                title: createStepHeader("Acesso ao Painel do Clube", ICONS.logIn),
                description: "Já tem uma conta no Jeep Club Tamoios? Clique em <strong>'Entrar'</strong> para acessar o sistema com seu CPF e senha.",
                side: "bottom",
                align: "start",
            },
        },
        {
            element: "#tour-home-join-btn",
            popover: {
                title: createStepHeader("Associe-se ao Clube", ICONS.userPlus, "Novo Sócio"),
                description: "Ainda não faz parte? Clique em <strong>'Quero ser sócio'</strong> para preencher o formulário de adesão e enviá-lo para análise da diretoria.",
                side: "bottom",
                align: "center",
            },
        },
        {
            element: "#tour-home-scroll-down",
            popover: {
                title: createStepHeader("Explore a Página", ICONS.arrowDown),
                description: "Role a página ou clique neste indicador para navegar pelas seções de experiências, história e ações do clube.",
                side: "top",
                align: "center",
            },
        },
        {
            element: "#experiencias",
            popover: {
                title: createStepHeader("Expedições, Trilhas e Encontros", ICONS.compass),
                description: "Conheça as principais vivências do clube: trilhas off-road na Mata Atlântica, passeios leves e encontros de confraternização.",
                side: "top",
                align: "center",
            },
        },
        {
            element: "#legado",
            popover: {
                title: createStepHeader("Legado e Tradição", ICONS.shield, "Desde 1999"),
                description: "Mais de duas décadas de tradição no Litoral Norte, reunindo dezenas de membros ativos e centenas de trilhas realizadas.",
                side: "top",
                align: "center",
            },
        },
        {
            element: "#impacto",
            popover: {
                title: createStepHeader("Impacto Social", ICONS.heartPulse, "Solidariedade"),
                description: "Off-road com propósito: veja como nossa frota 4x4 apoia comunidades isoladas em calamidades, campanhas de Dia das Crianças e doações regulares.",
                side: "top",
                align: "center",
            },
        },
        {
            element: "#tour-home-cta",
            popover: {
                title: createStepHeader("Pronto para a Próxima Aventura?", ICONS.car),
                description: "Ao final da página, você encontra outro atalho rápido para solicitar sua associação à família Jeep Club Tamoios.",
                side: "top",
                align: "center",
            },
        },
        {
            element: "#tour-home-help-btn",
            popover: {
                title: createStepHeader("Reveja Quando Quiser", ICONS.helpCircle),
                description: "Sempre que quiser consultar novamente esta apresentação da página inicial, clique em <strong>'Como funciona?'</strong> no topo.",
                side: "bottom",
                align: "end",
            },
        },
    ];
}

export const homeTourSteps = getHomeTourSteps();

// Tour geral do feed / layout principal
export const welcomeStep: DriveStep = {
    popover: {
        title: createStepHeader("Visão Geral da Plataforma", ICONS.compass),
        description: "Apresentamos as principais áreas de navegação e recursos do sistema Jeep Clube Tamoios.",
        side: "bottom",
        align: "center",
    },
};

export const sidebarStep: DriveStep = {
    element: "#tour-sidebar",
    popover: {
        title: createStepHeader("Navegação Principal", ICONS.sidebar),
        description: "Acesse rapidamente todas as seções e serviços disponíveis no sistema.",
        side: "right",
        align: "start",
    },
};

export const mobileMenuStep: DriveStep = {
    element: "#tour-mobile-menu-btn",
    popover: {
        title: createStepHeader("Menu de Navegação", ICONS.smartphone),
        description: "Toque para abrir a navegação lateral e acessar a Home, avisos e a gestão administrativa.",
        side: "bottom",
        align: "start",
    },
};

export const feedStep: DriveStep = {
    element: "#tour-nav-feed",
    popover: {
        title: createStepHeader("Home dos Associados", ICONS.feed),
        description: "Acompanhe comunicados oficiais, trilhas, notícias e avisos recentes do clube.",
        side: "right",
        align: "center",
    },
};

export const accountNavigationStep: DriveStep = {
    element: "#tour-manage-account-btn",
    popover: {
        title: createStepHeader("Gerenciar Conta", ICONS.user),
        description: "Acesse Conta pela navegação lateral para atualizar seus dados pessoais, veículos e ficha médica.",
        side: "right",
        align: "center",
    },
};

export const adminStep: DriveStep = {
    element: "#tour-admin-link",
    popover: {
        title: createStepHeader("Gestão Administrativa", ICONS.shield, "Admin"),
        description: "Acesso exclusivo da diretoria para governança e controle de cargos. Clique no link para acessar o painel agora ou avance para continuar o tour.",
        side: "right",
        align: "center",
    },
};

export const completionStep: DriveStep = {
    popover: {
        title: createStepHeader("Tour Concluído", ICONS.checkCircle),
        description: "Configuração concluída. Você pode rever este guia em Configurações, na opção Tutorial.",
        side: "bottom",
        align: "center",
    },
};

export function getTourSteps(
    canAccessAdmin: boolean,
    isMobile: boolean = false,
    setMobileMenuOpen?: (open: boolean) => void
): DriveStep[] {
    const steps: DriveStep[] = [welcomeStep];

    if (isMobile) {
        steps.push({
            ...mobileMenuStep,
            onDeselected: () => {
                setMobileMenuOpen?.(true);
            },
        });
    } else {
        steps.push(sidebarStep);
    }

    steps.push({
        ...feedStep,
        onHighlightStarted: () => {
            if (isMobile) setMobileMenuOpen?.(true);
        },
    });

    if (canAccessAdmin) {
        steps.push({
            ...adminStep,
            onHighlightStarted: () => {
                if (isMobile) setMobileMenuOpen?.(true);
            },
        });
    }

    steps.push({
        ...accountNavigationStep,
        onHighlightStarted: () => {
            if (isMobile) setMobileMenuOpen?.(true);
        },
    });

    steps.push({
        ...completionStep,
        onHighlightStarted: () => {
            if (isMobile) setMobileMenuOpen?.(false);
        },
    });

    return steps;
}

// Tour da tela de login
export function getLoginTourSteps(isMobile: boolean = false): DriveStep[] {
    return [
        {
            element: "#tour-login-card",
            popover: {
                title: createStepHeader("Autenticação Segura", ICONS.logIn),
                description: "Portal oficial de acesso para associados e diretoria do Jeep Clube Tamoios.",
                side: "bottom",
                align: "center",
            },
        },
        {
            element: "#tour-login-cpf",
            popover: {
                title: createStepHeader("Documento de Acesso", ICONS.idCard),
                description: "Informe o CPF cadastrado. A pontuação é formatada automaticamente no preenchimento.",
                side: isMobile ? "bottom" : "top",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-login-password",
            popover: {
                title: createStepHeader("Credencial de Senha", ICONS.key),
                description: "Insira sua senha de acesso. <strong>É sua primeira vez?</strong> Utilize a senha provisória enviada pelo administrador via WhatsApp e altere-a assim que possível.",
                side: isMobile ? "bottom" : "top",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-login-forgot",
            popover: {
                title: createStepHeader("Recuperação de Acesso", ICONS.helpCircle),
                description: "Solicite instruções de redefinição de senha diretamente no seu e-mail cadastrado.",
                side: "bottom",
                align: isMobile ? "center" : "end",
            },
        },
        {
            element: "#tour-login-join",
            popover: {
                title: createStepHeader("Novo Associado", ICONS.userPlus),
                description: "Quer ser sócio do Jeep Clube Tamoios? Clique em <strong>'Quero ser sócio'</strong> e preencha o formulário para a diretoria analisar seu pedido.",
                side: "top",
                align: "center",
            },
        },
    ];
}

export const loginTourSteps = getLoginTourSteps(false);

// Tour da tela de perfil (/profile)
export function getProfileTourSteps(isMobile: boolean = false): DriveStep[] {
    return [
        {
            element: "#tour-profile-header",
            popover: {
                title: createStepHeader("Gerenciamento de Conta", ICONS.user),
                description: "Aqui você gerencia todos os seus dados cadastrais, informações de saúde, veículos 4x4 e ferramentas de apoio.",
                side: "bottom",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-profile-tabs",
            popover: {
                title: createStepHeader("Seções do Perfil", ICONS.layers),
                description: "Navegue entre as abas para manter seu cadastro completo e atualizado junto ao clube.",
                side: "bottom",
                align: "center",
            },
        },
        {
            element: "#tour-profile-tab-personal",
            popover: {
                title: createStepHeader("Dados Pessoais", ICONS.idCard),
                description: "Visualize e atualize suas informações civis, e-mail, telefone e endereço de correspondência.",
                side: isMobile ? "bottom" : "top",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-profile-tab-medical",
            popover: {
                title: createStepHeader("Ficha Médica de Trilha", ICONS.heartPulse, "Saúde"),
                description: "Informações essenciais de segurança para expedições: tipo sanguíneo, alergias, medicamentos e contatos de emergência.",
                side: isMobile ? "bottom" : "top",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-profile-tab-dependents",
            popover: {
                title: createStepHeader("Dependentes", ICONS.users),
                description: "Cadastre seus dependentes familiares vinculados ao plano de associação do clube.",
                side: isMobile ? "bottom" : "top",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-profile-tab-vehicles",
            popover: {
                title: createStepHeader("Veículos e Jeeps 4x4", ICONS.car),
                description: "Cadastre seus veículos off-road autorizados para participar das trilhas, passeios e eventos oficiais.",
                side: isMobile ? "bottom" : "top",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-profile-tab-tools",
            popover: {
                title: createStepHeader("Ferramentas e Resgate", ICONS.wrench),
                description: "Declare os equipamentos de resgate disponíveis no seu veículo (guincho, cintas, prancha de desatolamento).",
                side: isMobile ? "bottom" : "top",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-profile-help-btn",
            popover: {
                title: createStepHeader("Ajuda Sempre à Mão", ICONS.helpCircle),
                description: "Você pode rever este guia do perfil a qualquer momento através deste botão no topo da tela.",
                side: "bottom",
                align: isMobile ? "center" : "end",
            },
        },
    ];
}

export const profileTourSteps = getProfileTourSteps(false);

// Tour do painel administrativo (/admin)
export function getAdminPanelTourSteps(isMobile: boolean = false): DriveStep[] {
    return [
        {
            element: "#tour-admin-header",
            popover: {
                title: createStepHeader("Central Administrativa", ICONS.shield, "Diretoria"),
                description: "Painel de controle principal com acesso a todos os módulos de gestão autorizados para o seu cargo.",
                side: "bottom",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-admin-search",
            popover: {
                title: createStepHeader("Busca Rápida de Módulos", ICONS.compass),
                description: "Digite o nome ou palavra-chave de uma área administrativa (como <strong>pagamentos</strong>, <strong>publicações</strong> ou <strong>veículos</strong>) para filtrar os cartões instantaneamente.",
                side: "bottom",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-admin-modules-grid",
            popover: {
                title: createStepHeader("Cartões de Módulos", ICONS.layers),
                description: "Cada cartão representa um módulo administrativo liberado para o seu perfil, exibindo sua finalidade e atalho direto.",
                side: isMobile ? "bottom" : "top",
                align: "center",
            },
        },
        {
            element: "#tour-admin-favorite-btn",
            popover: {
                title: createStepHeader("Módulos Favoritos", ICONS.checkCircle, "Atalho"),
                description: "Clique no ícone de <strong>estrela</strong> no canto superior de qualquer módulo para fixá-lo na seção <strong>Favoritos</strong> do menu lateral esquerdo.",
                side: "bottom",
                align: "end",
            },
        },
        {
            element: "#tour-admin-manage-btn",
            popover: {
                title: createStepHeader("Acessar Módulo", ICONS.sliders),
                description: "Clique em <strong>'Gerenciar'</strong> no cartão desejado para abrir as ferramentas completas daquele módulo.",
                side: isMobile ? "bottom" : "top",
                align: "center",
            },
        },
        {
            element: "#tour-admin-help-btn",
            popover: {
                title: createStepHeader("Ajuda Contextual", ICONS.helpCircle),
                description: "Este guia pode ser reaberto a qualquer momento por este botão ou clicando em <strong>'Precisa de ajuda?'</strong> no topo da página.",
                side: "bottom",
                align: isMobile ? "center" : "end",
            },
        },
    ];
}

export const adminPanelTourSteps = getAdminPanelTourSteps(false);

// Tour da tela de Gestão de Publicações (/admin/gestao-publicacoes)
export function getPublicationsTourSteps(isMobile: boolean = false): DriveStep[] {
    return [
        {
            element: "#tour-publications-header",
            popover: {
                title: createStepHeader("Gestão de Publicações", ICONS.feed, "Admin"),
                description: "Nesta área administrativa você cria, revisa, publica, edita e arquiva os <strong>eventos</strong>, <strong>avisos</strong> e <strong>serviços</strong> divulgados no mural do clube.",
                side: "bottom",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-publications-types",
            popover: {
                title: createStepHeader("Filtro por Tipo de Publicação", ICONS.layers),
                description: "Alterne entre <strong>Todos</strong>, <strong>Serviços</strong>, <strong>Avisos</strong> e <strong>Eventos</strong> para focar na categoria que deseja administrar.",
                side: "bottom",
                align: "center",
            },
        },
        {
            element: "#tour-publications-create-btn",
            popover: {
                title: createStepHeader("Criar Publicação", ICONS.plus),
                description: "Clique em <strong>'Criar publicação'</strong> para abrir o formulário de cadastro de novos avisos, eventos oficiais (com datas, vagas e cobranças) ou anúncios de serviços.",
                side: "bottom",
                align: isMobile ? "center" : "end",
            },
        },
        {
            element: "#tour-publications-status",
            popover: {
                title: createStepHeader("Estado da Publicação", ICONS.sliders),
                description: "Filtre os registros pelo estágio editorial: visualize <strong>Todos</strong>, apenas os já <strong>Publicados</strong> no mural, os <strong>Rascunhos</strong> em preparação ou os <strong>Arquivados</strong>.",
                side: "bottom",
                align: "center",
            },
        },
        {
            element: "#publication-status-results",
            popover: {
                title: createStepHeader("Listagem e Ações Editoriais", ICONS.checkCircle),
                description: "Cada card exibe o tipo, o status e os botões de ação rápida conforme o estado do item: <strong>Editar</strong>, <strong>Publicar</strong>, <strong>Arquivar</strong>, <strong>Encerrar</strong>, <strong>Cancelar</strong> ou <strong>Excluir</strong>.",
                side: isMobile ? "bottom" : "top",
                align: "center",
            },
        },
        {
            element: "#tour-header-help-btn",
            popover: {
                title: createStepHeader("Precisa de Ajuda?", ICONS.helpCircle),
                description: "Sempre que quiser rever como gerenciar as publicações do clube, clique em <strong>'Precisa de ajuda?'</strong> no cabeçalho.",
                side: "bottom",
                align: "center",
            },
        },
    ];
}

export const publicationsTourSteps = getPublicationsTourSteps(false);

// Tour da tela de cargos e permissões (/admin/roles-permissoes)
export function getRolesTourSteps(isMobile: boolean = false): DriveStep[] {
    return [
        {
            element: "#tour-roles-header",
            popover: {
                title: createStepHeader("Controle de Cargos e Acessos", ICONS.shield, "RBAC"),
                description: "Administração central de papéis e níveis de autorização do sistema.",
                side: "bottom",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-roles-tabs",
            popover: {
                title: createStepHeader("Áreas de Governança", ICONS.layers),
                description: "Alterne entre <strong>Cargos do sistema</strong>, o catálogo de <strong>Permissões</strong> por módulo e as <strong>Atribuições de usuários</strong>.",
                side: "bottom",
                align: "center",
            },
        },
        {
            element: "#tour-create-role-btn",
            popover: {
                title: createStepHeader("Cadastrar Cargo", ICONS.plus),
                description: "Defina a nomenclatura e atribua as permissões específicas para o novo perfil.",
                side: "bottom",
                align: isMobile ? "center" : "end",
            },
        },
        {
            element: "#tour-roles-table",
            popover: {
                title: createStepHeader("Cargos Cadastrados", ICONS.layers),
                description: "Relação de cargos ativos e inativos com visualização rápida das permissões vinculadas.",
                side: isMobile ? "bottom" : "top",
                align: "center",
            },
        },
        {
            element: "#tour-role-actions",
            popover: {
                title: createStepHeader("Ações e Permissões Granulares", ICONS.sliders),
                description: "Controle pontual: atribuição de permissões por módulo, edição, ativação/desativação e exclusão.",
                side: isMobile ? "top" : "left",
                align: "center",
            },
        },
        {
            element: "#tour-roles-help-btn",
            popover: {
                title: createStepHeader("Guia da Tela", ICONS.helpCircle),
                description: "Clique neste botão sempre que precisar rever as orientações desta tela.",
                side: "bottom",
                align: isMobile ? "center" : "end",
            },
        },
    ];
}

export const rolesTourSteps = getRolesTourSteps(false);

// Tour da tela de Gestão de Usuários (/admin/users)
export function getUsersTourSteps(isMobile: boolean = false): DriveStep[] {
    return [
        {
            element: "#tour-users-header",
            popover: {
                title: createStepHeader("Gestão de Usuários", ICONS.users, "Admin"),
                description: "Consulte o quadro completo de associados e administradores, cadastre novos usuários e controle o status de acesso ao sistema.",
                side: "bottom",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-users-tabs",
            popover: {
                title: createStepHeader("Usuários e Solicitações", ICONS.layers),
                description: "Alterne rapidamente entre a lista de <strong>Usuários</strong> cadastrados e a aba de <strong>Solicitações de associação</strong> enviadas por novos candidatos.",
                side: "bottom",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-users-search",
            popover: {
                title: createStepHeader("Busca por Critério", ICONS.compass),
                description: "Pesquise associados utilizando busca <strong>Geral</strong>, <strong>Nome</strong>, <strong>CPF</strong>, <strong>E-mail</strong> ou <strong>Telefone</strong> através do seletor ao lado do campo.",
                side: "bottom",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-users-status-filter",
            popover: {
                title: createStepHeader("Filtro por Status", ICONS.sliders),
                description: "Filtre a listagem entre usuários <strong>Ativos</strong>, <strong>Desativados</strong> ou visualize <strong>Todos os status</strong>.",
                side: "bottom",
                align: isMobile ? "center" : "end",
            },
        },
        {
            element: "#tour-users-create-btn",
            popover: {
                title: createStepHeader("Cadastrar Novo Usuário", ICONS.userPlus),
                description: "Clique em <strong>'Novo usuário'</strong> para cadastrar manualmente um associado ou membro da diretoria no sistema.",
                side: "bottom",
                align: isMobile ? "center" : "end",
            },
        },
        {
            element: "#tour-users-table",
            popover: {
                title: createStepHeader("Tabela de Associados e Ações", ICONS.idCard),
                description: "Ordene as colunas por nome, e-mail, CPF ou telefone e utilize os botões de ação à direita para <strong>Ver detalhes</strong> do perfil ou <strong>Desativar/Reativar</strong> a conta.",
                side: isMobile ? "bottom" : "top",
                align: "center",
            },
        },
        {
            element: "#tour-header-help-btn",
            popover: {
                title: createStepHeader("Precisa de Ajuda?", ICONS.helpCircle),
                description: "Reabra este guia a qualquer momento clicando em <strong>'Precisa de ajuda?'</strong> no cabeçalho.",
                side: "bottom",
                align: "center",
            },
        },
    ];
}

export const usersTourSteps = getUsersTourSteps(false);

// Tour da aba de Solicitações de Associação (/admin/users?tab=applications)
export function getMembershipApplicationsTourSteps(isMobile: boolean = false): DriveStep[] {
    return [
        {
            element: "#tour-users-header",
            popover: {
                title: createStepHeader("Solicitações de Associação", ICONS.userPlus, "Adesão"),
                description: "Analise os pedidos de entrada no Jeep Clube Tamoios enviados através do formulário público de associação.",
                side: "bottom",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-users-tabs",
            popover: {
                title: createStepHeader("Alternância de Abas", ICONS.layers),
                description: "Você está na aba de <strong>Solicitações de associação</strong>. Quando desejar consultar os membros já ativos, basta clicar na aba <strong>Usuários</strong>.",
                side: "bottom",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-applications-status-filter",
            popover: {
                title: createStepHeader("Status das Solicitações", ICONS.sliders),
                description: "Filtre os pedidos entre <strong>Pendentes</strong> de análise, <strong>Aprovadas</strong>, <strong>Rejeitadas</strong>, <strong>Concluídas</strong> ou veja todo o histórico.",
                side: "bottom",
                align: isMobile ? "center" : "end",
            },
        },
        {
            element: "#tour-applications-list",
            popover: {
                title: createStepHeader("Ficha e Carta de Apresentação", ICONS.idCard),
                description: "Cada card exibe CPF, celular com atalho para WhatsApp, e-mail, data de envio e a <strong>Carta de apresentação</strong> redigida pelo candidato.",
                side: isMobile ? "bottom" : "top",
                align: "center",
            },
        },
        {
            element: "#tour-applications-actions",
            popover: {
                title: createStepHeader("Aprovação ou Recusa", ICONS.checkCircle),
                description: "Nas propostas pendentes, você pode <strong>Aprovar e gerar senha</strong> (com envio via WhatsApp), <strong>Aprovar e enviar convite</strong> por e-mail, <strong>Rejeitar</strong> ou <strong>Bloquear o CPF</strong>.",
                side: isMobile ? "bottom" : "top",
                align: "center",
            },
        },
        {
            element: "#tour-header-help-btn",
            popover: {
                title: createStepHeader("Precisa de Ajuda?", ICONS.helpCircle),
                description: "Sempre que quiser revisar o fluxo de aprovação de novos sócios, clique em <strong>'Precisa de ajuda?'</strong> no cabeçalho.",
                side: "bottom",
                align: "center",
            },
        },
    ];
}

export const membershipApplicationsTourSteps = getMembershipApplicationsTourSteps(false);

// Tour da tela de Análise de Pagamentos (/admin/pagamentos)
export function getPaymentsTourSteps(isMobile: boolean = false): DriveStep[] {
    return [
        {
            element: "#tour-payments-header",
            popover: {
                title: createStepHeader("Análise de Pagamentos", ICONS.wallet, "Financeiro"),
                description: "Central de auditoria de comprovantes enviados pelos associados para quitação de mensalidades, taxas de eventos e cobranças.",
                side: "bottom",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-payments-filters",
            popover: {
                title: createStepHeader("Filtro por Status e Atualização", ICONS.sliders),
                description: "Filtre os pagamentos por situação (como <strong>Pendente de validação</strong>, <strong>Confirmado</strong> ou <strong>Rejeitado</strong>) e utilize o botão <strong>Atualizar</strong> para sincronizar a fila.",
                side: "bottom",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-payments-table",
            popover: {
                title: createStepHeader("Pagamentos Enviados", ICONS.layers),
                description: "Confira o código do pagamento, a cobrança associada, o valor, o método utilizado, a data de pagamento e o status atual.",
                side: isMobile ? "bottom" : "top",
                align: "center",
            },
        },
        {
            element: "#tour-payments-detail-btn",
            popover: {
                title: createStepHeader("Conferir Comprovante ('Detalhes')", ICONS.checkCircle),
                description: "Clique em <strong>'Detalhes'</strong> na linha do pagamento para visualizar o comprovante anexado e confirmar ou rejeitar a operação.",
                side: isMobile ? "top" : "left",
                align: "center",
            },
        },
        {
            element: "#tour-header-help-btn",
            popover: {
                title: createStepHeader("Precisa de Ajuda?", ICONS.helpCircle),
                description: "Reabra este guia a qualquer momento clicando em <strong>'Precisa de ajuda?'</strong> no cabeçalho.",
                side: "bottom",
                align: "center",
            },
        },
    ];
}

export const paymentsTourSteps = getPaymentsTourSteps(false);

// Tour da tela de Gestão Financeira (/admin/gestao-financeira)
export function getFinancialTourSteps(isMobile: boolean = false): DriveStep[] {
    return [
        {
            element: "#tour-financial-header",
            popover: {
                title: createStepHeader("Gestão Financeira", ICONS.wallet, "Tesouraria"),
                description: "Administração completa das finanças do clube: regras de cobrança, ciclos, faturas de membros, pagamentos e solicitações de reembolso.",
                side: "bottom",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-financial-tabs",
            popover: {
                title: createStepHeader("Áreas Financeiras", ICONS.layers),
                description: "Navegue entre o <strong>Dashboard</strong> resumido, <strong>Definições e atribuições</strong>, <strong>Ciclos</strong>, <strong>Cobranças</strong>, <strong>Pagamentos</strong> e <strong>Reembolsos</strong>.",
                side: "bottom",
                align: "center",
            },
        },
        {
            element: "#tour-financial-content",
            popover: {
                title: createStepHeader("Painel e Operações da Área", ICONS.sliders),
                description: "No <strong>Dashboard</strong> você acompanha os indicadores com atalhos diretos; nas demais abas você cria regras de cobrança, gera ciclos, exporta relatórios CSV/PDF e gerencia faturas ou reembolsos.",
                side: isMobile ? "bottom" : "top",
                align: "center",
            },
        },
        {
            element: "#tour-header-help-btn",
            popover: {
                title: createStepHeader("Precisa de Ajuda?", ICONS.helpCircle),
                description: "Sempre que quiser revisar como operar as áreas financeiras, clique em <strong>'Precisa de ajuda?'</strong> no cabeçalho.",
                side: "bottom",
                align: "center",
            },
        },
    ];
}

export const financialTourSteps = getFinancialTourSteps(false);

// Tour da tela de Gestão de Dados Médicos (/admin/dados-medicos)
export function getMedicalProfilesTourSteps(isMobile: boolean = false): DriveStep[] {
    return [
        {
            element: "#tour-medical-header",
            popover: {
                title: createStepHeader("Gestão de Dados Médicos", ICONS.heartPulse, "Saúde"),
                description: "Consulte, cadastre e mantenha atualizadas as fichas médicas de associados e dependentes para segurança nas expedições e trilhas.",
                side: "bottom",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-medical-export",
            popover: {
                title: createStepHeader("Exportação CSV/PDF e Histórico", ICONS.layers),
                description: "Exporte os dados médicos em <strong>CSV</strong> ou <strong>PDF</strong> para apoio em trilhas e marque <strong>Histórico de exclusões</strong> quando precisar auditar registros removidos.",
                side: "bottom",
                align: isMobile ? "center" : "end",
            },
        },
        {
            element: "#tour-medical-create-btn",
            popover: {
                title: createStepHeader("Cadastrar Perfil Médico", ICONS.plus),
                description: "Clique em <strong>'Cadastrar perfil'</strong> para registrar a ficha médica de um associado ou dependente.",
                side: "bottom",
                align: isMobile ? "center" : "end",
            },
        },
        {
            element: "#tour-medical-table",
            popover: {
                title: createStepHeader("Perfis Cadastrados e Ações", ICONS.idCard),
                description: "Consulte o titular e a data de atualização e utilize os botões <strong>Visualizar</strong> (com opção de exportar ficha individual), <strong>Editar</strong> ou <strong>Excluir</strong>.",
                side: isMobile ? "bottom" : "top",
                align: "center",
            },
        },
        {
            element: "#tour-header-help-btn",
            popover: {
                title: createStepHeader("Precisa de Ajuda?", ICONS.helpCircle),
                description: "Reabra este guia a qualquer momento clicando em <strong>'Precisa de ajuda?'</strong> no cabeçalho.",
                side: "bottom",
                align: "center",
            },
        },
    ];
}

export const medicalProfilesTourSteps = getMedicalProfilesTourSteps(false);

// Tour da tela de Gestão de Veículos (/admin/veiculos)
export function getVehiclesTourSteps(isMobile: boolean = false): DriveStep[] {
    return [
        {
            element: "#tour-vehicles-header",
            popover: {
                title: createStepHeader("Gestão de Veículos 4x4", ICONS.car, "Frota"),
                description: "Visualize, cadastre e administre os veículos off-road vinculados aos membros do Jeep Clube Tamoios.",
                side: "bottom",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-vehicles-create-btn",
            popover: {
                title: createStepHeader("Cadastrar Veículo", ICONS.plus),
                description: "Clique em <strong>'Cadastrar veículo'</strong> para registrar um novo 4x4 informando proprietário, modelo, apelido, placa, ano e fotos.",
                side: "bottom",
                align: isMobile ? "center" : "end",
            },
        },
        {
            element: "#tour-vehicles-list",
            popover: {
                title: createStepHeader("Lista da Frota do Clube", ICONS.layers),
                description: "Acompanhe os veículos cadastrados com galeria de fotos, apelido, modelo, placa e associado proprietário.",
                side: isMobile ? "bottom" : "top",
                align: "center",
            },
        },
        {
            element: "#tour-vehicles-actions",
            popover: {
                title: createStepHeader("Ações sobre o Veículo", ICONS.sliders),
                description: "Utilize os botões <strong>Visualizar</strong>, <strong>Editar</strong> ou <strong>Excluir</strong> para consultar todos os detalhes técnicos ou atualizar o registro.",
                side: isMobile ? "top" : "left",
                align: "center",
            },
        },
        {
            element: "#tour-header-help-btn",
            popover: {
                title: createStepHeader("Precisa de Ajuda?", ICONS.helpCircle),
                description: "Sempre que quiser revisar como administrar a frota do clube, clique em <strong>'Precisa de ajuda?'</strong> no cabeçalho.",
                side: "bottom",
                align: "center",
            },
        },
    ];
}

export const vehiclesTourSteps = getVehiclesTourSteps(false);

// Tour da tela de Gestão de Ferramentas (/admin/ferramentas)
export function getToolsTourSteps(isMobile: boolean = false): DriveStep[] {
    return [
        {
            element: "#tour-tools-header",
            popover: {
                title: createStepHeader("Gestão de Ferramentas", ICONS.wrench, "Resgate"),
                description: "Consulte, cadastre e gerencie os equipamentos de apoio e ferramentas declarados pelos associados do clube.",
                side: "bottom",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-tools-create-btn",
            popover: {
                title: createStepHeader("Cadastrar Ferramenta", ICONS.plus),
                description: "Clique em <strong>'Cadastrar ferramenta'</strong> para vincular um novo equipamento de resgate ou apoio a um associado.",
                side: "bottom",
                align: isMobile ? "center" : "end",
            },
        },
        {
            element: "#tour-tools-filters",
            popover: {
                title: createStepHeader("Busca por Nome e Status", ICONS.compass),
                description: "Pesquise ferramentas pelo nome em tempo real ou filtre por situação (<strong>Ativas</strong>, <strong>Inativas</strong> ou <strong>Arquivadas</strong>).",
                side: "bottom",
                align: "center",
            },
        },
        {
            element: "#tour-tools-list",
            popover: {
                title: createStepHeader("Catálogo de Equipamentos", ICONS.layers),
                description: "Confira a foto, nome da ferramenta, ID do associado responsável e o status atual de disponibilidade.",
                side: isMobile ? "bottom" : "top",
                align: "center",
            },
        },
        {
            element: "#tour-tools-actions",
            popover: {
                title: createStepHeader("Ações da Ferramenta", ICONS.sliders),
                description: "Utilize os controles para <strong>Visualizar</strong> detalhes, <strong>Editar</strong> dados, <strong>Ativar/Desativar</strong> ou <strong>Excluir</strong> o equipamento.",
                side: isMobile ? "top" : "left",
                align: "center",
            },
        },
        {
            element: "#tour-header-help-btn",
            popover: {
                title: createStepHeader("Precisa de Ajuda?", ICONS.helpCircle),
                description: "Reabra este guia a qualquer momento clicando em <strong>'Precisa de ajuda?'</strong> no cabeçalho.",
                side: "bottom",
                align: "center",
            },
        },
    ];
}

export const toolsTourSteps = getToolsTourSteps(false);

// Tour da tela de Gestão de Dependentes (/admin/dependentes)
export function getDependentsTourSteps(isMobile: boolean = false): DriveStep[] {
    return [
        {
            element: "#tour-dependents-header",
            popover: {
                title: createStepHeader("Gestão de Dependentes", ICONS.users, "Associados"),
                description: "Consulte, audite fotos privadas 3x4, exporte relatórios e gerencie o ciclo de vida dos dependentes vinculados aos associados.",
                side: "bottom",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-dependents-export",
            popover: {
                title: createStepHeader("Exportação e Histórico", ICONS.layers),
                description: "Exporte a listagem em <strong>CSV</strong> ou <strong>PDF</strong> institucional, incluindo opcionalmente o histórico de exclusões.",
                side: "bottom",
                align: isMobile ? "center" : "end",
            },
        },
        {
            element: "#tour-dependents-filters",
            popover: {
                title: createStepHeader("Busca e Filtros Combinados", ICONS.compass),
                description: "Pesquise por nome do dependente, nome do titular, CPF ou telefone, e refine por grau de parentesco ou status operacional.",
                side: "bottom",
                align: "center",
            },
        },
        {
            element: "#tour-dependents-list",
            popover: {
                title: createStepHeader("Cadastro de Dependentes", ICONS.users),
                description: "Confira a foto privada 3x4, CPF, data de nascimento, parentesco, titular vinculado e situação atual.",
                side: isMobile ? "bottom" : "top",
                align: "center",
            },
        },
        {
            element: "#tour-dependents-actions",
            popover: {
                title: createStepHeader("Ações Administrativas", ICONS.sliders),
                description: "Visualize a ficha completa (incluindo foto e perfil médico), ative/inative, arquive/desarquive ou exclua o dependente conforme suas permissões.",
                side: isMobile ? "top" : "left",
                align: "center",
            },
        },
        {
            element: "#tour-header-help-btn",
            popover: {
                title: createStepHeader("Precisa de Ajuda?", ICONS.helpCircle),
                description: "Reabra este guia a qualquer momento clicando no botão de ajuda no cabeçalho.",
                side: "bottom",
                align: "center",
            },
        },
    ];
}

export const dependentsTourSteps = getDependentsTourSteps(false);

// Tour da Agenda de Eventos (/agenda)
export function getAgendaTourSteps(isMobile: boolean = false): DriveStep[] {
    return [
        {
            element: "#tour-agenda-header",
            popover: {
                title: createStepHeader("Agenda de Eventos", ICONS.calendar, "Membro"),
                description: "Acompanhe todas as trilhas, expedições, encontros e aniversariantes do mês no calendário oficial do clube.",
                side: "bottom",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-agenda-controls",
            popover: {
                title: createStepHeader("Navegação por Mês", ICONS.sliders),
                description: "Use as setas para avançar ou voltar entre os meses e clique em <strong>'Hoje'</strong> para retornar rapidamente ao mês atual.",
                side: "bottom",
                align: isMobile ? "center" : "end",
            },
        },
        {
            element: "#tour-agenda-calendar",
            popover: {
                title: createStepHeader("Calendário Mensal", ICONS.layers),
                description: "Os dias com eventos ou aniversariantes ficam destacados. Clique em qualquer dia marcado para abrir o resumo do evento e confirmar sua participação.",
                side: isMobile ? "bottom" : "top",
                align: "center",
            },
        },
        {
            element: "#tour-header-help-btn",
            popover: {
                title: createStepHeader("Como usar a Agenda?", ICONS.helpCircle),
                description: "Sempre que quiser rever como funciona o calendário de eventos, clique neste botão de ajuda no topo.",
                side: "bottom",
                align: isMobile ? "center" : "end",
            },
        },
    ];
}

export const agendaTourSteps = getAgendaTourSteps(false);

// Tour do Histórico Financeiro do Associado (/financeiro)
export function getMemberFinancialTourSteps(isMobile: boolean = false): DriveStep[] {
    return [
        {
            element: "#tour-member-financial-header",
            popover: {
                title: createStepHeader("Histórico Financeiro", ICONS.wallet, "Membro"),
                description: "Consulte todas as mensalidades, taxas de eventos e cobranças vinculadas ao seu cadastro de associado.",
                side: "bottom",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-member-financial-filters",
            popover: {
                title: createStepHeader("Filtros e Ordenação", ICONS.sliders),
                description: "Filtre suas cobranças por situação (<strong>Em aberto</strong>, <strong>Paga</strong> ou <strong>Cancelada</strong>) e ordene pelas datas de vencimento mais recentes ou mais antigas.",
                side: "bottom",
                align: "center",
            },
        },
        {
            element: "#tour-member-financial-list",
            popover: {
                title: createStepHeader("Lançamentos e Vencimentos", ICONS.layers),
                description: "Confira o código da cobrança, o ciclo correspondente, a data de vencimento, o valor final e o status atualizado.",
                side: isMobile ? "bottom" : "top",
                align: "center",
            },
        },
        {
            element: "#tour-header-help-btn",
            popover: {
                title: createStepHeader("Ajuda com o Financeiro", ICONS.helpCircle),
                description: "Clique neste botão sempre que precisar revisar como consultar suas mensalidades e cobranças.",
                side: "bottom",
                align: isMobile ? "center" : "end",
            },
        },
    ];
}

export const memberFinancialTourSteps = getMemberFinancialTourSteps(false);

// Tour da página de Serviços da Comunidade (/servicos)
export function getServicesPageTourSteps(isMobile: boolean = false): DriveStep[] {
    return [
        {
            element: "#tour-services-header",
            popover: {
                title: createStepHeader("Serviços da Comunidade", ICONS.store, "Membro"),
                description: "Encontre produtos, oficinas e serviços divulgados por associados e parceiros do Jeep Clube Tamoios.",
                side: "bottom",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-services-list",
            popover: {
                title: createStepHeader("Catálogo e Contato Direto", ICONS.layers),
                description: "Veja fotos, faixa de valor e descrição de cada anúncio. Clique em <strong>'Ver detalhes'</strong> para abrir a publicação completa ou em <strong>'Contato'</strong> para chamar diretamente no WhatsApp.",
                side: isMobile ? "bottom" : "top",
                align: "center",
            },
        },
        {
            element: "#tour-header-help-btn",
            popover: {
                title: createStepHeader("Ajuda com Serviços", ICONS.helpCircle),
                description: "Reabra este guia rápido a qualquer momento clicando no botão de ajuda no cabeçalho.",
                side: "bottom",
                align: isMobile ? "center" : "end",
            },
        },
    ];
}

export const servicesPageTourSteps = getServicesPageTourSteps(false);

// Tour da página de Configurações (/configuracoes)
export function getSettingsTourSteps(isMobile: boolean = false): DriveStep[] {
    return [
        {
            element: "#tour-settings-header",
            popover: {
                title: createStepHeader("Configurações da Conta", ICONS.settings, "Ajustes"),
                description: "Personalize sua experiência no sistema, gerencie sua senha, privacidade, notificações e aparência.",
                side: "bottom",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-settings-sections",
            popover: {
                title: createStepHeader("Categorias de Configuração", ICONS.layers),
                description: "Navegue entre <strong>Conta e segurança</strong>, <strong>Sua atividade</strong>, <strong>Notificações</strong>, <strong>Privacidade</strong>, <strong>Preferências</strong> (tema claro/escuro) e <strong>Ajuda</strong>.",
                side: isMobile ? "bottom" : "right",
                align: "start",
            },
        },
        {
            element: "#tour-settings-panel",
            popover: {
                title: createStepHeader("Opções e Ajustes", ICONS.sliders),
                description: "Escolha a opção desejada para alterar sua senha, alternar entre modo claro e escuro ou reiniciar os tutoriais da plataforma.",
                side: isMobile ? "bottom" : "top",
                align: "center",
            },
        },
        {
            element: "#tour-header-help-btn",
            popover: {
                title: createStepHeader("Precisa de Ajuda?", ICONS.helpCircle),
                description: "Clique neste botão no topo sempre que quiser rever como funcionam as configurações.",
                side: "bottom",
                align: isMobile ? "center" : "end",
            },
        },
    ];
}

export const settingsTourSteps = getSettingsTourSteps(false);

// Tour de alteração de senha em Configurações (/configuracoes?option=password)
export function getChangePasswordTourSteps(isMobile: boolean = false): DriveStep[] {
    if (isMobile) {
        return [
            {
                element: "#tour-settings-change-password-btn",
                popover: {
                    title: createStepHeader("Alterar Senha", ICONS.key, "Segurança"),
                    description: "Toque em <strong>'Alterar minha senha'</strong>, informe sua senha atual e defina uma nova senha com pelo menos 8 caracteres.",
                    side: "bottom",
                    align: "center",
                },
            },
            {
                element: "#tour-header-help-btn",
                popover: {
                    title: createStepHeader("Precisa de Ajuda?", ICONS.helpCircle),
                    description: "Clique aqui sempre que quiser rever os passos para atualizar sua senha.",
                    side: "bottom",
                    align: "center",
                },
            },
        ];
    }

    return [
        {
            element: "#tour-settings-section-account",
            popover: {
                title: createStepHeader("Conta e Segurança", ICONS.shield),
                description: "Em <strong>Configurações</strong>, selecione a categoria <strong>'Conta e segurança'</strong> no menu lateral.",
                side: "right",
                align: "start",
            },
        },
        {
            element: "#tour-settings-option-password",
            popover: {
                title: createStepHeader("Opção Senha", ICONS.key),
                description: "Na coluna de opções, clique em <strong>'Senha'</strong> para abrir as recomendações de segurança.",
                side: "right",
                align: "start",
            },
        },
        {
            element: "#tour-settings-change-password-btn",
            popover: {
                title: createStepHeader("Alterar Minha Senha", ICONS.checkCircle),
                description: "Clique em <strong>'Alterar minha senha'</strong>, informe sua senha atual e digite a nova senha com pelo menos 8 caracteres.",
                side: "top",
                align: "start",
            },
        },
    ];
}

// Tour do formulário público Quero ser Sócio (/membership/apply)
export function getMembershipApplyTourSteps(isMobile: boolean = false): DriveStep[] {
    return [
        {
            element: "#tour-apply-card",
            popover: {
                title: createStepHeader("Solicitação de Associação", ICONS.userPlus, "Novo Sócio"),
                description: "Preencha este formulário para enviar seu pedido de entrada ao Jeep Clube Tamoios para análise da diretoria.",
                side: "bottom",
                align: "center",
            },
        },
        {
            element: "#tour-apply-personal",
            popover: {
                title: createStepHeader("Identificação e Contato", ICONS.idCard),
                description: "Informe seu <strong>Nome completo</strong>, <strong>CPF</strong>, <strong>Celular com DDD</strong> (para retorno via WhatsApp) e e-mail opcional.",
                side: isMobile ? "bottom" : "top",
                align: "center",
            },
        },
        {
            element: "#tour-apply-message",
            popover: {
                title: createStepHeader("Carta de Apresentação", ICONS.feed),
                description: "Conte um pouco sobre você, sua experiência ou interesse no off-road e por que deseja fazer parte do clube.",
                side: isMobile ? "bottom" : "top",
                align: "center",
            },
        },
        {
            element: "#tour-apply-submit",
            popover: {
                title: createStepHeader("Enviar para Análise", ICONS.checkCircle),
                description: "Clique em <strong>'Enviar solicitação'</strong>. A diretoria avaliará seu pedido e entrará em contato com as instruções de acesso.",
                side: "top",
                align: "center",
            },
        },
    ];
}

export const membershipApplyTourSteps = getMembershipApplyTourSteps(false);

// Tour da tela de Recuperação de Senha (/forgot-password)
export function getForgotPasswordTourSteps(isMobile: boolean = false): DriveStep[] {
    return [
        {
            element: "#tour-forgot-card",
            popover: {
                title: createStepHeader("Recuperação de Senha", ICONS.key),
                description: "Esqueceu sua senha? Solicite um código de verificação para redefinir seu acesso com segurança.",
                side: "bottom",
                align: "center",
            },
        },
        {
            element: "#tour-forgot-cpf",
            popover: {
                title: createStepHeader("Informe seu CPF", ICONS.idCard),
                description: "Digite o CPF cadastrado na sua conta do clube e clique em <strong>'Enviar'</strong> para receber o código por e-mail.",
                side: isMobile ? "bottom" : "top",
                align: "center",
            },
        },
        {
            element: "#tour-forgot-back",
            popover: {
                title: createStepHeader("Voltar ao Login", ICONS.logIn),
                description: "Lembrou sua senha? Clique aqui para retornar imediatamente à tela de entrada.",
                side: "top",
                align: "center",
            },
        },
    ];
}

export const forgotPasswordTourSteps = getForgotPasswordTourSteps(false);

// Tour da Central de Tutoriais (/tutoriais)
export function getTutorialsPageTourSteps(isMobile: boolean = false): DriveStep[] {
    return [
        {
            element: "#tour-tutorials-header",
            popover: {
                title: createStepHeader("Central de Tutoriais", ICONS.helpCircle, "Ajuda"),
                description: "Bem-vindo à Central de Tutoriais do Jeep Clube Tamoios! Aqui você encontra guias interativos passo a passo para todas as funcionalidades do sistema.",
                side: "bottom",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: "#tour-tutorials-search",
            popover: {
                title: createStepHeader("Pesquise sua Dúvida", ICONS.compass),
                description: "Digite sua dúvida ou o que deseja fazer (ex.: <strong>'como cadastrar veículo'</strong>, <strong>'ficha médica'</strong>, <strong>'carteirinha'</strong>) para filtrar a lista.",
                side: "bottom",
                align: "center",
            },
        },
        {
            element: "#tour-tutorials-results",
            popover: {
                title: createStepHeader("Resultados e Guias Ilustrados", ICONS.checkCircle),
                description: "Os tutoriais disponíveis para você aparecem em formato de lista logo abaixo, com a quantidade de passos e status de conclusão.",
                side: isMobile ? "bottom" : "top",
                align: "center",
            },
        },
        {
            element: "#tour-tutorials-start-btn",
            popover: {
                title: createStepHeader("Abrir Tutorial Passo a Passo", ICONS.sliders),
                description: "Clique em <strong>'Ver tutorial'</strong> (ou <strong>'Iniciar tutorial'</strong>) em qualquer card para visualizar o passo a passo ilustrado com imagens ou iniciar o tour na tela.",
                side: isMobile ? "bottom" : "left",
                align: "center",
            },
        },
        {
            element: "#tour-header-help-btn",
            popover: {
                title: createStepHeader("Botão de Ajuda no Cabeçalho", ICONS.helpCircle),
                description: "Lembre-se: quando já estiver em qualquer página do sistema, basta clicar no botão vermelho de <strong>ajuda</strong> no cabeçalho (ele muda conforme a tela atual) para iniciar o tutorial na hora!",
                side: "bottom",
                align: "center",
            },
        },
    ];
}

export const tutorialsPageTourSteps = getTutorialsPageTourSteps(false);

// Tour específico da Home dos Associados / Mural do Clube (/feed)
export function getFeedTourSteps(isMobile: boolean = false): DriveStep[] {
    return [
        {
            element: "#tour-feed-filters",
            popover: {
                title: createStepHeader("Filtros do Mural", ICONS.feed, "Home"),
                description: "Alterne rapidamente entre <strong>Tudo</strong>, <strong>Serviços</strong>, <strong>Avisos</strong> oficiais da diretoria e <strong>Eventos</strong> do clube.",
                side: "bottom",
                align: isMobile ? "center" : "start",
            },
        },
        {
            element: isMobile ? "#tour-feed-create-mobile-btn" : "#tour-feed-create-btn",
            popover: {
                title: createStepHeader("Nova Publicação ou Serviço", ICONS.plus),
                description: "Utilize o botão <strong>'Postar'</strong> para criar uma nova publicação ou solicitar a divulgação de um serviço para a comunidade, conforme suas permissões.",
                side: "bottom",
                align: "end",
            },
        },
        {
            element: "#tour-feed-list",
            popover: {
                title: createStepHeader("Mural de Publicações e Eventos", ICONS.layers),
                description: "Confira os comunicados, serviços e próximos eventos. Clique em qualquer card para ver detalhes completos, curtir, comentar, compartilhar no WhatsApp ou se inscrever em eventos.",
                side: isMobile ? "bottom" : "top",
                align: "center",
            },
        },
        {
            element: "#tour-feed-sidebar",
            popover: {
                title: createStepHeader("Destaques da Comunidade", ICONS.compass),
                description: "No painel lateral você acompanha os <strong>Próximos eventos</strong>, os <strong>Aniversariantes do mês</strong> e os <strong>Avisos recentes</strong>.",
                side: isMobile ? "top" : "left",
                align: "start",
            },
        },
        {
            element: isMobile ? "#tour-mobile-menu-btn" : "#tour-sidebar",
            popover: {
                title: createStepHeader("Navegação Principal", isMobile ? ICONS.smartphone : ICONS.sidebar),
                description: "Pelo menu principal você alterna entre a Home, a Agenda, a Central de Tutoriais e, caso faça parte da diretoria, a Gestão Administrativa.",
                side: isMobile ? "bottom" : "right",
                align: "start",
            },
        },
        {
            element: "#tour-avatar-container",
            popover: {
                title: createStepHeader("Perfil e Conta", ICONS.user),
                description: "Clique no seu avatar para abrir a conta e gerenciar seus dados pessoais, ficha médica, veículos 4x4, ferramentas e histórico financeiro.",
                side: "bottom",
                align: isMobile ? "center" : "end",
            },
        },
        {
            element: "#tour-header-help-btn",
            popover: {
                title: createStepHeader("Ajuda Contextual Dinâmica", ICONS.helpCircle),
                description: "Sempre que estiver em qualquer página e precisar de orientação, clique em <strong>'Precisa de ajuda?'</strong> no cabeçalho para iniciar o tutorial específico da tela atual.",
                side: "bottom",
                align: "center",
            },
        },
    ];
}

export const feedTourSteps = getFeedTourSteps(false);

export interface RouteTourOptions {
    canAccessAdmin: boolean;
    isMobile?: boolean;
    setMobileMenuOpen?: (open: boolean) => void;
    tab?: string | null;
}

/**
 * Resolve dinamicamente os passos do tutorial correspondentes à rota atual.
 */
export function resolveRouteTourSteps(
    pathname: string,
    { canAccessAdmin, isMobile = false, setMobileMenuOpen, tab }: RouteTourOptions,
): DriveStep[] {
    const normalizedPath = pathname.replace(/\/+$/, "") || "/";

    if (normalizedPath === "/") {
        return getHomeTourSteps();
    }
    if (normalizedPath === "/login") {
        return getLoginTourSteps(isMobile);
    }
    if (normalizedPath === "/membership/apply") {
        return getMembershipApplyTourSteps(isMobile);
    }
    if (normalizedPath === "/forgot-password") {
        return getForgotPasswordTourSteps(isMobile);
    }
    if (normalizedPath === "/servicos") {
        return getServicesPageTourSteps(isMobile);
    }
    if (normalizedPath === "/feed" || normalizedPath === "/avisos" || normalizedPath === "/eventos") {
        return getFeedTourSteps(isMobile);
    }
    if (normalizedPath.startsWith("/agenda")) {
        return getAgendaTourSteps(isMobile);
    }
    if (normalizedPath.startsWith("/financeiro")) {
        return getMemberFinancialTourSteps(isMobile);
    }
    if (normalizedPath.startsWith("/configuracoes")) {
        if (tab === "password") {
            return getChangePasswordTourSteps(isMobile);
        }
        return getSettingsTourSteps(isMobile);
    }
    if (normalizedPath.startsWith("/profile")) {
        return getProfileTourSteps(isMobile);
    }
    if (normalizedPath.startsWith("/tutoriais")) {
        return getTutorialsPageTourSteps(isMobile);
    }
    if (normalizedPath === "/admin") {
        return getAdminPanelTourSteps(isMobile);
    }
    if (normalizedPath.startsWith("/admin/dados-medicos")) {
        return getMedicalProfilesTourSteps(isMobile);
    }
    if (normalizedPath.startsWith("/admin/pagamentos")) {
        return getPaymentsTourSteps(isMobile);
    }
    if (normalizedPath.startsWith("/admin/gestao-financeira")) {
        return getFinancialTourSteps(isMobile);
    }
    if (normalizedPath.startsWith("/admin/gestao-publicacoes") || normalizedPath.startsWith("/admin/publications")) {
        return getPublicationsTourSteps(isMobile);
    }
    if (normalizedPath.startsWith("/admin/users")) {
        if (tab === "applications") {
            return getMembershipApplicationsTourSteps(isMobile);
        }
        return getUsersTourSteps(isMobile);
    }
    if (normalizedPath.startsWith("/admin/roles-permissoes")) {
        return getRolesTourSteps(isMobile);
    }
    if (normalizedPath.startsWith("/admin/veiculos")) {
        return getVehiclesTourSteps(isMobile);
    }
    if (normalizedPath.startsWith("/admin/ferramentas")) {
        return getToolsTourSteps(isMobile);
    }
    if (normalizedPath.startsWith("/admin/dependentes") || normalizedPath.startsWith("/admin/dependents")) {
        return getDependentsTourSteps(isMobile);
    }

    return getTourSteps(canAccessAdmin, isMobile, setMobileMenuOpen);
}

export interface ContextualHelpLabel {
    full: string;
    compact: string;
}

const CONTEXTUAL_HELP_EXACT_ROUTES: Record<string, ContextualHelpLabel> = {
    "/": { full: "Como funciona?", compact: "Ajuda?" },
    "/login": { full: "Ajuda para entrar?", compact: "Ajuda: Login" },
    "/feed": { full: "Ajuda com o mural?", compact: "Ajuda: Mural" },
    "/avisos": { full: "Ajuda com os avisos?", compact: "Ajuda: Avisos" },
    "/servicos": { full: "Ajuda com serviços?", compact: "Ajuda: Serviços" },
    "/eventos": { full: "Ajuda com eventos?", compact: "Ajuda: Eventos" },
    "/admin": { full: "Ajuda com o painel?", compact: "Ajuda: Painel" },
};

const CONTEXTUAL_HELP_PREFIX_ROUTES: Array<[string, ContextualHelpLabel]> = [
    ["/agenda", { full: "Ajuda com a agenda?", compact: "Ajuda: Agenda" }],
    ["/financeiro", { full: "Ajuda com financeiro?", compact: "Ajuda: Financeiro" }],
    ["/profile", { full: "Ajuda com seu perfil?", compact: "Ajuda: Perfil" }],
    ["/configuracoes", { full: "Ajuda com configurações?", compact: "Ajuda: Ajustes" }],
    ["/tutoriais", { full: "Ajuda com tutoriais?", compact: "Ajuda: Tutoriais" }],
    ["/admin/dados-medicos", { full: "Ajuda com dados médicos?", compact: "Ajuda: Saúde" }],
    ["/admin/pagamentos", { full: "Ajuda com pagamentos?", compact: "Ajuda: Pagamentos" }],
    ["/admin/gestao-financeira", { full: "Ajuda com finanças?", compact: "Ajuda: Finanças" }],
    ["/admin/gestao-publicacoes", { full: "Ajuda com publicações?", compact: "Ajuda: Publicações" }],
    ["/admin/publications", { full: "Ajuda com publicações?", compact: "Ajuda: Publicações" }],
    ["/admin/gestao-eventos", { full: "Ajuda com eventos?", compact: "Ajuda: Eventos" }],
    ["/admin/roles-permissoes", { full: "Ajuda com permissões?", compact: "Ajuda: Cargos" }],
    ["/admin/veiculos", { full: "Ajuda com veículos?", compact: "Ajuda: Veículos" }],
    ["/admin/ferramentas", { full: "Ajuda com ferramentas?", compact: "Ajuda: Ferramentas" }],
    ["/admin/tools", { full: "Ajuda com ferramentas?", compact: "Ajuda: Ferramentas" }],
];

/**
 * Retorna o rótulo contextual do botão de ajuda no cabeçalho conforme a rota atual.
 */
export function getContextualHelpLabel(
    pathname: string,
    tab?: string | null,
): ContextualHelpLabel {
    const normalizedPath = pathname.replace(/\/+$/, "") || "/";

    if (CONTEXTUAL_HELP_EXACT_ROUTES[normalizedPath]) {
        return CONTEXTUAL_HELP_EXACT_ROUTES[normalizedPath];
    }

    if (normalizedPath.startsWith("/admin/users")) {
        if (tab === "applications") {
            return { full: "Ajuda com solicitações?", compact: "Ajuda: Pedidos" };
        }
        return { full: "Ajuda com usuários?", compact: "Ajuda: Usuários" };
    }

    const prefixMatch = CONTEXTUAL_HELP_PREFIX_ROUTES.find(([prefix]) =>
        normalizedPath.startsWith(prefix),
    );
    if (prefixMatch) {
        return prefixMatch[1];
    }

    return { full: "Precisa de ajuda?", compact: "Ajuda?" };
}
