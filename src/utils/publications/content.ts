import { Parser } from "htmlparser2";

const HTML_CONTENT = /<\/?(?:p|br|h[1-6]|strong|b|em|i|u|s|strike|ul|ol|li|blockquote|pre|code|hr|a|div|span|script|style|img|iframe)\b[^>]*>/i;
const BLOCKS = new Set(["p", "br", "div", "h1", "h2", "h3", "h4", "h5", "h6", "li", "blockquote", "pre", "hr"]);
const HIDDEN = new Set(["script", "style", "iframe"]);

export function publicationPlainText(content: string): string {
    if (!HTML_CONTENT.test(content)) return content.replace(/\s+/g, " ").trim();
    const text: string[] = [];
    let hidden = 0;
    const parser = new Parser({
        onopentag(name) {
            if (HIDDEN.has(name)) hidden++;
            if (!hidden && BLOCKS.has(name)) text.push(" ");
        },
        ontext(value) { if (!hidden) text.push(value); },
        onclosetag(name) {
            if (HIDDEN.has(name)) hidden = Math.max(0, hidden - 1);
            if (!hidden && BLOCKS.has(name)) text.push(" ");
        },
    }, { decodeEntities: true });
    parser.write(content);
    parser.end();
    return text.join("").replace(/[\s\u200B\uFEFF]+/g, " ").trim();
}

/** Preserva quebras de linha de conteúdo legado quando aberto no editor visual. */
export function publicationEditorHtml(content: string): string {
    if (!content.trim() || HTML_CONTENT.test(content)) return content;
    const escaped = content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    return escaped.split(/\r?\n/).map((line) => `<p>${line}</p>`).join("");
}