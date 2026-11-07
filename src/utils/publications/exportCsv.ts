/** CSV administrativo da API: UTF-8 com BOM, separador ; e campos entre aspas. */
export function parsePublicationExportIds(csv: string): number[] {
    const rows: string[][] = [];
    let row: string[] = [], cell = "", quoted = false;
    const text = csv.replace(/^\uFEFF/, "");
    for (let index = 0; index < text.length; index++) {
        const char = text[index];
        if (char === '"') {
            if (quoted && text[index + 1] === '"') { cell += '"'; index++; }
            else quoted = !quoted;
        } else if (!quoted && (char === ";" || char === "\n" || char === "\r")) {
            row.push(cell); cell = "";
            if (char !== ";") {
                if (char === "\r" && text[index + 1] === "\n") index++;
                rows.push(row); row = [];
            }
        } else cell += char;
    }
    if (quoted) throw new Error("A consulta administrativa retornou um CSV inválido.");
    if (cell || row.length) rows.push([...row, cell]);
    if (rows[0]?.[0] !== "ID") throw new Error("A consulta administrativa retornou um formato inesperado.");
    return [...new Set(rows.slice(1).filter((cells) => cells.some(Boolean)).map((cells) => {
        const id = Number(cells[0]);
        if (!Number.isSafeInteger(id) || id <= 0) throw new Error("A consulta administrativa retornou um ID inválido.");
        return id;
    }))];
}