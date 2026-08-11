import { getTourSteps, adminStep, welcomeStep, completionStep, mobileMenuStep, sidebarStep } from "@/config/tourSteps";
import { getTourStorageKey } from "@/hooks/useTour";

describe("Tour Configuration & Logic", () => {
    it("deve retornar os passos padrão para membros comuns (sem passo de admin)", () => {
        const steps = getTourSteps(false, false);
        expect(steps).toContain(welcomeStep);
        expect(steps).toContain(sidebarStep);
        expect(steps).toContain(completionStep);
        expect(steps).not.toContain(adminStep);
    });

    it("deve incluir o passo de administração em telas desktop para usuários com acesso de admin", () => {
        const steps = getTourSteps(true, false);
        expect(steps).toContain(adminStep);
        expect(steps.length).toBe(6);
    });

    it("deve adaptar os passos para dispositivos móveis apontando para o menu hambúrguer", () => {
        const steps = getTourSteps(true, true);
        expect(steps).toContain(mobileMenuStep);
        expect(steps).not.toContain(sidebarStep);
        expect(steps).not.toContain(adminStep);
    });

    it("deve separar as chaves do localStorage entre administrador e membro comum", () => {
        expect(getTourStorageKey(true)).toBe("tour_completed_admin");
        expect(getTourStorageKey(false)).toBe("tour_completed_member");
    });
});
