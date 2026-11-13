import { availablePublishedActions } from "@/config/publicationPublishedActions";
import { mutatePublishedPublicationAction } from "@/server/actions/publications/published";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { haveActionPermission } from "@/utils/permission/actionPermissions";

jest.mock("@/services/fetchWrapper/actionFetchWrapper", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("@/utils/permission/actionPermissions", () => ({ haveActionPermission: jest.fn() }));
const permission = (...actions: string[]): PermissionModule[] => [{ module: "PUBLICATIONS", actions }];

describe("Botões de publicações publicadas", () => {
    it("mostra editar, arquivar e excluir no aviso publicado conforme as permissões", () => {
        const publication = { type: "NOTICE" as const, status: "PUBLISHED" };
        expect(availablePublishedActions(publication, permission("NOTICE_UPDATE", "NOTICE_ARCHIVE", "NOTICE_DELETE"))).toEqual(["edit", "archive", "delete"]);
        expect(availablePublishedActions(publication, permission("NOTICE_ARCHIVE"))).toEqual(["archive"]);
        expect(availablePublishedActions(publication, [])).toEqual([]);
    });
    it("não mostra republicar nem ações de publicados em rascunhos", () => {
        expect(availablePublishedActions({ type: "NOTICE", status: "DRAFT" }, permission("NOTICE_UPDATE"))).toEqual([]);
    });
    it("considera o estado operacional dos eventos", () => {
        const permissions = permission("EVENT_UPDATE", "EVENT_CANCEL", "EVENT_FINISH", "EVENT_DELETE");
        expect(availablePublishedActions({ type: "EVENT", status: "PUBLISHED", eventStatus: "OPEN" }, permissions)).toEqual(["edit", "cancel", "delete"]);
        expect(availablePublishedActions({ type: "EVENT", status: "PUBLISHED", eventStatus: "IN_PROGRESS" }, permissions)).toEqual(["edit", "cancel", "finish", "delete"]);
        expect(availablePublishedActions({ type: "EVENT", status: "PUBLISHED", eventStatus: "FINISHED" }, permissions)).toEqual(["edit", "delete"]);
    });
    it("oferece apenas a exclusão administrativa disponível para serviços", () => {
        expect(availablePublishedActions({ type: "SERVICE", status: "PUBLISHED" }, permission("SERVICE_ADMIN_DELETE"))).toEqual(["delete"]);
    });
});

describe("Comandos de publicações publicadas", () => {
    beforeEach(() => { jest.resetAllMocks(); jest.mocked(haveActionPermission).mockResolvedValue(true); });
    it("arquiva aviso com a permissão e rota específicas", async () => {
        jest.mocked(actionFetchWrapper).mockResolvedValueOnce({ status: 200, data: { status: "PUBLISHED" } }).mockResolvedValueOnce({ status: 200, data: { id: 7 } });
        await mutatePublishedPublicationAction({ id: 7, type: "NOTICE", action: "archive" });
        expect(haveActionPermission).toHaveBeenCalledWith("PUBLICATIONS", "NOTICE_ARCHIVE");
        expect(actionFetchWrapper).toHaveBeenLastCalledWith(expect.objectContaining({ url: "admin/notices/7/archive", method: "POST" }));
    });
    it("edita título e conteúdo de aviso já publicado", async () => {
        jest.mocked(actionFetchWrapper).mockResolvedValueOnce({ status: 200, data: { status: "PUBLISHED" } }).mockResolvedValueOnce({ status: 200, data: { id: 7 } });
        await mutatePublishedPublicationAction({ id: 7, type: "NOTICE", action: "edit", title: "Atualizado", content: "<p>Texto</p>" });
        expect(actionFetchWrapper).toHaveBeenLastCalledWith(expect.objectContaining({ url: "admin/notices/7", method: "PATCH", body: JSON.stringify({ title: "Atualizado", content: "<p>Texto</p>" }) }));
    });
    it("exclui serviços pela rota administrativa", async () => {
        jest.mocked(actionFetchWrapper).mockResolvedValueOnce({ status: 200, data: { status: "PUBLISHED" } }).mockResolvedValueOnce({ status: 204, data: "" });
        await mutatePublishedPublicationAction({ id: 7, type: "SERVICE", action: "delete" });
        expect(haveActionPermission).toHaveBeenCalledWith("PUBLICATIONS", "SERVICE_ADMIN_DELETE");
        expect(actionFetchWrapper).toHaveBeenLastCalledWith(expect.objectContaining({ url: "admin/services/7", method: "DELETE" }));
    });
    it("bloqueia ações sem a permissão", async () => {
        jest.mocked(haveActionPermission).mockResolvedValue(false);
        await expect(mutatePublishedPublicationAction({ id: 7, type: "NOTICE", action: "delete" })).rejects.toThrow("permissão");
        expect(actionFetchWrapper).not.toHaveBeenCalled();
    });
    it("bloqueia publicação que mudou de estado", async () => {
        jest.mocked(actionFetchWrapper).mockResolvedValue({ status: 200, data: { status: "ARCHIVED" } });
        await expect(mutatePublishedPublicationAction({ id: 7, type: "NOTICE", action: "archive" })).rejects.toThrow("mudou");
        expect(actionFetchWrapper).toHaveBeenCalledTimes(1);
    });
    it("não encerra evento antes do início", async () => {
        jest.mocked(actionFetchWrapper).mockResolvedValue({ status: 200, data: { publicationStatus: "PUBLISHED", eventStatus: "OPEN" } });
        await expect(mutatePublishedPublicationAction({ id: 7, type: "EVENT", action: "finish" })).rejects.toThrow("em andamento");
        expect(actionFetchWrapper).toHaveBeenCalledTimes(1);
    });
});

it('oferece ações operacionais em DRAFT e exclusão de arquivados', () => {
    expect(availablePublishedActions({ type: 'EVENT', status: 'DRAFT', eventStatus: 'IN_PROGRESS' }, permission('EVENT_FINISH', 'EVENT_CANCEL'))).toEqual(['cancel', 'finish']);
    expect(availablePublishedActions({ type: 'NOTICE', status: 'ARCHIVED' }, permission('NOTICE_UPDATE', 'NOTICE_ARCHIVE', 'NOTICE_DELETE'))).toEqual(['delete']);
});
it('comando não impõe READ à permission de decisão e aceita DELETE 204 undefined', async () => {
    jest.resetAllMocks();
    jest.mocked(haveActionPermission).mockImplementation(async (_, action) => action === 'SERVICE_ADMIN_DELETE');
    jest.mocked(actionFetchWrapper).mockResolvedValue({ status: 204, data: undefined });
    await expect(mutatePublishedPublicationAction({ id: 7, type: 'SERVICE', action: 'delete' })).resolves.toEqual({ id: 7, type: 'SERVICE', action: 'delete' });
    expect(actionFetchWrapper).toHaveBeenCalledTimes(1);
});
it('repete cancelamento operacional CANCELLED conforme idempotência do backend', async () => {
    jest.resetAllMocks();
    jest.mocked(haveActionPermission).mockResolvedValue(true);
    jest.mocked(actionFetchWrapper).mockResolvedValueOnce({ status: 200, data: { publicationStatus: 'DRAFT', eventStatus: 'CANCELLED' } }).mockResolvedValueOnce({ status: 200, data: { id: 7 } });
    await expect(mutatePublishedPublicationAction({ id: 7, type: 'EVENT', action: 'cancel' })).resolves.toEqual({ id: 7, type: 'EVENT', action: 'cancel' });
    expect(actionFetchWrapper).toHaveBeenLastCalledWith(expect.objectContaining({ url: 'admin/events/7/cancel', method: 'POST' }));
});
