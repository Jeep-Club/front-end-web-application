import {
    getTourSteps,
    getHomeTourSteps,
    getFeedTourSteps,
    getLoginTourSteps,
    getProfileTourSteps,
    getAdminPanelTourSteps,
    getMedicalProfilesTourSteps,
    getPaymentsTourSteps,
    getFinancialTourSteps,
    getPublicationsTourSteps,
    getUsersTourSteps,
    getMembershipApplicationsTourSteps,
    getRolesTourSteps,
    getVehiclesTourSteps,
    getToolsTourSteps,
    getDependentsTourSteps,
    getAgendaTourSteps,
    getMemberFinancialTourSteps,
    getServicesPageTourSteps,
    getSettingsTourSteps,
    getMembershipApplyTourSteps,
    getForgotPasswordTourSteps,
    getTutorialsPageTourSteps,
    getContextualHelpLabel,
    resolveRouteTourSteps,
    adminStep,
    welcomeStep,
    completionStep,
    mobileMenuStep,
    sidebarStep,
} from "@/config/tourSteps";
import { existsSync } from "node:fs";
import path from "node:path";
import { filterTutorials, TUTORIAL_CATALOG } from "@/components/pages/tutoriais";
import { FORCE_START_TOUR_KEY, getTourStorageKey, requestTourStart } from "@/hooks/useTour";

