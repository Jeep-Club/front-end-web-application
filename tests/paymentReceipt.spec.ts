import { z } from "zod";
import { GET } from "@/app/api/payments/[id]/receipt/route";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { fetchWrapper } from "@/services/fetchWrapper/fetchWrapper";
import { haveActionPermission } from "@/utils/permission/actionPermissions";

jest.mock("@/services/fetchWrapper/actionFetchWrapper", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("@/utils/permission/actionPermissions", () => ({ haveActionPermission: jest.fn() }));
const fetchAction = jest.mocked(actionFetchWrapper);
const permission = jest.mocked(haveActionPermission);
const request = () => GET(new Request("http://localhost/api/payments/12/receipt"), { params: Promise.resolve({ id: "12" }) });

describe("consulta protegida de comprovantes", () => {
    beforeEach(() => {
        jest.resetAllMocks();
        permission.mockResolvedValue(true);
    });

    it("nega o comprovante sem permissão de leitura", async () => {
        permission.mockResolvedValue(false);
        expect((await request()).status).toBe(403);
        expect(fetchAction).not.toHaveBeenCalled();
    });

    it("retorna 401 se a sessão de permissões não puder ser validada", async () => {
        permission.mockRejectedValue(new Error("invalid token"));
        expect((await request()).status).toBe(401);
        expect(fetchAction).not.toHaveBeenCalled();
    });

    it.each(["application/pdf", "image/png", "image/jpeg", "image/webp"])("preserva os bytes e o tipo %s, sem cache compartilhado", async type => {
        fetchAction.mockResolvedValue({ status: 200, data: new Blob([new Uint8Array([0, 255, 15, 128])], { type }) });
        const response = await request();
        expect(response.status).toBe(200);
        expect(response.headers.get("Content-Type")).toBe(type);
        expect(response.headers.get("Cache-Control")).toBe("private, no-store");
        expect(Array.from(new Uint8Array(await response.arrayBuffer()))).toEqual([0, 255, 15, 128]);
        expect(fetchAction).toHaveBeenCalledWith(expect.objectContaining({ url: "billing/member-payments/12/receipt", responseType: "blob", cache: "no-store" }));
    });

    it("não serve conteúdo ativo inesperado", async () => {
        fetchAction.mockResolvedValue({ status: 200, data: new Blob(["<script></script>"], { type: "text/html" }) });
        expect((await request()).status).toBe(502);
    });

    it("preserva a negativa de acesso da API", async () => {
        fetchAction.mockRejectedValue({ status: 403, rawData: { status: 403, code: "ACCESS_DENIED", detail: "Acesso negado." } });
        const response = await request();
        expect(response.status).toBe(403);
        expect(await response.json()).toEqual({ message: "Acesso negado." });
    });
});

describe("fetchWrapper com resposta binária", () => {
    afterEach(() => jest.restoreAllMocks());

    it("lê o comprovante como blob, sem converter bytes para texto", async () => {
        jest.spyOn(globalThis, "fetch").mockResolvedValue(new Response(new Uint8Array([0, 255, 128]), { headers: { "Content-Type": "image/png" } }));
        const { data } = await fetchWrapper({ url: "http://localhost/receipt", responseType: "blob", schema: z.instanceof(Blob) });
        expect(Array.from(new Uint8Array(await data.arrayBuffer()))).toEqual([0, 255, 128]);
    });

    it("continua interpretando erros da API como JSON no download", async () => {
        const problem = { status: 404, code: "PAYMENT_RECEIPT_NOT_FOUND", detail: "Comprovante não encontrado." };
        jest.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(problem), { status: 404 }));
        await expect(fetchWrapper({ url: "http://localhost/receipt", responseType: "blob", schema: z.instanceof(Blob) })).rejects.toEqual({ status: 404, rawData: problem });
    });
});
