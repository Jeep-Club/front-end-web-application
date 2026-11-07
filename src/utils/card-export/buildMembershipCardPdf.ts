import { jsPDF } from "jspdf";

interface BuildMembershipCardPdfParams {
    scope: "front" | "front-and-back";
    frontImage: string;
    backImage?: string;
    fileName: string;
}

/** Use the exact same artwork as the preview and PNG; each page has the physical card size. */
export async function buildAndSaveMembershipCardPdf({ scope, frontImage, backImage, fileName }: BuildMembershipCardPdfParams) {
    if (scope === "front-and-back" && !backImage) throw new Error("O verso da carteirinha não foi gerado.");
    const size: [number, number] = [85.6, 53.98];
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: size, compress: true });
    pdf.setProperties({ title: "Carteirinha Jeep Clube Tamoios", subject: "Carteirinha de associado - frente e verso", author: "Jeep Clube Tamoios" });
    pdf.addImage(frontImage, "PNG", 0, 0, size[0], size[1]);
    if (scope === "front-and-back" && backImage) {
        pdf.addPage(size, "landscape");
        pdf.addImage(backImage, "PNG", 0, 0, size[0], size[1]);
    }
    const safeName = fileName.replace(/[^a-zA-Z0-9_-]/g, "-") || "carteirinha";
    pdf.save(`${safeName}.pdf`);
}