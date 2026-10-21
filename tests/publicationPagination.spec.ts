import { parsePublicationPagination, updatePublicationPagination } from "@/utils/publications/pagination";

describe("Paginação de publicações", () => {
    it("começa na primeira página com 12 publicações", () => {
        expect(parsePublicationPagination(new URLSearchParams())).toEqual({ pageIndex: 0, pageSize: 12 });
    });
    it.each([12, 24, 36, 48])("aceita %i publicações por página", (size) => {
        expect(parsePublicationPagination(new URLSearchParams(`size=${size}&page=2`))).toEqual({ pageIndex: 2, pageSize: size });
    });
    it.each(["page=-1&size=25", "page=abc&size=0", "page=1.5&size=100", "page=Infinity&size=48.5"])("normaliza parâmetros inválidos: %s", (query) => {
        expect(parsePublicationPagination(new URLSearchParams(query))).toEqual({ pageIndex: 0, pageSize: 12 });
    });
    it("volta à primeira página ao alterar a quantidade e preserva filtros", () => {
        const next = updatePublicationPagination(new URLSearchParams("page=3&size=12&type=NOTICE&type=EVENT"), { pageIndex: 3, pageSize: 24 });
        expect(next.get("page")).toBe("0");
        expect(next.get("size")).toBe("24");
        expect(next.getAll("type")).toEqual(["NOTICE", "EVENT"]);
    });
    it("mantém o tamanho ao navegar entre páginas", () => {
        const next = updatePublicationPagination(new URLSearchParams("size=36"), { pageIndex: 2, pageSize: 36 });
        expect(next.get("page")).toBe("2");
        expect(next.get("size")).toBe("36");
    });
});