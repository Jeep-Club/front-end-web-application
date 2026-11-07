import { jsPDF } from "jspdf";
import { billingLabels } from "@/components/pages/admin/gestao-financeira/billingDisplay";

export type FinancialReportKind = "definitions" | "cycles" | "member-charges" | "payments" | "refunds";
export interface FinancialReportData { columns: string[]; rows: string[][] }
const titles: Record<FinancialReportKind, string> = { definitions: "Definições e atribuições de cobrança", cycles: "Ciclos de cobrança", "member-charges": "Cobranças dos associados", payments: "Pagamentos", refunds: "Reembolsos" };

/** Parse semicolon CSV with quoted multiline values and escaped quotes. */
export function parseFinancialCsv(text: string): FinancialReportData {
    const input = text.replace(/^\uFEFF/, "");
    const rows: string[][] = [];
    let row: string[] = [], cell = "", quoted = false;
    for (let i = 0; i < input.length; i++) {
        const character = input[i];
        if (character === '"') {
            if (quoted && input[i + 1] === '"') { cell += '"'; i++; }
            else quoted = !quoted;
        } else if (!quoted && character === ";") { row.push(cell); cell = ""; }
        else if (!quoted && (character === "\r" || character === "\n")) {
            row.push(cell); if (row.some((value) => value !== "")) rows.push(row);
            row = []; cell = ""; if (character === "\r" && input[i + 1] === "\n") i++;
        } else cell += character;
    }
    if (quoted) throw new Error("O relatório retornou um CSV inválido.");
    if (cell || row.length) { row.push(cell); rows.push(row); }
    const columns = rows.shift();
    if (!columns?.length || rows.some((record) => record.length !== columns.length)) throw new Error("Os campos do relatório estão inconsistentes.");
    return { columns, rows };
}

export function normalizeFinancialReport(data: FinancialReportData): FinancialReportData {
    return { columns: data.columns, rows: data.rows.map((row) => row.map((value, index) => {
        const column = data.columns[index];
        if (column === "Tipo de público") {
            if (value === "Todos os membros") return "Todos os associados";
            if (value === "Usuário") return "Usuário específico";
        }
        if (/situação|recorrência|política|método/i.test(column) || column === "Tipo de público" || column === "Motivo") return billingLabels[value] ?? value;
        return value;
    })) };
}

export function serializeFinancialCsv(data: FinancialReportData): string {
    const escaped = (value: string) => {
        const protectedValue = /^\s*[=+@-]/.test(value) || /^[\t\r\n]/.test(value) ? `'${value}` : value;
        return `"${protectedValue.replace(/"/g, '""')}"`;
    };
    return "\uFEFF" + [data.columns, ...data.rows].map((row) => row.map(escaped).join(";")).join("\r\n") + "\r\n";
}

