import { getTourSteps, adminStep, welcomeStep, completionStep, mobileMenuStep, sidebarStep } from "@/config/tourSteps";
import { getTourStorageKey } from "@/hooks/useTour";

describe("Tour Configuration & Logic", () => {
    it("deve retornar os passos padrão para membros comuns (sem passo de admin)", () => {
        const steps = getTourSteps(false, false);
        expect(steps).toContainEqual(expect.objectContaining(welcomeStep));
        expect(steps).toContainEqual(expect.objectContaining(sidebarStep));
        expect(steps).toContainEqual(expect.objectContaining(completionStep));
        expect(steps).not.toContainEqual(expect.objectContaining(adminStep));
    });

    it("deve incluir o passo de administração em telas desktop para usuários com acesso de admin", () => {
        const steps = getTourSteps(true, false);
        expect(steps).toContainEqual(expect.objectContaining(adminStep));
        expect(steps.length).toBe(6);
    });

    it("deve adaptar os passos para dispositivos móveis apontando para o menu hambúrguer", () => {
        const steps = getTourSteps(true, true);
        expect(steps).toContainEqual(expect.objectContaining(mobileMenuStep));
        expect(steps).not.toContainEqual(expect.objectContaining(sidebarStep));
        expect(steps).toContainEqual(expect.objectContaining(adminStep));
    });

    it("deve separar as chaves do localStorage entre administrador e membro comum", () => {
        expect(getTourStorageKey(true)).toBe("tour_completed_admin");
        expect(getTourStorageKey(false)).toBe("tour_completed_member");
    });
});
