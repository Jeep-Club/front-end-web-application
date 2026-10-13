import { buildFinancialReportPdf, normalizeFinancialReport, parseFinancialCsv, serializeFinancialCsv } from "@/utils/financial-export/report";
import { writeFileSync } from "node:fs";

const columns = ["ID", "Nome", "Descrição", "Valor padrão", "Recorrência", "Obrigatória", "Política de pagamento", "Dias de tolerância", "Situação", "Criado em", "Atualizado em", "Arquivado em", "ID da atribuição", "Tipo de público", "Atribuição ativa", "Atribuição criada em", "Atribuição atualizada em", "ID do alvo", "Nome do usuário", "CPF do usuário", "Nome do papel", "Título do evento", "Início do evento"];
const record = ["1", "jipe clube fest", "", "100,00", "ONE_TIME", "Não", "UNTIL_DUE_DATE", "", "ACTIVE", "13/10/2026 16:37:59 -03:00", "", "", "", "Sem atribuição", "", "", "", "", "", "", "", "", ""];

it("reads accented CSV values, escaped quotes, separators and multiline descriptions", () => {
    const data = parseFinancialCsv('\uFEFF"Nome";"Descrição"\r\n"São Paulo";"Evento; com \"\"aspas\"\"\nsegunda linha"\r\n');
    expect(data.rows).toEqual([["São Paulo", 'Evento; com "aspas"\nsegunda linha']]);
    expect(parseFinancialCsv(serializeFinancialCsv(data))).toEqual(data);
});

it("normalizes only financial code columns and preserves user-entered names", () => {
    const data = normalizeFinancialReport({ columns, rows: [record] });
    expect(data.rows[0][4]).toBe("Cobrança única");
    expect(data.rows[0][6]).toBe("Até o vencimento");
    expect(data.rows[0][8]).toBe("Ativa");
    expect(normalizeFinancialReport({ columns: ["Nome", "Descrição", "Método de pagamento"], rows: [["ACTIVE", "PIX", "BANK_TRANSFER"]] }).rows[0]).toEqual(["ACTIVE", "PIX", "Transferência bancária"]);
});

it("retains spreadsheet formula protection when rewriting the CSV", () => {
    const csv = serializeFinancialCsv({ columns: ["Observação"], rows: [["=SUM(A1)"], ["  @comando"], ["'já protegido"]] });
    expect(parseFinancialCsv(csv).rows).toEqual([["'=SUM(A1)"], ["'  @comando"], ["'já protegido"]]);
});

it("refuses malformed CSV and mismatched columns", () => {
    expect(() => parseFinancialCsv('"Nome"\n"aspas abertas')).toThrow();
    expect(() => parseFinancialCsv('"Nome";"Valor"\n"faltou campo"')).toThrow();
});

it("generates the financial PDF in the frontend using the same complete data", () => {
    const pdf = buildFinancialReportPdf("definitions", { columns, rows: [record] }, {}, new Date("2026-10-13T19:55:38Z"));
    expect(pdf.internal.pageSize.getWidth()).toBeGreaterThan(pdf.internal.pageSize.getHeight());
    expect(pdf.output("arraybuffer").byteLength).toBeGreaterThan(2000);
    if (process.env.FINANCIAL_PDF_PREVIEW) writeFileSync(process.env.FINANCIAL_PDF_PREVIEW, Buffer.from(pdf.output("arraybuffer")));
});

it("paginates long notes and prevents reports above the PDF row limit", () => {
    const long = record.map((value, index) => index === 2 ? "Observação longa\n".repeat(25) : value);
    expect(buildFinancialReportPdf("definitions", { columns, rows: Array.from({ length: 25 }, () => long) }).getNumberOfPages()).toBeGreaterThan(1);
    expect(() => buildFinancialReportPdf("definitions", { columns, rows: Array.from({ length: 501 }, () => record) })).toThrow("500");
});
