import { jsPDF } from "jspdf";

import type { AdminExportFile } from "@/components/common/admin-export/AdminExport";

export interface AdminExportTable { columns: string[]; rows: string[][] }
interface AdminReportOptions { title: string; recordLabel: string; filename: string; exportedBy: string; filters: string[]; seal: string; primaryColumns?: string[] }

const NAVY = "#0c1f4c";
const GOLD = "#fed01b";
const TEXT = "#24324b";
const MUTED = "#64748b";
const MARGIN = 12;
const TABLE_WIDTH = 273;
const PAGE_BOTTOM = 192;

function delimiterOf(header: string) {
    let quoted = false;
    let semicolons = 0;
    let commas = 0;
    for (let index = 0; index < header.length; index++) {
        const character = header[index];
        if (character === '"') {
            if (quoted && header[index + 1] === '"') index++;
            else quoted = !quoted;
        } else if (!quoted && character === ";") semicolons++;
        else if (!quoted && character === ",") commas++;
    }
    return semicolons > commas ? ";" : ",";
}

export function parseAdminCsv(text: string): AdminExportTable {
    const input = text.replace(/^\uFEFF/, "");
    const firstLine = input.split(/\r?\n/, 1)[0] ?? "";
    const delimiter = delimiterOf(firstLine);
    const records: string[][] = [];
    let record: string[] = [];
    let cell = "";
    let quoted = false;
    for (let index = 0; index < input.length; index++) {
        const character = input[index];
        if (character === '"') {
            if (quoted && input[index + 1] === '"') { cell += '"'; index++; }
            else quoted = !quoted;
        } else if (!quoted && character === delimiter) {
            record.push(cell); cell = "";
        } else if (!quoted && (character === "\r" || character === "\n")) {
            record.push(cell);
            if (record.some((value) => value !== "")) records.push(record);
            record = []; cell = "";
            if (character === "\r" && input[index + 1] === "\n") index++;
        } else cell += character;
    }
    if (quoted) throw new Error("A exportação retornou um CSV inválido.");
    if (cell || record.length) { record.push(cell); records.push(record); }
    const columns = records.shift();
    if (!columns?.length || records.some((row) => row.length !== columns.length)) {
        throw new Error("Não foi possível organizar as colunas do relatório.");
    }
    return { columns, rows: records };
}

export function decodeAdminCsv(base64: string) {
    try { return new TextDecoder("utf-8", { fatal: true }).decode(Buffer.from(base64, "base64")); }
    catch { throw new Error("O CSV retornado não está em UTF-8 e não pode ser formatado com segurança."); }
}

function reportGroups(columns: string[], primaryColumns?: string[]) {
    if (primaryColumns?.length) {
        const primary = primaryColumns.map((column) => columns.indexOf(column)).filter((index) => index >= 0).slice(0, 6);
        const used = new Set(primary);
        const remaining = columns.map((_, index) => index).filter((index) => !used.has(index));
        return [primary, ...Array.from({ length: Math.ceil(remaining.length / 6) }, (_, index) => remaining.slice(index * 6, (index + 1) * 6))];
    }
    const used = new Set<number>();
    const primaryMatchers = [/^nome/i, /matr[ií]cula/i, /cpf/i, /e-?mail/i, /telefone/i, /situa[cç][aã]o|status/i];
    const primary = primaryMatchers.flatMap((matcher) => {
        const index = columns.findIndex((column, candidate) => !used.has(candidate) && matcher.test(column));
        if (index < 0) return [];
        used.add(index);
        return [index];
    });
    for (let index = 0; primary.length < 6 && index < columns.length; index++) {
        if (!used.has(index)) { primary.push(index); used.add(index); }
    }
    const remaining = columns.map((_, index) => index).filter((index) => !used.has(index));
    return [primary, ...Array.from({ length: Math.ceil(remaining.length / 6) }, (_, index) => remaining.slice(index * 6, (index + 1) * 6))];
}

function filterSummary(filters: AdminUserSearchParams) {
    const labels: Record<string, string> = {
        id: "ID", name: "Nome", birthDate: "Nascimento", cpf: "CPF", rg: "RG", email: "E-mail",
        phoneNumber: "Telefone", membershipNumber: "Matrícula", status: "Status", createdFrom: "Criado desde",
        createdTo: "Criado até", updatedFrom: "Atualizado desde", updatedTo: "Atualizado até", q: "Busca",
    };
    return Object.entries(filters)
        .filter(([key, value]) => labels[key] && value && !(key === "status" && value === "ALL"))
        .map(([key, value]) => `${labels[key]}: ${value}`);
}

function encodedPdf(pdf: jsPDF) {
    return Buffer.from(pdf.output("arraybuffer")).toString("base64");
}

