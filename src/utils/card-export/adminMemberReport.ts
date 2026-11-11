import { jsPDF } from "jspdf";

type MemberReportData = Pick<AdminUser, "id" | "name" | "birthDate" | "cpf" | "rg" | "email" | "phoneNumber" | "profilePhotoUrl" | "status" | "createdAt"> & {
    membershipNumber: string | null;
    membershipCreatedAt: string | null;
    profile: AdminUserComplementaryProfile;
};

const NAVY = "#0c1f4c";
const GOLD = "#fed01b";
const MUTED = "#64748b";
const formatDate = (value: string | null | undefined) => {
    if (!value) return "Não informado";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "UTC" }).format(date);
};
const value = (text: string | null | undefined) => text?.trim() || "Não informado";

async function imageData(source: string, normalize = false): Promise<string | null> {
    try {
        const response = await fetch(source, { credentials: "same-origin", cache: "force-cache" });
        if (!response.ok) return null;
        const blob = await response.blob();
        const dataUrl = await new Promise<string | null>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
        });
        if (!dataUrl || !normalize) return dataUrl;
        return await new Promise((resolve) => {
            const image = new Image();
            const objectUrl = URL.createObjectURL(blob);
            image.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = image.naturalWidth;
                canvas.height = image.naturalHeight;
                canvas.getContext("2d")?.drawImage(image, 0, 0);
                URL.revokeObjectURL(objectUrl);
                try { resolve(canvas.toDataURL("image/jpeg", 0.9)); } catch { resolve(dataUrl); }
            };
            image.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(dataUrl); };
            image.src = objectUrl;
        });
    } catch {
        return null;
    }
}

/** Creates a one-page, branded A4 member record with the operator attribution. */
export async function downloadAdminMemberReport(user: MemberReportData, exportedBy: string) {
    const [seal, portrait] = await Promise.all([
        imageData("/images/jeepclube-emblema.png"),
        user.profilePhotoUrl ? imageData(user.profilePhotoUrl, true) : Promise.resolve(null),
    ]);
    const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
    pdf.setProperties({ title: `Ficha do associado - ${user.name}`, author: "Jeep Clube Tamoios", subject: "Ficha cadastral do associado" });

    pdf.setFillColor(NAVY); pdf.rect(0, 0, 210, 39, "F");
    if (seal) pdf.addImage(seal, "PNG", 14, 7, 25, 25);
    pdf.setTextColor("#ffffff"); pdf.setFont("helvetica", "bold"); pdf.setFontSize(14);
    pdf.text("JEEP CLUBE TAMOIOS", 45, 17);
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(9);
    pdf.text("Ficha cadastral do associado", 45, 25);
    pdf.setDrawColor(GOLD); pdf.setLineWidth(1.4); pdf.line(0, 39, 210, 39);

    pdf.setTextColor(NAVY); pdf.setFont("helvetica", "bold"); pdf.setFontSize(user.name.length > 42 ? 12 : 17);
    pdf.text(user.name, 15, 54, { maxWidth: 130 });
    pdf.setFont("helvetica", "normal"); pdf.setTextColor(MUTED); pdf.setFontSize(9);
    pdf.text(`Associado ${user.status === "ACTIVE" ? "ativo" : user.status === "INACTIVE" ? "inativo" : "arquivado"}`, 15, 61);
    pdf.setFillColor("#eef2f7"); pdf.roundedRect(163, 45, 32, 32, 3, 3, "F");
    if (portrait) {
        const image = pdf.getImageProperties(portrait);
        const scale = Math.min(32 / image.width, 32 / image.height);
        const width = image.width * scale;
        const height = image.height * scale;
        pdf.addImage(portrait, image.fileType, 163 + (32 - width) / 2, 45 + (32 - height) / 2, width, height, undefined, "FAST");
    } else {
        const initials = user.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toLocaleUpperCase("pt-BR");
        pdf.setTextColor(NAVY); pdf.setFont("helvetica", "bold"); pdf.setFontSize(15);
        pdf.text(initials, 179, 64, { align: "center" });
    }

    let y = 85;
    const section = (title: string) => {
        pdf.setFillColor("#eef2f7"); pdf.roundedRect(15, y, 180, 9, 2, 2, "F");
        pdf.setTextColor(NAVY); pdf.setFont("helvetica", "bold"); pdf.setFontSize(9);
        pdf.text(title.toLocaleUpperCase("pt-BR"), 19, y + 6);
        y += 13;
    };
    const field = (label: string, text: string, x: number, top: number, width = 82) => {
        pdf.setTextColor(MUTED); pdf.setFont("helvetica", "normal"); pdf.setFontSize(8); pdf.text(label, x, top);
        pdf.setTextColor(NAVY); pdf.setFont("helvetica", "bold"); pdf.setFontSize(10);
        pdf.text(text, x, top + 6, { maxWidth: width });
    };
    section("Vínculo com o clube");
    field("Matrícula", value(user.membershipNumber), 18, y, 78);
    field("Identificação no sistema", `#${user.id}`, 105, y, 78);
    field("Associado desde", formatDate(user.membershipCreatedAt ?? user.createdAt), 18, y + 14, 78);
    field("Situação", user.status === "ACTIVE" ? "Ativo" : user.status === "INACTIVE" ? "Inativo" : "Arquivado", 105, y + 14, 78);
    y += 37;

    section("Identificação pessoal");
    field("CPF", value(user.cpf), 18, y, 78);
    field("RG", value(user.rg), 105, y, 78);
    field("Data de nascimento", formatDate(user.birthDate), 18, y + 14, 78);
    y += 37;

    section("Contato");
    field("E-mail", value(user.email), 18, y, 165);
    field("Telefone", value(user.phoneNumber), 18, y + 14, 165);
    y += 31;

    section("Perfil complementar");
    field("Profissão", value(user.profile.workProfile?.occupation), 18, y, 78);
    field("Local de trabalho", value(user.profile.workProfile?.workplace), 105, y, 78);
    const address = user.profile.address;
    field("Endereço", address ? [address.street, address.number, address.complement].filter(Boolean).join(", ") || "Não informado" : "Não informado", 18, y + 14, 165);
    field("Bairro", value(address?.neighborhood), 18, y + 28, 50);
    field("Cidade / UF", [address?.city, address?.state].filter(Boolean).join(" / ") || "Não informado", 78, y + 28, 64);
    field("CEP", value(address?.postalCode), 151, y + 28, 42);

    pdf.setDrawColor("#dbe2eb"); pdf.setLineWidth(0.35); pdf.line(15, 270, 195, 270);
    pdf.setFont("helvetica", "normal"); pdf.setTextColor(MUTED); pdf.setFontSize(8);
    pdf.text(`Documento gerado por ${exportedBy}`, 15, 277, { maxWidth: 125 });
    pdf.text(new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date()), 195, 277, { align: "right" });
    pdf.setFont("helvetica", "bold"); pdf.text("Jeep Clube Tamoios", 15, 283);

    const filename = `ficha-associado-${user.membershipNumber || user.id}`.replace(/[^a-zA-Z0-9_-]/g, "-");
    pdf.save(`${filename}.pdf`);
}
