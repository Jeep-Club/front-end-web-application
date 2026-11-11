import { createPublicationSchema, eventLocalDateTime, publicationFormSchema } from "@/schemas/publications/create";
import { createPublicationAction } from "@/server/actions/publications/create";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { haveActionPermission } from "@/utils/permission/actionPermissions";

jest.mock("@/services/fetchWrapper/actionFetchWrapper", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("@/utils/permission/actionPermissions", () => ({ haveActionPermission: jest.fn() }));
const base = { title: "Publicação", content: "Conteúdo", images: [{ storageKey: "images/example.jpg", position: 0, primary: true }] };
const event = { ...base, type: "EVENT" as const, startsAt: "2099-11-15T11:00:00Z", endsAt: null };
const eventForm = { type: "EVENT", title: "Evento", content: "Conteúdo", photos: [new File(["image"], "event.png", { type: "image/png" })], primaryIndex: "0", startDate: "2099-11-15", startTime: "11:00", endDate: "", endTime: "", amount: "", chargeName: "Entrada", chargeDescription: "", contactPhone: "" };

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
    it("exige data e horário de início e aceita término opcional completo", () => {
        expect(publicationFormSchema.safeParse(eventForm).success).toBe(true);
        expect(publicationFormSchema.safeParse({ ...eventForm, startTime: "" }).error?.issues).toEqual(expect.arrayContaining([expect.objectContaining({ path: ["startTime"] })]));
        expect(publicationFormSchema.safeParse({ ...eventForm, startDate: "" }).error?.issues).toEqual(expect.arrayContaining([expect.objectContaining({ path: ["startDate"] })]));
        expect(publicationFormSchema.safeParse({ ...eventForm, endDate: "2099-11-16" }).error?.issues).toEqual(expect.arrayContaining([expect.objectContaining({ path: ["endTime"] })]));
        expect(publicationFormSchema.safeParse({ ...eventForm, endTime: "12:00" }).error?.issues).toEqual(expect.arrayContaining([expect.objectContaining({ path: ["endDate"] })]));
        expect(publicationFormSchema.safeParse({ ...eventForm, endDate: "2099-11-14", endTime: "12:00" }).success).toBe(false);
        expect(publicationFormSchema.safeParse({ ...eventForm, endDate: "2099-11-16", endTime: "12:00" }).success).toBe(true);
        expect(eventLocalDateTime(eventForm.startDate, eventForm.startTime)?.toISOString()).toBe(new Date("2099-11-15T11:00").toISOString());
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
