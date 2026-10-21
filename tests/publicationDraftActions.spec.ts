import { mutateDraftPublicationAction } from "@/actions/publications/draft";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { haveActionPermission } from "@/utils/permission/actionPermissions";
import { draftMutationSchema } from "@/schemas/publications/draft";

jest.mock("@/services/fetchWrapper/actionFetchWrapper", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("@/utils/permission/actionPermissions", () => ({ haveActionPermission: jest.fn() }));

describe("Ações administrativas de rascunhos", () => {
    beforeEach(() => jest.resetAllMocks());
    it.each(["NOTICE", "EVENT"] as const)("edita somente título e conteúdo de %s", async (type) => {
        jest.mocked(haveActionPermission).mockResolvedValue(true);
        jest.mocked(actionFetchWrapper).mockResolvedValueOnce({ status: 200, data: type === "NOTICE" ? { status: "DRAFT" } : { publicationStatus: "DRAFT" } }).mockResolvedValueOnce({ status: 200, data: { id: 7 } });
        await mutateDraftPublicationAction({ id: 7, type, action: "edit", title: "Novo título", content: "<p>Texto</p>" });
        expect(haveActionPermission).toHaveBeenCalledWith("PUBLICATIONS", `${type}_UPDATE`);
        expect(actionFetchWrapper).toHaveBeenLastCalledWith(expect.objectContaining({ url: `admin/${type === "NOTICE" ? "notices" : "events"}/7`, method: "PATCH", body: JSON.stringify({ title: "Novo título", content: "<p>Texto</p>" }) }));
    });
    it.each(["NOTICE", "EVENT"] as const)("publica %s pelo comando específico", async (type) => {
        jest.mocked(haveActionPermission).mockResolvedValue(true);
        jest.mocked(actionFetchWrapper).mockResolvedValueOnce({ status: 200, data: type === "NOTICE" ? { status: "DRAFT" } : { publicationStatus: "DRAFT" } }).mockResolvedValueOnce({ status: 200, data: { id: 7 } });
        await mutateDraftPublicationAction({ id: 7, type, action: "publish" });
        expect(haveActionPermission).toHaveBeenCalledWith("PUBLICATIONS", `${type}_PUBLISH`);
        expect(actionFetchWrapper).toHaveBeenLastCalledWith(expect.objectContaining({ url: `admin/${type === "NOTICE" ? "notices" : "events"}/7/publish`, method: "POST" }));
    });
    it("aceita resposta vazia 204 na exclusão", async () => {
        jest.mocked(haveActionPermission).mockResolvedValue(true);
        jest.mocked(actionFetchWrapper).mockResolvedValueOnce({ status: 200, data: { status: "DRAFT" } }).mockResolvedValueOnce({ status: 204, data: "" });
        await expect(mutateDraftPublicationAction({ id: 7, type: "NOTICE", action: "delete" })).resolves.toEqual({ id: 7, type: "NOTICE", action: "delete" });
        const request = jest.mocked(actionFetchWrapper).mock.calls[1][0];
        expect(request.method).toBe("DELETE");
        expect(request.schema.safeParse("").success).toBe(true);
    });
    it.each(["edit", "publish", "delete"] as const)("bloqueia %s sem a permissão correspondente", async (action) => {
        jest.mocked(haveActionPermission).mockResolvedValue(false);
        await expect(mutateDraftPublicationAction({ id: 7, type: "NOTICE", action, title: "Título", content: "Texto" })).rejects.toThrow("permissão");
        expect(actionFetchWrapper).not.toHaveBeenCalled();
    });
    it("não modifica uma publicação que deixou de ser rascunho", async () => {
        jest.mocked(haveActionPermission).mockResolvedValue(true);
        jest.mocked(actionFetchWrapper).mockResolvedValueOnce({ status: 200, data: { status: "PUBLISHED" } });
        await expect(mutateDraftPublicationAction({ id: 7, type: "NOTICE", action: "delete" })).rejects.toThrow("não é mais um rascunho");
        expect(actionFetchWrapper).toHaveBeenCalledTimes(1);
    });
    it("rejeita edição sem conteúdo visível e tipos que não têm rascunho", () => {
        expect(draftMutationSchema.safeParse({ id: 7, type: "NOTICE", action: "edit", title: "Título", content: "<p><br></p>" }).success).toBe(false);
        expect(draftMutationSchema.safeParse({ id: 7, type: "SERVICE", action: "publish" }).success).toBe(false);
    });
});