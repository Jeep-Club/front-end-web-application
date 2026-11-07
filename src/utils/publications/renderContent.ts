import { createElement, type ReactNode } from "react";
import { parseDocument } from "htmlparser2";
import { publicationEditorHtml } from "./content";

const allowed = new Set(["p", "br", "h1", "h2", "h3", "h4", "h5", "h6", "strong", "b", "em", "i", "u", "s", "strike", "ul", "ol", "li", "blockquote", "pre", "code", "hr"]);
const hidden = new Set(["script", "style", "iframe", "object", "embed", "svg", "math", "template"]);
function safeHref(value: string | undefined) {
    if (!value) return undefined;
    try { return ["https:", "http:", "mailto:", "tel:"].includes(new URL(value).protocol) ? value : undefined; }
    catch { return undefined; }
}

/** Converte conteúdo em elementos React permitidos, sem inserir HTML bruto. */
export function renderPublicationContent(content: string): ReactNode[] {
    function render(nodes: ReturnType<typeof parseDocument>["children"], prefix: string): ReactNode[] {
        return nodes.map((node, index) => {
            if (node.type === "text") return node.data;
            if (node.type !== "tag" || hidden.has(node.name)) return null;
            const key = `${prefix}-${index}`;
            const children = render(node.children, key);
            if (node.name === "a") {
                const href = safeHref(node.attribs.href);
                return href ? createElement("a", { key, href, target: "_blank", rel: "noopener noreferrer nofollow" }, ...children) : children;
            }
            if (!allowed.has(node.name)) return children;
            return createElement(node.name, { key }, ...children);
        });
    }
    return render(parseDocument(publicationEditorHtml(content)).children, "content");
}