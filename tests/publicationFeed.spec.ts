import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { listPublicationFeedAction, getPublicationFeedDetailAction, setPublicationLikeAction, listPublicationCommentsAction, createPublicationCommentAction } from "@/actions/publications/feed";
import { publicationFeedItemSchema, publicationFeedDetailSchema } from "@/schemas/publications/feed";
import { renderPublicationContent } from "@/utils/publications/renderContent";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { haveActionPermission } from "@/utils/permission/actionPermissions";

jest.mock("@/services/fetchWrapper/actionFetchWrapper", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("@/utils/permission/actionPermissions", () => ({ haveActionPermission: jest.fn() }));
const item = { id: 7, authorUserId: 1, title: "Aviso", content: "<p>Publicado</p>", type: "NOTICE", primaryImage: null, publishedAt: "2026-10-20T12:00:00Z", likeCount: 0, commentCount: 0, likedByMe: false, details: {} };

describe("Feed de publicações", () => {
    beforeEach(() => { jest.resetAllMocks(); jest.mocked(haveActionPermission).mockResolvedValue(true); });
    it("busca todos os publicados com paginação nativa, sem exportação", async () => {
        jest.mocked(actionFetchWrapper).mockResolvedValue({ status: 200, data: { content: [item] } });
        await listPublicationFeedAction({ page: 0, size: 12 });
        expect(haveActionPermission).toHaveBeenCalledWith("PUBLICATIONS", "FEED_READ");
        expect(actionFetchWrapper).toHaveBeenCalledWith(expect.objectContaining({ url: "publications/feed?page=0&size=12", cache: "no-store" }));
    });
    it("envia o filtro do tipo e preserva a paginação", async () => {
        jest.mocked(actionFetchWrapper).mockResolvedValue({ status: 200, data: {} });
        await listPublicationFeedAction({ type: "EVENT", page: 2, size: 24 });
        expect(actionFetchWrapper).toHaveBeenCalledWith(expect.objectContaining({ url: "publications/feed?page=2&size=24&type=EVENT" }));
    });
    it("bloqueia consultas sem permissão", async () => {
        jest.mocked(haveActionPermission).mockResolvedValue(false);
        await expect(listPublicationFeedAction({ page: 0, size: 12 })).rejects.toThrow("permissão");
        expect(actionFetchWrapper).not.toHaveBeenCalled();
    });
    it("valida detalhes específicos dos três tipos e a galeria completa", () => {
        expect(publicationFeedItemSchema.safeParse(item).success).toBe(true);
        expect(publicationFeedItemSchema.parse({ ...item, type: "EVENT", details: { startsAt: "2026-11-20T12:00:00Z", endsAt: null, status: "OPEN" } }).details).toHaveProperty("startsAt");
        expect(publicationFeedItemSchema.parse({ ...item, type: "SERVICE", details: { amount: 10, contactPhone: "12999999999" } }).details).toHaveProperty("amount", 10);
        expect(publicationFeedDetailSchema.safeParse({ ...item, images: [{ storageKey: "images/photo.jpg", position: 0, primary: true }] }).success).toBe(true);
    });
    it("consulta o detalhe publicado sem usar a rota administrativa", async () => {
        jest.mocked(actionFetchWrapper).mockResolvedValue({ status: 200, data: {} });
        await getPublicationFeedDetailAction(7);
        expect(haveActionPermission).toHaveBeenCalledWith("PUBLICATIONS", "PUBLICATION_READ");
        expect(actionFetchWrapper).toHaveBeenCalledWith(expect.objectContaining({ url: "publications/7" }));
    });
    it("curte e remove a própria curtida usando os comandos da API", async () => {
        jest.mocked(actionFetchWrapper).mockResolvedValue({ status: 200, data: {} });
        await setPublicationLikeAction({ id: 7, like: true });
        expect(actionFetchWrapper).toHaveBeenLastCalledWith(expect.objectContaining({ url: "publications/7/likes", method: "POST" }));
        await setPublicationLikeAction({ id: 7, like: false });
        const request = jest.mocked(actionFetchWrapper).mock.calls[1][0];
        expect(request.url).toBe("publications/7/likes/me");
        expect(request.method).toBe("DELETE");
        expect(request.schema.safeParse("").success).toBe(true);
    });
    it("lista e cria comentários, rejeitando texto vazio", async () => {
        jest.mocked(actionFetchWrapper).mockResolvedValue({ status: 200, data: {} });
        await listPublicationCommentsAction({ id: 7, page: 1 });
        expect(actionFetchWrapper).toHaveBeenLastCalledWith(expect.objectContaining({ url: "publications/7/comments?page=1&size=10" }));
        await createPublicationCommentAction({ id: 7, text: " Olá " });
        expect(actionFetchWrapper).toHaveBeenLastCalledWith(expect.objectContaining({ url: "publications/7/comments", method: "POST", body: JSON.stringify({ text: "Olá", images: [] }) }));
        await expect(createPublicationCommentAction({ id: 7, text: " " })).rejects.toThrow();
    });
});

describe("Leitura de conteúdo formatado", () => {
    const html = (content: string) => renderToStaticMarkup(createElement("div", {}, ...renderPublicationContent(content)));
    it("preserva títulos, listas e negrito", () => {
        expect(html("<h2>Título</h2><ul><li><strong>Texto</strong></li></ul>")).toContain("<h2>Título</h2><ul><li><strong>Texto</strong></li></ul>");
    });
    it("descarta scripts, atributos executáveis, estilos e links inseguros", () => {
        const result = html('<p onclick="alert(1)" style="color:red">Texto</p><script>alert(1)</script><img src=x onerror=alert(1)><a href="javascript:alert(1)">Link</a>');
        expect(result).toBe("<div><p>Texto</p>Link</div>");
    });
    it("permite links seguros e protege o destino em nova aba", () => {
        expect(html('<a href="https://example.com" onclick="alert(1)">Visitar</a>')).toContain('href="https://example.com" target="_blank" rel="noopener noreferrer nofollow"');
    });
    it("mantém o texto legado e suas quebras de linha", () => {
        expect(html("Linha 1\nLinha 2 & 3")).toBe("<div><p>Linha 1</p><p>Linha 2 &amp; 3</p></div>");
    });
});