describe("Tour Configuration & Logic", () => {
    it("deve retornar os passos padrão para membros comuns (sem passo de admin)", () => {
        const steps = getTourSteps(false, false);
        expect(steps[0]).toMatchObject(welcomeStep);
        expect(steps[1]).toMatchObject(sidebarStep);
        expect(steps[steps.length - 1]).toMatchObject(completionStep);
        expect(steps.map((step) => step.element)).toEqual([
            undefined, "#tour-sidebar", "#tour-nav-feed", "#tour-manage-account-btn", undefined,
        ]);
    });

    it("deve incluir o passo de administração em telas desktop para usuários com acesso de admin", () => {
        const steps = getTourSteps(true, false);
        expect(steps.find((step) => step.element === "#tour-admin-link")).toMatchObject(adminStep);
        expect(steps.map((step) => step.element)).toEqual([
            undefined, "#tour-sidebar", "#tour-nav-feed", "#tour-admin-link", "#tour-manage-account-btn", undefined,
        ]);
    });

    it("deve usar o menu mobile e manter administração para usuários com acesso", () => {
        const steps = getTourSteps(true, true);
        expect(steps[1]).toMatchObject(mobileMenuStep);
        expect(steps.find((step) => step.element === "#tour-admin-link")).toMatchObject(adminStep);
        expect(steps.map((step) => step.element)).toEqual([
            undefined, "#tour-mobile-menu-btn", "#tour-nav-feed", "#tour-admin-link", "#tour-manage-account-btn", undefined,
        ]);
    });

    it("não deve incluir administração no mobile sem acesso administrativo", () => {
        const steps = getTourSteps(false, true);
        expect(steps.map((step) => step.element)).toEqual([
            undefined, "#tour-mobile-menu-btn", "#tour-nav-feed", "#tour-manage-account-btn", undefined,
        ]);
    });

    it.each([false, true])("deve sincronizar a navegação da conta pelos callbacks (mobile=%s)", (isMobile) => {
        const setMobileMenuOpen = jest.fn();
        const steps = getTourSteps(true, isMobile, setMobileMenuOpen);
        const feed = steps.find((step) => step.element === "#tour-nav-feed")!;
        const admin = steps.find((step) => step.element === "#tour-admin-link")!;
        const account = steps.find((step) => step.element === "#tour-manage-account-btn")!;
        const completion = steps[steps.length - 1];
        if (isMobile) {
            const menu = steps[1];
            expect(menu.onDeselected).toEqual(expect.any(Function));
            menu.onDeselected!(undefined, menu, {} as never);
            expect(setMobileMenuOpen.mock.calls).toEqual([[true]]);
            setMobileMenuOpen.mockClear();
        }

        for (const step of [feed, admin, account]) {
            expect(step.onHighlightStarted).toEqual(expect.any(Function));
            step.onHighlightStarted!(undefined, step, {} as never);
            expect(setMobileMenuOpen.mock.calls).toEqual(isMobile ? [[true]] : []);
            setMobileMenuOpen.mockClear();
        }

        expect(completion.onHighlightStarted).toEqual(expect.any(Function));
        completion.onHighlightStarted!(undefined, completion, {} as never);
        expect(setMobileMenuOpen.mock.calls).toEqual(isMobile ? [[false]] : []);
    });

    it("deve separar as chaves do localStorage entre administrador e membro comum", () => {
        expect(getTourStorageKey(true)).toBe("tour_completed_admin");
        expect(getTourStorageKey(false)).toBe("tour_completed_member");
    });

    it("deve incluir todas as seções da página inicial pública no tutorial da Home", () => {
        const steps = getHomeTourSteps();
        expect(steps.map((step) => step.element)).toEqual([
            "#tour-home-member-btn",
            "#tour-home-join-btn",
            "#tour-home-scroll-down",
            "#experiencias",
            "#legado",
            "#impacto",
            "#tour-home-cta",
            "#tour-home-help-btn",
        ]);
    });

    it("deve retornar os passos do tutorial do Mural/Home logada (/feed) adaptados para desktop e mobile", () => {
        const desktopSteps = getFeedTourSteps(false);
        expect(desktopSteps.map((step) => step.element)).toEqual([
            "#tour-feed-filters",
            "#tour-feed-create-btn",
            "#tour-feed-list",
            "#tour-feed-sidebar",
            "#tour-sidebar",
            "#tour-avatar-container",
            "#tour-header-help-btn",
        ]);

        const mobileSteps = getFeedTourSteps(true);
        expect(mobileSteps.map((step) => step.element)).toEqual([
            "#tour-feed-filters",
            "#tour-feed-create-mobile-btn",
            "#tour-feed-list",
            "#tour-feed-sidebar",
            "#tour-mobile-menu-btn",
            "#tour-avatar-container",
            "#tour-header-help-btn",
        ]);
    });

    it("deve incluir busca, favoritos, cartões e ações no tutorial do painel /admin", () => {
        const steps = getAdminPanelTourSteps(false);
        expect(steps.map((step) => step.element)).toEqual([
            "#tour-admin-header",
            "#tour-admin-search",
            "#tour-admin-modules-grid",
            "#tour-admin-favorite-btn",
            "#tour-admin-manage-btn",
            "#tour-admin-help-btn",
        ]);
    });

    it("deve retornar os passos do tutorial de Gestão de Publicações (/admin/gestao-publicacoes)", () => {
        const steps = getPublicationsTourSteps(false);
        expect(steps.map((step) => step.element)).toEqual([
            "#tour-publications-header",
            "#tour-publications-types",
            "#tour-publications-create-btn",
            "#tour-publications-status",
            "#publication-status-results",
            "#tour-header-help-btn",
        ]);
    });

    it("deve retornar os passos do tutorial de Gestão de Usuários (/admin/users) e Solicitações (/admin/users?tab=applications)", () => {
        expect(getUsersTourSteps(false).map((step) => step.element)).toEqual([
            "#tour-users-header",
            "#tour-users-tabs",
            "#tour-users-search",
            "#tour-users-status-filter",
            "#tour-users-create-btn",
            "#tour-users-table",
            "#tour-header-help-btn",
        ]);

        expect(getMembershipApplicationsTourSteps(false).map((step) => step.element)).toEqual([
            "#tour-users-header",
            "#tour-users-tabs",
            "#tour-applications-status-filter",
            "#tour-applications-list",
            "#tour-applications-actions",
            "#tour-header-help-btn",
        ]);
    });

    it("deve retornar os passos dos tutoriais de Análise de Pagamentos (/admin/pagamentos) e Gestão Financeira (/admin/gestao-financeira)", () => {
        expect(getPaymentsTourSteps(false).map((step) => step.element)).toEqual([
            "#tour-payments-header",
            "#tour-payments-filters",
            "#tour-payments-table",
            "#tour-payments-detail-btn",
            "#tour-header-help-btn",
        ]);

        expect(getFinancialTourSteps(false).map((step) => step.element)).toEqual([
            "#tour-financial-header",
            "#tour-financial-tabs",
            "#tour-financial-content",
            "#tour-header-help-btn",
        ]);
    });

    it("deve retornar os passos dos tutoriais de Dados Médicos (/admin/dados-medicos), Veículos (/admin/veiculos) e Ferramentas (/admin/ferramentas)", () => {
        expect(getMedicalProfilesTourSteps(false).map((step) => step.element)).toEqual([
            "#tour-medical-header",
            "#tour-medical-export",
            "#tour-medical-create-btn",
            "#tour-medical-table",
            "#tour-header-help-btn",
        ]);

        expect(getVehiclesTourSteps(false).map((step) => step.element)).toEqual([
            "#tour-vehicles-header",
            "#tour-vehicles-create-btn",
            "#tour-vehicles-list",
            "#tour-vehicles-actions",
            "#tour-header-help-btn",
        ]);

        expect(getToolsTourSteps(false).map((step) => step.element)).toEqual([
            "#tour-tools-header",
            "#tour-tools-create-btn",
            "#tour-tools-filters",
            "#tour-tools-list",
            "#tour-tools-actions",
            "#tour-header-help-btn",
        ]);

        expect(getDependentsTourSteps(false).map((step) => step.element)).toEqual([
            "#tour-dependents-header",
            "#tour-dependents-export",
            "#tour-dependents-filters",
            "#tour-dependents-list",
            "#tour-dependents-actions",
            "#tour-header-help-btn",
        ]);
    });

    it("deve retornar os passos dos novos tutoriais de Agenda (/agenda), Financeiro (/financeiro), Serviços (/servicos), Configurações (/configuracoes), Solicitação (/membership/apply) e Recuperação de Senha (/forgot-password)", () => {
        expect(getAgendaTourSteps(false).map((step) => step.element)).toEqual([
            "#tour-agenda-header",
            "#tour-agenda-controls",
            "#tour-agenda-calendar",
            "#tour-header-help-btn",
        ]);

        expect(getMemberFinancialTourSteps(false).map((step) => step.element)).toEqual([
            "#tour-member-financial-header",
            "#tour-member-financial-filters",
            "#tour-member-financial-list",
            "#tour-header-help-btn",
        ]);

        expect(getServicesPageTourSteps(false).map((step) => step.element)).toEqual([
            "#tour-services-header",
            "#tour-services-list",
            "#tour-header-help-btn",
        ]);

        expect(getSettingsTourSteps(false).map((step) => step.element)).toEqual([
            "#tour-settings-header",
            "#tour-settings-sections",
            "#tour-settings-panel",
            "#tour-header-help-btn",
        ]);

        expect(getMembershipApplyTourSteps(false).map((step) => step.element)).toEqual([
            "#tour-apply-card",
            "#tour-apply-personal",
            "#tour-apply-message",
            "#tour-apply-submit",
        ]);

        expect(getForgotPasswordTourSteps(false).map((step) => step.element)).toEqual([
            "#tour-forgot-card",
            "#tour-forgot-cpf",
            "#tour-forgot-back",
        ]);
    });

    it("deve resolver dinamicamente os passos do tutorial conforme a rota atual", () => {
        expect(resolveRouteTourSteps("/", { canAccessAdmin: false })).toEqual(getHomeTourSteps());
        expect(resolveRouteTourSteps("/login", { canAccessAdmin: false, isMobile: true })).toEqual(getLoginTourSteps(true));
        expect(resolveRouteTourSteps("/membership/apply", { canAccessAdmin: false })).toEqual(getMembershipApplyTourSteps(false));
        expect(resolveRouteTourSteps("/forgot-password", { canAccessAdmin: false })).toEqual(getForgotPasswordTourSteps(false));
        expect(resolveRouteTourSteps("/profile", { canAccessAdmin: false })).toEqual(getProfileTourSteps(false));
        expect(resolveRouteTourSteps("/agenda", { canAccessAdmin: false })).toEqual(getAgendaTourSteps(false));
        expect(resolveRouteTourSteps("/financeiro", { canAccessAdmin: false })).toEqual(getMemberFinancialTourSteps(false));
        expect(resolveRouteTourSteps("/servicos", { canAccessAdmin: false })).toEqual(getServicesPageTourSteps(false));
        expect(resolveRouteTourSteps("/configuracoes", { canAccessAdmin: false })).toEqual(getSettingsTourSteps(false));
        expect(resolveRouteTourSteps("/tutoriais", { canAccessAdmin: false })).toEqual(getTutorialsPageTourSteps(false));
        expect(resolveRouteTourSteps("/admin", { canAccessAdmin: true })).toEqual(getAdminPanelTourSteps(false));
        expect(resolveRouteTourSteps("/admin/dados-medicos", { canAccessAdmin: true })).toEqual(getMedicalProfilesTourSteps(false));
        expect(resolveRouteTourSteps("/admin/pagamentos", { canAccessAdmin: true })).toEqual(getPaymentsTourSteps(false));
        expect(resolveRouteTourSteps("/admin/gestao-financeira", { canAccessAdmin: true })).toEqual(getFinancialTourSteps(false));
        expect(resolveRouteTourSteps("/admin/gestao-publicacoes", { canAccessAdmin: true })).toEqual(getPublicationsTourSteps(false));
        expect(resolveRouteTourSteps("/admin/publications", { canAccessAdmin: true })).toEqual(getPublicationsTourSteps(false));
        expect(resolveRouteTourSteps("/admin/users", { canAccessAdmin: true })).toEqual(getUsersTourSteps(false));
        expect(resolveRouteTourSteps("/admin/users", { canAccessAdmin: true, tab: "applications" })).toEqual(getMembershipApplicationsTourSteps(false));
        expect(resolveRouteTourSteps("/admin/roles-permissoes", { canAccessAdmin: true })).toEqual(getRolesTourSteps(false));
        expect(resolveRouteTourSteps("/admin/veiculos", { canAccessAdmin: true })).toEqual(getVehiclesTourSteps(false));
        expect(resolveRouteTourSteps("/admin/ferramentas", { canAccessAdmin: true })).toEqual(getToolsTourSteps(false));
        expect(
            resolveRouteTourSteps("/feed", { canAccessAdmin: true, isMobile: false }).map((s) => s.element),
        ).toEqual(getFeedTourSteps(false).map((s) => s.element));
    });

    it("deve filtrar tutoriais na Central de Tutoriais (/tutoriais) conforme permissões, categoria e dúvida pesquisada", () => {
        const memberPermissions: PermissionModule[] = [
            { module: "PUBLICATIONS", actions: ["FEED_READ"] },
        ];
        const memberResults = filterTutorials(TUTORIAL_CATALOG, memberPermissions, "", "all");
        expect(memberResults.every((item) => item.category === "member")).toBe(true);
        expect(memberResults.map((item) => item.id)).toEqual([
            "feed-home",
            "member-vehicles",
            "member-medical",
            "profile-account",
            "member-dependents",
            "member-tools",
            "member-agenda",
            "member-financial",
            "member-services",
            "member-settings",
            "member-change-password",
            "member-password-recovery",
            "public-landing-home",
            "member-membership-apply",
            "tutorials-hub",
        ]);

        const vehicleQueryResults = filterTutorials(
            TUTORIAL_CATALOG,
            memberPermissions,
            "como faço para cadastrar meu veículo 4x4",
            "all",
        );
        expect(vehicleQueryResults[0]?.id).toBe("member-vehicles");

        const aondeQueryResults = filterTutorials(
            TUTORIAL_CATALOG,
            memberPermissions,
            "aonde eu cadastro meu veiculo",
            "all",
        );
        expect(aondeQueryResults[0]?.id).toBe("member-vehicles");

        const synonymCarQuery = filterTutorials(
            TUTORIAL_CATALOG,
            memberPermissions,
            "onde coloco meu carro",
            "all",
        );
        expect(synonymCarQuery[0]?.id).toBe("member-vehicles");

        const typoVehicleQuery = filterTutorials(
            TUTORIAL_CATALOG,
            memberPermissions,
            "como cadastrar veiclo",
            "all",
        );
        expect(typoVehicleQuery[0]?.id).toBe("member-vehicles");

        expect(
            filterTutorials(TUTORIAL_CATALOG, memberPermissions, "ficha medica", "all")[0]?.id,
        ).toBe("member-medical");
        expect(
            filterTutorials(TUTORIAL_CATALOG, memberPermissions, "baixar carteirinha", "all")[0]?.id,
        ).toBe("profile-account");
        expect(
            filterTutorials(TUTORIAL_CATALOG, memberPermissions, "calendario de trilhas", "all")[0]?.id,
        ).toBe("member-agenda");
        expect(
            filterTutorials(TUTORIAL_CATALOG, memberPermissions, "ver minha mensalidade", "all")[0]?.id,
        ).toBe("member-financial");
        expect(
            filterTutorials(TUTORIAL_CATALOG, memberPermissions, "esqueci minha senha", "all")[0]?.id,
        ).toBe("member-password-recovery");

        const adminPermissions: PermissionModule[] = [
            { module: "VEHICLES", actions: ["VEHICLE_READ"] },
            { module: "BILLING", actions: ["PAYMENT_READ"] },
        ];
        const adminOnlyResults = filterTutorials(TUTORIAL_CATALOG, adminPermissions, "", "admin");
        expect(adminOnlyResults.map((item) => item.id)).toEqual([
            "admin-panel",
            "admin-payments",
            "admin-financial",
            "admin-vehicles",
        ]);

        const paymentDoubtResults = filterTutorials(
            TUTORIAL_CATALOG,
            adminPermissions,
            "validar comprovante de pagamento",
            "all",
        );
        expect(paymentDoubtResults[0]?.id).toBe("admin-payments");
    });

    it("deve possuir imagens desktop e mobile existentes para todos os tutoriais de associados", () => {
        const memberTutorials = TUTORIAL_CATALOG.filter((item) => item.category === "member");
        expect(memberTutorials.length).toBeGreaterThan(0);

        for (const tutorial of memberTutorials) {
            expect(tutorial.imageSteps?.length).toBeGreaterThan(0);
            for (const step of tutorial.imageSteps ?? []) {
                const desktopFile = path.join(process.cwd(), "public", step.desktopSrc.replace(/^\//, ""));
                const mobileFile = path.join(process.cwd(), "public", step.mobileSrc.replace(/^\//, ""));
                expect(existsSync(desktopFile)).toBe(true);
                expect(existsSync(mobileFile)).toBe(true);
                expect(step.caption.trim().length).toBeGreaterThan(0);
                expect(step.alt.trim().length).toBeGreaterThan(0);
            }
        }
    });

    it("deve retornar frases contextuais e compactas no botão de ajuda conforme a página", () => {
        expect(getContextualHelpLabel("/feed")).toEqual({
            full: "Ajuda com o mural?",
            compact: "Ajuda: Mural",
        });
        expect(getContextualHelpLabel("/profile")).toEqual({
            full: "Ajuda com seu perfil?",
            compact: "Ajuda: Perfil",
        });
        expect(getContextualHelpLabel("/agenda")).toEqual({
            full: "Ajuda com a agenda?",
            compact: "Ajuda: Agenda",
        });
        expect(getContextualHelpLabel("/financeiro")).toEqual({
            full: "Ajuda com financeiro?",
            compact: "Ajuda: Financeiro",
        });
        expect(getContextualHelpLabel("/configuracoes")).toEqual({
            full: "Ajuda com configurações?",
            compact: "Ajuda: Ajustes",
        });
        expect(getContextualHelpLabel("/admin/users", "applications")).toEqual({
            full: "Ajuda com solicitações?",
            compact: "Ajuda: Pedidos",
        });
        expect(getContextualHelpLabel("/rota-desconhecida")).toEqual({
            full: "Precisa de ajuda?",
            compact: "Ajuda?",
        });
    });

    it("deve retornar os passos da página /tutoriais e registrar o alvo no sessionStorage ao solicitar início de tutorial", () => {
        expect(getTutorialsPageTourSteps(false).map((step) => step.element)).toEqual([
            "#tour-tutorials-header",
            "#tour-tutorials-search",
            "#tour-tutorials-results",
            "#tour-tutorials-start-btn",
            "#tour-header-help-btn",
        ]);

        const setItem = jest.fn();
        const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
        const originalSessionStorage = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage");
        Object.defineProperty(globalThis, "window", { configurable: true, value: {} });
        Object.defineProperty(globalThis, "sessionStorage", {
            configurable: true,
            value: { setItem },
        });

        try {
            requestTourStart("tour_completed_admin_vehicles");
            expect(setItem).toHaveBeenCalledWith(FORCE_START_TOUR_KEY, "tour_completed_admin_vehicles");
        } finally {
            if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
            else Reflect.deleteProperty(globalThis, "window");
            if (originalSessionStorage) Object.defineProperty(globalThis, "sessionStorage", originalSessionStorage);
            else Reflect.deleteProperty(globalThis, "sessionStorage");
        }
    });
});
