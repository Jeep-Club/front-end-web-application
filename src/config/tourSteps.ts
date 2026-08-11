import type { DriveStep } from "driver.js";

export const welcomeStep: DriveStep = {
    popover: {
        title: "Boas-vindas ao Jeep Clube Tamoios! 🚙",
        description: "Vamos fazer um tour guiado rápido para apresentar as principais funcionalidades do sistema.",
        side: "bottom",
        align: "center",
    },
};

export const sidebarStep: DriveStep = {
    element: "#tour-sidebar",
    popover: {
        title: "Navegação Lateral",
        description: "Nesta barra você acessa rapidamente as principais seções do sistema.",
        side: "right",
        align: "start",
    },
};

export const mobileMenuStep: DriveStep = {
    element: "#tour-mobile-menu-btn",
    popover: {
        title: "Menu de Navegação",
        description: "Toque aqui para abrir o menu lateral e navegar pelas seções do sistema.",
        side: "bottom",
        align: "start",
    },
};

export const feedStep: DriveStep = {
    element: "#tour-nav-feed",
    popover: {
        title: "Feed de Associados",
        description: "Acompanhe as novidades, avisos e eventos recentes do Jeep Clube.",
        side: "right",
        align: "center",
    },
};

export const avatarMenuStep: DriveStep = {
    element: "#tour-avatar-menu",
    popover: {
        title: "Sua Conta e Perfil",
        description: "Aqui no topo você pode gerenciar seus dados pessoais, veículos, dependentes e configurações.",
        side: "bottom",
        align: "end",
    },
};

export const adminStep: DriveStep = {
    element: "#tour-admin-link",
    popover: {
        title: "Painel Administrativo",
        description: "Como administrador, você tem acesso exclusivo para gerenciar sócios, dependentes, roles e permissões do sistema.",
        side: "right",
        align: "center",
    },
};

export const completionStep: DriveStep = {
    popover: {
        title: "Tutorial Concluído! 🎉",
        description: "Tudo pronto! Se quiser refazer este tour a qualquer momento, abra o menu do seu perfil e clique em 'Reiniciar tutorial'.",
        side: "bottom",
        align: "center",
    },
};

export function getTourSteps(canAccessAdmin: boolean, isMobile: boolean = false): DriveStep[] {
    const steps: DriveStep[] = [
        welcomeStep,
        isMobile ? mobileMenuStep : sidebarStep,
    ];

    if (!isMobile) {
        steps.push(feedStep);
    }

    steps.push(avatarMenuStep);

    if (canAccessAdmin && !isMobile) {
        steps.push(adminStep);
    }

    steps.push(completionStep);

    return steps;
}