/** Full-data financial tables; rows continue across pages with repeated column headers. */
export function buildFinancialReportPdf(kind: FinancialReportKind, raw: FinancialReportData, filters: Record<string, string> = {}, generated = new Date()): jsPDF {
    const data = normalizeFinancialReport(raw);
    if (data.rows.length > 500) throw new Error("O PDF suporta até 500 registros. Refine os filtros ou exporte em CSV.");
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });
    pdf.setProperties({ title: titles[kind], author: "Jeep Clube Tamoios", subject: "Relatório financeiro" });
    const NAVY = "#0c1f4c", GRAY = "#64748b", MARGIN = 12, WIDTH = 273, BOTTOM = 194, LINE = 4;
    let y = 0;
    const generatedLabel = generated.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
    function page(first = false) {
        if (!first) pdf.addPage("a4", "landscape");
        if (pdf.getNumberOfPages() > 1000) throw new Error("O relatório ficou muito extenso. Refine os filtros.");
        pdf.setFillColor(NAVY); pdf.rect(MARGIN, 10, WIDTH, 21, "F");
        pdf.setTextColor("#ffffff"); pdf.setFont("helvetica", "bold"); pdf.setFontSize(13);
        pdf.text("JEEP CLUBE TAMOIOS", MARGIN + 5, 18);
        pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.text(titles[kind], MARGIN + 5, 26);
        pdf.setFillColor("#fed01b"); pdf.rect(MARGIN, 31, WIDTH, 1, "F");
        pdf.setTextColor(GRAY); pdf.setFontSize(8); pdf.text(`Gerado em ${generatedLabel} | ${data.rows.length} registro(s)`, MARGIN, 39);
        y = 47;
    }
    const numeric = (column: string) => /^Valor/.test(column);
    function display(column: string, value: string) {
        if (!value) return "-";
        if (numeric(column) && /^\d+(?:[.,]\d+)?$/.test(value)) return Number(value.replace(",", ".")).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }).replace(/\u00a0/g, " ");
        return value;
    }
    function widths(columns: number[]) {
        const weights = columns.map((index) => data.columns[index] === "ID" ? 0.45 : /Nome|Descrição|Observações|Motivo|Política/.test(data.columns[index]) ? 1.9 : 1.25);
        const sum = weights.reduce((a, b) => a + b, 0);
        return weights.map((weight) => WIDTH * weight / sum);
    }
    function heading(title: string, columns: number[], sizes: number[]) {
        pdf.setTextColor(NAVY); pdf.setFont("helvetica", "bold"); pdf.setFontSize(10); pdf.text(title, MARGIN, y); y += 6;
        pdf.setFontSize(8);
        const cells: string[][] = columns.map((column, index) => pdf.splitTextToSize(data.columns[column], sizes[index] - 5));
        const height = Math.max(...cells.map((cell) => cell.length)) * LINE + 4;
        pdf.setFillColor(NAVY); pdf.rect(MARGIN, y, WIDTH, height, "F"); pdf.setTextColor("#ffffff");
        let x = MARGIN;
        cells.forEach((cell, index) => { pdf.text(cell, x + 2.5, y + 4, { lineHeightFactor: 1.42 }); x += sizes[index]; });
        y += height;
    }
    function table(title: string, columns: number[]) {
        if (columns.length === 0) return;
        const sizes = widths(columns);
        if (y > BOTTOM - 34) page();
        heading(title, columns, sizes);
        if (!data.rows.length) { pdf.setFont("helvetica", "normal"); pdf.setTextColor(GRAY); pdf.text("Nenhum registro encontrado para os filtros informados.", MARGIN + 3, y + 8); y += 20; return; }
        data.rows.forEach((row, record) => {
            pdf.setFont("helvetica", "normal"); pdf.setFontSize(8);
            const cells: string[][] = columns.map((column, index) => pdf.splitTextToSize(display(data.columns[column], row[column]), sizes[index] - 5));
            const lines = Math.max(...cells.map((cell) => cell.length));
            let start = 0;
            while (start < lines) {
                if (y > BOTTOM - 9) { page(); heading(`${title} (continuação)`, columns, sizes); }
                const count = Math.min(lines - start, Math.max(1, Math.floor((BOTTOM - y - 4) / LINE)));
                const height = count * LINE + 4;
                let x = MARGIN;
                pdf.setFont("helvetica", "normal"); pdf.setFontSize(8); pdf.setTextColor(NAVY);
                cells.forEach((cell, index) => {
                    pdf.setFillColor(record % 2 === 0 ? "#ffffff" : "#f3f6fa"); pdf.setDrawColor("#dce3ec"); pdf.setLineWidth(0.15); pdf.rect(x, y, sizes[index], height, "FD");
                    for (let line = 0; line < count; line++) {
                        const text = data.columns[columns[index]] === "ID" && start > 0 && line === 0 ? cell[0] : cell[start + line] ?? "";
                        pdf.text(text, numeric(data.columns[columns[index]]) ? x + sizes[index] - 2.5 : x + 2.5, y + 4 + line * LINE, { align: numeric(data.columns[columns[index]]) ? "right" : "left" });
                    }
                    x += sizes[index];
                });
                y += height; start += count;
            }
        });
        y += 9;
    }
    page(true);
    const filterNames: Record<string, string> = { id: "Registro", userId: "Associado", chargeDefinitionId: "Definição", chargeCycleId: "Ciclo", eventId: "Evento", recurrence: "Recorrência", year: "Ano", month: "Mês", status: "Situação", paymentMethod: "Forma de pagamento", chargeStatus: "Situação da cobrança", effectiveStatus: "Situação efetiva", dueFrom: "Vencimento desde", dueTo: "Vencimento até", from: "Período desde", to: "Período até" };
    const labels = Object.entries(filters).filter(([, value]) => value).map(([key, value]) => `${filterNames[key] ?? key}: ${billingLabels[value] ?? value}`);
    if (labels.length) {
        pdf.setTextColor(GRAY); pdf.setFontSize(8);
        const wrapped: string[] = pdf.splitTextToSize(labels.join(" | "), WIDTH);
        for (const line of wrapped) { if (y > BOTTOM - 35) page(); pdf.text(line, MARGIN, y); y += LINE; }
        y += 5;
    }
    const selected: Record<FinancialReportKind, string[]> = {
        definitions: ["ID", "Nome", "Valor padrão", "Recorrência", "Obrigatória", "Política de pagamento", "Situação"],
        cycles: ["ID", "Nome da definição na geração", "Código do ciclo", "Vencimento", "Situação", "Gerado em"],
        "member-charges": ["ID", "Nome do usuário", "Definição na geração", "Valor final", "Vencimento", "Situação efetiva da cobrança"],
        payments: ["ID", "Nome do usuário", "ID da cobrança", "Valor", "Método de pagamento", "Situação", "Pago em"],
        refunds: ["ID", "Nome do usuário", "ID do pagamento", "Valor", "Motivo", "Situação", "Elegível até"],
    };
    let primary = selected[kind].map((column) => data.columns.indexOf(column)).filter((index) => index >= 0);
    if (!primary.length) primary = data.columns.slice(0, 6).map((_, index) => index);
    table("Visão geral", primary);
    const extra = data.columns.map((_, index) => index).filter((index) => !primary.includes(index));
    if (data.rows.length) for (let offset = 0; offset < extra.length; offset += 6) {
        const id = data.columns.indexOf("ID");
        table(`Dados complementares - ${Math.floor(offset / 6) + 1}`, [...(id >= 0 ? [id] : []), ...extra.slice(offset, offset + 6)]);
    }
    const pages = pdf.getNumberOfPages();
    for (let pageNumber = 1; pageNumber <= pages; pageNumber++) {
        pdf.setPage(pageNumber); pdf.setFont("helvetica", "normal"); pdf.setFontSize(7); pdf.setTextColor(GRAY);
        pdf.text("Jeep Clube Tamoios | Relatório financeiro", MARGIN, 203);
        pdf.text(`Página ${pageNumber} de ${pages}`, 285, 203, { align: "right" });
    }
    return pdf;
}

export function decodeFinancialCsv(base64: string) {
    return parseFinancialCsv(new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(atob(base64), (character) => character.charCodeAt(0))));
}

export function downloadFinancialReport(kind: FinancialReportKind, format: "CSV" | "PDF", data: FinancialReportData, filters: Record<string, string>) {
    const filename = `financeiro-${kind}-${new Date().toLocaleDateString("sv-SE")}`;
    if (format === "PDF") { buildFinancialReportPdf(kind, data, filters).save(`${filename}.pdf`); return; }
    const url = URL.createObjectURL(new Blob([serializeFinancialCsv(normalizeFinancialReport(data))], { type: "text/csv;charset=UTF-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${filename}.csv`;
    document.body.appendChild(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
