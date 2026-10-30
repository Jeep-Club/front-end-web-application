import { publicationEditorHtml, publicationPlainText } from "@/utils/publications/content";
import { createPublicationSchema } from "@/schemas/publications/create";

const notice = { type: "NOTICE", title: "Aviso", images: [{ storageKey: "images/2026/10/30/550e8400-e29b-41d4-a716-446655440000.jpg", position: 0, primary: true }] };

describe("Conteúdo formatado de publicações", () => {
    it("salva títulos, negrito e listas no campo content", () => {
        const content = '<h1>Encontro</h1><p>Saída às <strong>8h</strong>.</p><ul><li>Água</li><li>Lanche</li></ul>';
        const result = createPublicationSchema.parse({ ...notice, content });
        expect(result.content).toBe(content);
        expect(publicationPlainText(content)).toBe("Encontro Saída às 8h. Água Lanche");
    });
    it.each(['<p></p>', '<p><br></p>', '<h2>&nbsp;</h2>', '<p><strong> </strong></p>', '<script>alert(1)</script>'])("rejeita conteúdo sem texto visível: %s", (content) => {
        expect(createPublicationSchema.safeParse({ ...notice, content }).success).toBe(false);
    });
    it("extrai texto sem código de script ou estilo e decodifica entidades", () => {
        expect(publicationPlainText('<p>A &amp; B</p><script>alert(1)</script><style>p{color:red}</style><p>Texto &lt;seguro&gt;</p>')).toBe("A & B Texto <seguro>");
    });
    it("mantém conteúdo legado em texto simples e suas quebras no editor", () => {
        expect(publicationEditorHtml('Linha 1\nLinha 2 & 3 < 4')).toBe('<p>Linha 1</p><p>Linha 2 &amp; 3 &lt; 4</p>');
        expect(publicationPlainText('Texto simples\nOutra linha')).toBe('Texto simples Outra linha');
    });
    it("mantém HTML formatado ao reabrir o conteúdo", () => {
        const html = '<h5>Título</h5><p><em>Texto</em></p>';
        expect(publicationEditorHtml(html)).toBe(html);
    });
});