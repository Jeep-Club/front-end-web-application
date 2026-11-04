import { listAdminPublicationsAction } from "@/server/actions/publications/list";
import { parsePublicationExportIds } from "@/utils/publications/exportCsv";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { haveActionPermission } from "@/utils/permission/actionPermissions";

jest.mock("@/services/fetchWrapper/actionFetchWrapper", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("@/utils/permission/actionPermissions", () => ({ haveActionPermission: jest.fn() }));

const notice = { id: 7, title: "Aviso salvo", content: "Conteúdo", status: "DRAFT", images: [{ storageKey: "images/test.jpg", position: 0, primary: true }] };

describe("Listagem administrativa pelas rotas existentes", () => {
    beforeEach(() => jest.resetAllMocks());
    it("lista rascunhos com galeria, sem usar o feed", async () => {
        jest.mocked(haveActionPermission).mockResolvedValue(true);
        jest.mocked(actionFetchWrapper).mockImplementation(async (request) => request.url.includes("/export")
            ? { status: 200, data: new Blob(['\uFEFF"ID";"Título"\r\n"7";"Aviso salvo"\r\n'], { type: 'text/csv' }) }
            : { status: 200, data: notice });
        const result = await listAdminPublicationsAction({ types: ["NOTICE"], status: "DRAFT", page: 0, size: 12 });
        expect(result.content[0]).toEqual({ ...notice, type: "NOTICE" });
        expect(result.totalElements).toBe(1);
        expect(actionFetchWrapper).toHaveBeenCalledWith(expect.objectContaining({ url: "admin/notices/export?format=CSV&status=DRAFT", responseType: 'blob', allowedContentTypes: ['text/csv'] }));
        expect(actionFetchWrapper).toHaveBeenCalledWith(expect.objectContaining({ url: "admin/notices/7" }));
        expect(actionFetchWrapper).not.toHaveBeenCalledWith(expect.objectContaining({ url: expect.stringContaining("publications/feed") }));
    });
    it("consulta somente as galerias da página escolhida e calcula os totais", async () => {
        jest.mocked(haveActionPermission).mockResolvedValue(true);
        const csv = '"ID"\r\n' + Array.from({ length: 25 }, (_, i) => `"${i + 1}"\r\n`).join("");
        jest.mocked(actionFetchWrapper).mockImplementation(async (request) => request.url.includes("/export")
            ? { status: 200, data: new Blob([csv], { type: 'text/csv' }) }
            : { status: 200, data: { ...notice, id: Number(request.url.split("/").pop()) } });
        const result = await listAdminPublicationsAction({ types: ["NOTICE"], status: "ALL", page: 1, size: 12 });
        expect(result.content.map((entry) => entry.id)).toEqual([13,12,11,10,9,8,7,6,5,4,3,2]);
        expect(result.totalElements).toBe(25);
        expect(result.totalPages).toBe(3);
        expect(actionFetchWrapper).toHaveBeenCalledTimes(13);
    });
    it("respeita as permissões de leitura e exportação", async () => {
        jest.mocked(haveActionPermission).mockResolvedValue(false);
        await expect(listAdminPublicationsAction({ types: ["NOTICE"], page: 0, size: 12 })).rejects.toThrow("permissão");
        jest.mocked(haveActionPermission).mockImplementation(async (_module, action) => action === "NOTICE_READ");
        await expect(listAdminPublicationsAction({ types: ["NOTICE"], page: 0, size: 12 })).rejects.toThrow("PUBLICATIONS_EXPORT");
        expect(actionFetchWrapper).not.toHaveBeenCalled();
    });
    it("lista eventos em rascunho sem exigir exportação", async () => {
        jest.mocked(haveActionPermission).mockImplementation(async (_module, action) => action === "EVENT_READ_ADMIN");
        const event = { ...notice, publicationStatus: "DRAFT" };
        jest.mocked(actionFetchWrapper).mockImplementation(async (request) => request.url.includes("?")
            ? { status: 200, data: { content: [event, { ...event, id: 8, publicationStatus: "PUBLISHED" }], last: true } }
            : { status: 200, data: event });
        const result = await listAdminPublicationsAction({ types: ["EVENT"], status: "DRAFT", page: 0, size: 12 });
        expect(result.content).toHaveLength(1);
        expect(result.content[0].status).toBe("DRAFT");
    });
});

describe("CSV administrativo", () => {
    it("trata BOM, ponto e vírgula, aspas escapadas e quebras de linha no conteúdo", () => {
        expect(parsePublicationExportIds('\uFEFF"ID";"Conteúdo"\r\n"7";"Texto; com ""aspas""\ne outra linha"\r\n"8";"Outro"\r\n')).toEqual([7,8]);
    });
    it("rejeita formato inesperado sem retornar uma lista vazia enganosa", () => {
        expect(() => parsePublicationExportIds('<html>404</html>')).toThrow();
        expect(() => parsePublicationExportIds('"ID"\r\n"abc"\r\n')).toThrow();
    });
});