/** Rebuilds the administrative user CSV as a branded, paginated PDF while preserving all exported columns. */
export async function buildAdminTablePdfFile(data: AdminExportTable, options: AdminReportOptions): Promise<AdminExportFile> {
    const { title, recordLabel, filename, exportedBy, filters, seal, primaryColumns } = options;
    if (data.rows.length > 2000) throw new Error(`O PDF suporta até 2.000 ${recordLabel}. Use CSV ou refine os filtros para reduzir o relatório.`);
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });
    pdf.setProperties({ title, author: "Jeep Clube Tamoios", subject: "Exportação administrativa" });

    const generated = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date());
    const filtersText = filters.join("  ·  ");
    const groups = reportGroups(data.columns, primaryColumns);
    let pageNumber = 0;

    function pageHeader(groupTitle: string, firstPage: boolean) {
        if (pageNumber > 0) pdf.addPage("a4", "landscape");
        pageNumber++;
        pdf.setFillColor(NAVY); pdf.rect(0, 0, 297, 32, "F");
        pdf.addImage(seal, "PNG", MARGIN, 6, 19, 19);
        pdf.setTextColor("#ffffff"); pdf.setFont("helvetica", "bold"); pdf.setFontSize(13);
        pdf.text("JEEP CLUBE TAMOIOS", 36, 14);
        pdf.setFont("helvetica", "normal"); pdf.setFontSize(9);
        pdf.text(title, 36, 22);
        pdf.setFillColor(GOLD); pdf.rect(0, 32, 297, 1.2, "F");
        pdf.setTextColor(TEXT); pdf.setFont("helvetica", "bold"); pdf.setFontSize(10);
        pdf.text(groupTitle, MARGIN, 42);
        pdf.setTextColor(MUTED); pdf.setFont("helvetica", "normal"); pdf.setFontSize(8);
        pdf.text(`${data.rows.length.toLocaleString("pt-BR")} ${recordLabel}  ·  Gerado em ${generated}`, MARGIN, 48);
        if (firstPage) {
            pdf.text(`Exportado por ${exportedBy}`, 285, 42, { align: "right", maxWidth: 115 });
            if (filtersText) {
                const lines = pdf.splitTextToSize(`Filtros: ${filtersText}`, TABLE_WIDTH);
                pdf.text(lines.slice(0, 2), MARGIN, 54, { lineHeightFactor: 1.25 });
                return 54 + Math.min(lines.length, 2) * 4;
            }
            return 54;
        }
        pdf.text(`Exportado por ${exportedBy}`, 285, 48, { align: "right", maxWidth: 115 });
        return 54;
    }

    function drawTableHeader(indices: number[], sizes: number[], top: number) {
        pdf.setFont("helvetica", "bold"); pdf.setFontSize(7);
        const headings = indices.map((index, cell) => pdf.splitTextToSize(data.columns[index], sizes[cell] - 4));
        const height = Math.max(8, Math.max(...headings.map((lines) => lines.length)) * 3.2 + 3);
        pdf.setFillColor(NAVY); pdf.rect(MARGIN, top, TABLE_WIDTH, height, "F"); pdf.setTextColor("#ffffff");
        let x = MARGIN;
        headings.forEach((lines, cell) => { pdf.text(lines, x + 2, top + 4.2, { lineHeightFactor: 1.2 }); x += sizes[cell]; });
        return top + height;
    }

    groups.forEach((indices, groupIndex) => {
        if (!indices.length) return;
        const groupTitle = groupIndex === 0 ? recordLabel.charAt(0).toLocaleUpperCase("pt-BR") + recordLabel.slice(1) : `Dados complementares ${groupIndex}`;
        const weights = indices.map((index) => /nome|e-?mail|endere[cç]o|observa/i.test(data.columns[index]) ? 1.7 : 1);
        const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
        const widths = weights.map((weight) => TABLE_WIDTH * weight / weightSum);
        let y = pageHeader(groupTitle, pageNumber === 0);
        y = drawTableHeader(indices, widths, y + 2);

        if (!data.rows.length) {
            pdf.setTextColor(MUTED); pdf.setFont("helvetica", "normal"); pdf.setFontSize(9);
            pdf.text(`Nenhum registro encontrado com os filtros selecionados.`, MARGIN + 2, y + 10);
            return;
        }

        data.rows.forEach((record, recordIndex) => {
            const values = indices.map((index, cell) => pdf.splitTextToSize(record[index] || "—", widths[cell] - 4));
            const lineCount = Math.max(...values.map((lines) => lines.length));
            const height = Math.max(7, lineCount * 3.1 + 3);
            if (y + height > PAGE_BOTTOM) {
                y = pageHeader(`${groupTitle} · continuação`, false);
                y = drawTableHeader(indices, widths, y + 2);
            }
            pdf.setFillColor(recordIndex % 2 === 0 ? "#ffffff" : "#f3f6fa");
            pdf.setDrawColor("#dce3ec"); pdf.setLineWidth(0.15); pdf.rect(MARGIN, y, TABLE_WIDTH, height, "FD");
            pdf.setFont("helvetica", "normal"); pdf.setFontSize(7); pdf.setTextColor(TEXT);
            let x = MARGIN;
            values.forEach((lines, cell) => {
                pdf.text(lines, x + 2, y + 4, { lineHeightFactor: 1.15 });
                x += widths[cell];
            });
            y += height;
        });
    });

    const pageCount = pdf.getNumberOfPages();
    for (let page = 1; page <= pageCount; page++) {
        pdf.setPage(page); pdf.setDrawColor("#dbe2eb"); pdf.setLineWidth(0.3); pdf.line(MARGIN, 198, 285, 198);
        pdf.setTextColor(MUTED); pdf.setFont("helvetica", "normal"); pdf.setFontSize(7);
        pdf.text("Jeep Clube Tamoios · Documento administrativo", MARGIN, 203);
        pdf.text(`Página ${page} de ${pageCount}`, 285, 203, { align: "right" });
    }

    const cleanFilename = filename.replace(/\.(csv|pdf)$/i, "");
    return { base64: encodedPdf(pdf), contentType: "application/pdf", filename: `${cleanFilename || "relatorio"}.pdf` };
}

export async function buildAdminUsersPdfFile(
    source: Pick<AdminExportFile, "base64" | "filename">,
    filters: AdminUserSearchParams,
    exportedBy: string,
    seal: string,
): Promise<AdminExportFile> {
    return buildAdminTablePdfFile(parseAdminCsv(decodeAdminCsv(source.base64)), {
        title: "Relatório administrativo de usuários",
        recordLabel: "usuário(s)",
        filename: source.filename,
        exportedBy,
        filters: filterSummary(filters),
        seal,
    });
}
