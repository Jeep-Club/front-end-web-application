import { resolvePublicationTypes, togglePublicationType } from "@/utils/publications/typeFilters";

describe("Filtros de tipos de publicação", () => {
    it("seleciona todos os tipos permitidos por padrão", () => {
        expect(resolvePublicationTypes(["NOTICE", "EVENT", "SERVICE"], [])).toEqual(["NOTICE", "EVENT", "SERVICE"]);
    });
    it("considera apenas os tipos permitidos presentes na URL", () => {
        expect(resolvePublicationTypes(["NOTICE", "EVENT"], ["SERVICE", "EVENT"])).toEqual(["EVENT"]);
    });
    it("recupera a seleção se a URL só contém tipos inválidos ou sem permissão", () => {
        expect(resolvePublicationTypes(["NOTICE"], ["SERVICE"])).toEqual(["NOTICE"]);
    });
    it("permite desmarcar e selecionar tipos", () => {
        expect(togglePublicationType(["NOTICE", "EVENT"], "NOTICE")).toEqual(["EVENT"]);
        expect(togglePublicationType(["EVENT"], "NOTICE")).toEqual(["EVENT", "NOTICE"]);
    });
    it("impede remover o último tipo, inclusive com uma única permissão", () => {
        const selected = ["NOTICE"];
        expect(togglePublicationType(selected, "NOTICE")).toBe(selected);
    });
});