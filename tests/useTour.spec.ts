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
    getTutorialsPageTourSteps,
    resolveRouteTourSteps,
    adminStep,
    welcomeStep,
    completionStep,
    mobileMenuStep,
    sidebarStep,
} from "@/config/tourSteps";
import { filterTutorials, TUTORIAL_CATALOG } from "@/components/pages/tutoriais";
import { FORCE_START_TOUR_KEY, getTourStorageKey, requestTourStart } from "@/hooks/useTour";

describe("Tour Configuration & Logic", () => {
    it("deve retornar os passos padrão para membros comuns (sem passo de admin)", () => {
        const steps = getTourSteps(false, false);
        expect(steps[0]).toMatchObject(welcomeStep);
        expect(steps[1]).toMatchObject(sidebarStep);
        expect(steps[steps.length - 1]).toMatchObject(completionStep);
        expect(steps.map((step) => step.element)).toEqual([
            undefined, "#tour-sidebar", "#tour-nav-feed", "#tour-avatar-container", undefined,
        ]);
    });

    it("deve incluir o passo de administração em telas desktop para usuários com acesso de admin", () => {
        const steps = getTourSteps(true, false);
        expect(steps.find((step) => step.element === "#tour-admin-link")).toMatchObject(adminStep);
        expect(steps.map((step) => step.element)).toEqual([
            undefined, "#tour-sidebar", "#tour-nav-feed", "#tour-admin-link", "#tour-avatar-container", undefined,
        ]);
    });

    it("deve usar o menu mobile e manter administração para usuários com acesso", () => {
        const steps = getTourSteps(true, true);
        expect(steps[1]).toMatchObject(mobileMenuStep);
        expect(steps.find((step) => step.element === "#tour-admin-link")).toMatchObject(adminStep);
        expect(steps.map((step) => step.element)).toEqual([
            undefined, "#tour-mobile-menu-btn", "#tour-nav-feed", "#tour-admin-link", "#tour-avatar-container", undefined,
        ]);
    });

    it("não deve incluir administração no mobile sem acesso administrativo", () => {
        const steps = getTourSteps(false, true);
        expect(steps.map((step) => step.element)).toEqual([
            undefined, "#tour-mobile-menu-btn", "#tour-nav-feed", "#tour-avatar-container", undefined,
        ]);
    });

    it.each([false, true])("deve sincronizar menus pelos callbacks (mobile=%s)", (isMobile) => {
        const setMobileMenuOpen = jest.fn();
        const steps = getTourSteps(true, isMobile, setMobileMenuOpen);
        const feed = steps.find((step) => step.element === "#tour-nav-feed")!;
        const admin = steps.find((step) => step.element === "#tour-admin-link")!;
        const avatar = steps.find((step) => step.element === "#tour-avatar-container")!;
        const completion = steps[steps.length - 1];
        const events = new EventTarget();
        const openAvatar = jest.fn();
        const closeAvatar = jest.fn();
        events.addEventListener("tour:open-avatar-menu", openAvatar);
        events.addEventListener("tour:close-avatar-menu", closeAvatar);
        const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
        Object.defineProperty(globalThis, "window", { configurable: true, value: events });

        try {
            if (isMobile) {
                const menu = steps[1];
                expect(menu.onDeselected).toEqual(expect.any(Function));
                menu.onDeselected!(undefined, menu, {} as never);
                expect(setMobileMenuOpen.mock.calls).toEqual([[true]]);
                setMobileMenuOpen.mockClear();
            }

            for (const step of [feed, admin]) {
                expect(step.onHighlightStarted).toEqual(expect.any(Function));
                step.onHighlightStarted!(undefined, step, {} as never);
                expect(setMobileMenuOpen.mock.calls).toEqual(isMobile ? [[true]] : []);
                setMobileMenuOpen.mockClear();
            }

            expect(avatar.onHighlightStarted).toEqual(expect.any(Function));
            avatar.onHighlightStarted!(undefined, avatar, {} as never);
            expect(setMobileMenuOpen.mock.calls).toEqual(isMobile ? [[false]] : []);
            expect(openAvatar).toHaveBeenCalledTimes(1);
            expect(closeAvatar).not.toHaveBeenCalled();
            setMobileMenuOpen.mockClear();

            expect(avatar.onDeselected).toEqual(expect.any(Function));
            avatar.onDeselected!(undefined, avatar, {} as never);
            expect(closeAvatar).toHaveBeenCalledTimes(1);

            expect(completion.onHighlightStarted).toEqual(expect.any(Function));
            completion.onHighlightStarted!(undefined, completion, {} as never);
            expect(setMobileMenuOpen.mock.calls).toEqual(isMobile ? [[false]] : []);
            expect(closeAvatar).toHaveBeenCalledTimes(2);
            expect(openAvatar).toHaveBeenCalledTimes(1);
        } finally {
            if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
            else Reflect.deleteProperty(globalThis, "window");
        }
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
            "#tour-feed-quick-access",
            "#tour-sidebar",
            "#tour-avatar-container",
            "#tour-header-help-btn",
        ]);

        const mobileSteps = getFeedTourSteps(true);
        expect(mobileSteps.map((step) => step.element)).toEqual([
            "#tour-feed-filters",
            "#tour-feed-create-btn",
            "#tour-feed-list",
            "#tour-feed-sidebar",
            "#tour-feed-quick-access",
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
    });

    it("deve resolver dinamicamente os passos do tutorial conforme a rota atual", () => {
        expect(resolveRouteTourSteps("/", { canAccessAdmin: false })).toEqual(getHomeTourSteps());
        expect(resolveRouteTourSteps("/login", { canAccessAdmin: false, isMobile: true })).toEqual(getLoginTourSteps(true));
        expect(resolveRouteTourSteps("/profile", { canAccessAdmin: false })).toEqual(getProfileTourSteps(false));
        expect(resolveRouteTourSteps("/tutoriais", { canAccessAdmin: false })).toEqual(getTutorialsPageTourSteps(false));
        expect(resolveRouteTourSteps("/admin", { canAccessAdmin: true })).toEqual(getAdminPanelTourSteps(false));
        expect(resolveRouteTourSteps("/admin/dados-medicos", { canAccessAdmin: true })).toEqual(getMedicalProfilesTourSteps(false));
        expect(resolveRouteTourSteps("/admin/pagamentos", { canAccessAdmin: true })).toEqual(getPaymentsTourSteps(false));
        expect(resolveRouteTourSteps("/admin/gestao-financeira", { canAccessAdmin: true })).toEqual(getFinancialTourSteps(false));
        expect(resolveRouteTourSteps("/admin/gestao-publicacoes", { canAccessAdmin: true })).toEqual(getPublicationsTourSteps(false));
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
            "profile-account",
            "public-landing-home",
            "tutorials-hub",
        ]);

        const vehicleQueryResults = filterTutorials(
            TUTORIAL_CATALOG,
            memberPermissions,
            "como faço para cadastrar meu veículo 4x4",
            "all",
        );
        expect(vehicleQueryResults[0]?.id).toBe("profile-account");

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

    it("deve retornar os passos da página /tutoriais e registrar o alvo no sessionStorage ao solicitar início de tutorial", () => {
        expect(getTutorialsPageTourSteps(false).map((step) => step.element)).toEqual([
            "#tour-tutorials-header",
            "#tour-tutorials-search",
            "#tour-tutorials-categories",
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
