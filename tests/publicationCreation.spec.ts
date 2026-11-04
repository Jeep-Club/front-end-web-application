import { createPublicationSchema } from "@/schemas/publications/create";
import { createPublicationAction } from "@/server/actions/publications/create";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { haveActionPermission } from "@/utils/permission/actionPermissions";

jest.mock("@/services/fetchWrapper/actionFetchWrapper", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("@/utils/permission/actionPermissions", () => ({ haveActionPermission: jest.fn() }));
const base = { title: "Publicação", content: "Conteúdo", images: [{ storageKey: "images/example.jpg", position: 0, primary: true }] };
const event = { ...base, type: "EVENT" as const, startsAt: "2099-11-15T11:00:00Z", endsAt: null };

describe("Criação de publicações", () => {
    beforeEach(() => { jest.resetAllMocks(); });

    it("rejeita galeria sem capa ou com imagens duplicadas", () => {
        expect(createPublicationSchema.safeParse({ ...base, type: "NOTICE", images: [{ ...base.images[0], primary: false }] }).success).toBe(false);
        expect(createPublicationSchema.safeParse({ ...base, type: "NOTICE", images: [...base.images, { ...base.images[0], position: 1, primary: false }] }).success).toBe(false);
    });
    it("rejeita evento passado e término anterior ao início", () => {
        expect(createPublicationSchema.safeParse({ ...event, startsAt: "2000-01-01T00:00:00Z" }).success).toBe(false);
        expect(createPublicationSchema.safeParse({ ...event, endsAt: "2099-11-14T11:00:00Z" }).success).toBe(false);
    });
    it("rejeita serviço sem telefone ou com valor inválido", () => {
        expect(createPublicationSchema.safeParse({ ...base, type: "SERVICE", amount: 0, contactPhone: "" }).success).toBe(false);
    });
    it("bloqueia no servidor a criação sem permissão", async () => {
        jest.mocked(haveActionPermission).mockResolvedValue(false);
        await expect(createPublicationAction(event)).rejects.toThrow("permissão");
        expect(actionFetchWrapper).not.toHaveBeenCalled();
    });
    it.each([
        [event, "EVENT_CREATE", "admin/events"],
        [{ ...base, type: "NOTICE" as const }, "NOTICE_CREATE", "admin/notices"],
        [{ ...base, type: "SERVICE" as const, amount: 10, contactPhone: "12999999999" }, "SERVICE_REQUEST_CREATE", "service-publication-requests"],
    ] as const)("envia somente os campos do contrato para o endpoint do tipo", async (input, permission, endpoint) => {
        jest.mocked(haveActionPermission).mockResolvedValue(true);
        jest.mocked(actionFetchWrapper).mockResolvedValue({ status: 201, data: { id: 1 } });
        await createPublicationAction(input);
        expect(haveActionPermission).toHaveBeenCalledWith("PUBLICATIONS", permission);
        expect(actionFetchWrapper).toHaveBeenCalledWith(expect.objectContaining({ url: endpoint, method: "POST" }));
        const request = jest.mocked(actionFetchWrapper).mock.calls[0][0];
        expect(JSON.parse(request.body as string)).not.toHaveProperty("type");
    });
});
