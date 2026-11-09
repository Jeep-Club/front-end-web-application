/** Reads a safe download name from RFC 5987 or quoted Content-Disposition values. */
export function getDownloadFilename(header: string | undefined, fallback: string): string {
    if (!header) return fallback;
    const extended = header.match(/filename\*\s*=\s*UTF-8''([^;]+)/i)?.[1]?.trim();
    const quoted = header.match(/filename\s*=\s*(?:"((?:\\.|[^"\\])*)"|([^;\s]+))/i);
    let filename = fallback;
    if (extended) {
        try { filename = decodeURIComponent(extended.replace(/^"|"$/g, "")); } catch { filename = fallback; }
    } else if (quoted) {
        filename = (quoted[1] ?? quoted[2] ?? fallback).replace(/\\(.)/g, "$1");
    }
    const safe = filename.replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_").replace(/^\.+/, "").trim();
    return safe || fallback;
}
