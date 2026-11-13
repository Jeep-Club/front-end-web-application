import { readFile } from "node:fs/promises";
import { buildAdminUsersPdfFile, parseAdminCsv } from "@/utils/admin-export/usersPdf";

describe("parseAdminCsv", () => {
    it("preserves semicolons, commas, escaped quotes and line breaks inside quoted cells", () => {
        expect(parseAdminCsv('Nome;E-mail;Observação\r\n"Silva; Marina";marina@example.test;"Clube, ""Tamoios""\nAssociada"')).toEqual({
            columns: ["Nome", "E-mail", "Observação"],
            rows: [["Silva; Marina", "marina@example.test", 'Clube, "Tamoios"\nAssociada']],
        });
    });

    it("accepts comma-delimited exports and rejects inconsistent records", () => {
        expect(parseAdminCsv('Nome,E-mail\n"Marina, Silva",marina@example.test')).toEqual({
            columns: ["Nome", "E-mail"],
            rows: [["Marina, Silva", "marina@example.test"]],
        });
        expect(() => parseAdminCsv("Nome;E-mail\nMarina")).toThrow("colunas do relatório");
    });

    it("builds a branded PDF from the returned CSV and preserves its export name", async () => {
        const logo = await readFile("public/images/jeepclube-emblema.png");
        const csv = 'Nome;Matrícula;E-mail\r\n"Marina; Silva";27;marina@example.test';
        const file = await buildAdminUsersPdfFile(
            { base64: Buffer.from(csv, "utf8").toString("base64"), filename: "usuarios-20261109.csv" },
            { status: "ACTIVE" },
            "Admin Jeep",
            `data:image/png;base64,${logo.toString("base64")}`,
        );
        expect(file.contentType).toBe("application/pdf");
        expect(file.filename).toBe("usuarios-20261109.pdf");
        expect(Buffer.from(file.base64, "base64").toString("latin1")).toMatch(/^%PDF-/);
    });
});
