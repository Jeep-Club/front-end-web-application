import { getTourSteps, adminStep, welcomeStep, completionStep, mobileMenuStep, sidebarStep } from "@/config/tourSteps";
import { getTourStorageKey } from "@/hooks/useTour";

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
});
