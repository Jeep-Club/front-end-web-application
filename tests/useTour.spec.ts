import { getTourSteps, adminStep, welcomeStep, completionStep, mobileMenuStep, sidebarStep } from "@/config/tourSteps";
import { getTourStorageKey } from "@/hooks/useTour";

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
});
