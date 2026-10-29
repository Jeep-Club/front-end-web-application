import { parsePublicationStatus } from "@/utils/publications/statusFilters";

describe("Filtro administrativo de estados", () => {
    it("seleciona todos os estados por padrão", () => {
        expect(parsePublicationStatus(null)).toBe("ALL");
        expect(parsePublicationStatus("invalid")).toBe("ALL");
    });
    it.each(["ALL", "DRAFT", "PUBLISHED", "ARCHIVED"] as const)("aceita %s", (status) => {
        expect(parsePublicationStatus(status)).toBe(status);
    });
});