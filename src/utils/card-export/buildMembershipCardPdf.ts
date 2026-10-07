import { jsPDF } from "jspdf";

/*
 * Diferente da exportacao em PNG (que e uma captura de tela por natureza),
 * o PDF e desenhado com as primitivas de texto/forma do jsPDF — nada aqui
 * vem de um screenshot do DOM. Isso garante que nome, CPF, telefone etc.
 * saiam como texto de verdade (selecionavel/copiavel), nao como uma imagem
 * achatada dentro do PDF. Em troca, a fonte fica limitada as fontes padrao
 * do PDF (Helvetica) — nao e a mesma fonte do site.
 */

const CARD_WIDTH_MM = 85.6;
const CARD_HEIGHT_MM = 53.98;
const PDF_FOOTER_HEIGHT_MM = 7;
const PAGE_FORMAT: [number, number] = [
    CARD_WIDTH_MM,
    CARD_HEIGHT_MM + PDF_FOOTER_HEIGHT_MM,
];

const COLOR = {
    blue950: "#081635",
    blue800: "#061e50",
    blue700: "#00236f",
    blue500: "#003ca2",
    blue300: "#3f72a0",
    blue200: "#5487b5",
    blue100: "#6e9cc5",
    yellow300: "#fed01b",
    gray400: "#858585",
    white: "#ffffff",
} as const;

export interface MembershipCardPdfData {
    fullName?: string | null;
    birthDate?: string | null;
    memberSince?: string | null;
    phoneNumber?: string | null;
    roleLabel?: string | null;
    registrationNumber?: string | null;
    bloodType?: string | null;
    profilePhotoUrl?: string | null;
}

interface BuildMembershipCardPdfParams {
    scope: "front" | "front-and-back";
    data: MembershipCardPdfData;
    fileName: string;
}

function displayValue(value?: string | null) {
    return value?.trim() || "--";
}

function loadImageElement(
    url: string,
): Promise<HTMLImageElement | undefined> {
    return new Promise((resolve) => {
        const image = new Image();

        image.crossOrigin = "anonymous";
        image.onload = () => resolve(image);
        image.onerror = () => resolve(undefined);
        image.src = url;
    });
}

function prepareTransparentLogo(image: HTMLImageElement) {
    const sourceCanvas = document.createElement("canvas");
    const sourceWidth = image.naturalWidth || image.width;
    const sourceHeight = image.naturalHeight || image.height;

    sourceCanvas.width = sourceWidth;
    sourceCanvas.height = sourceHeight;

    const context = sourceCanvas.getContext("2d", {
        willReadFrequently: true,
    });

    if (!context) {
        return sourceCanvas;
    }

    context.drawImage(image, 0, 0);

    const imageData = context.getImageData(
        0,
        0,
        sourceWidth,
        sourceHeight,
    );
    const { data } = imageData;
    const visited = new Uint8Array(sourceWidth * sourceHeight);
    const queue: number[] = [];

    const isBackground = (pixel: number) => {
        const offset = pixel * 4;
        const red = data[offset];
        const green = data[offset + 1];
        const blue = data[offset + 2];
        const max = Math.max(red, green, blue);
        const min = Math.min(red, green, blue);

        return min > 205 && max - min < 28;
    };

    const enqueue = (pixel: number) => {
        if (!visited[pixel] && isBackground(pixel)) {
            visited[pixel] = 1;
            queue.push(pixel);
        }
    };

    for (let x = 0; x < sourceWidth; x += 1) {
        enqueue(x);
        enqueue((sourceHeight - 1) * sourceWidth + x);
    }

    for (let y = 0; y < sourceHeight; y += 1) {
        enqueue(y * sourceWidth);
        enqueue(y * sourceWidth + sourceWidth - 1);
    }

    for (let cursor = 0; cursor < queue.length; cursor += 1) {
        const pixel = queue[cursor];
        const x = pixel % sourceWidth;
        const y = Math.floor(pixel / sourceWidth);

        data[pixel * 4 + 3] = 0;

        if (x > 0) enqueue(pixel - 1);
        if (x + 1 < sourceWidth) enqueue(pixel + 1);
        if (y > 0) enqueue(pixel - sourceWidth);
        if (y + 1 < sourceHeight) enqueue(pixel + sourceWidth);
    }

    context.putImageData(imageData, 0, 0);

    let minX = sourceWidth;
    let minY = sourceHeight;
    let maxX = 0;
    let maxY = 0;

    for (let y = 0; y < sourceHeight; y += 1) {
        for (let x = 0; x < sourceWidth; x += 1) {
            if (data[(y * sourceWidth + x) * 4 + 3] > 12) {
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
            }
        }
    }

    if (minX > maxX || minY > maxY) {
        return sourceCanvas;
    }

    const padding = Math.max(
        2,
        Math.round(Math.max(sourceWidth, sourceHeight) * 0.015),
    );
    const cropX = Math.max(0, minX - padding);
    const cropY = Math.max(0, minY - padding);
    const cropWidth = Math.min(
        sourceWidth - cropX,
        maxX - minX + 1 + padding * 2,
    );
    const cropHeight = Math.min(
        sourceHeight - cropY,
        maxY - minY + 1 + padding * 2,
    );
    const outputCanvas = document.createElement("canvas");

    outputCanvas.width = cropWidth;
    outputCanvas.height = cropHeight;
    outputCanvas.getContext("2d")?.drawImage(
        sourceCanvas,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight,
    );

    return outputCanvas;
}

function drawCardBorder(pdf: jsPDF) {
    pdf.setDrawColor(COLOR.blue950);
    pdf.setLineWidth(0.3);
    pdf.rect(
        0.15,
        0.15,
        CARD_WIDTH_MM - 0.3,
        CARD_HEIGHT_MM - 0.3,
        "S",
    );
}

function drawLogo(
    pdf: jsPDF,
    image: HTMLImageElement | undefined,
    cx: number,
    cy: number,
    radius: number,
) {
    if (!image) {
        pdf.setFillColor(COLOR.white);
        pdf.circle(cx, cy, radius, "F");
        return;
    }

    try {
        const logo = prepareTransparentLogo(image);
        const imageSize = radius * 2.15;
        const aspect = logo.width / logo.height;
        const drawWidth = aspect >= 1
            ? imageSize
            : imageSize * aspect;
        const drawHeight = aspect >= 1
            ? imageSize / aspect
            : imageSize;

        pdf.addImage(
            logo,
            "PNG",
            cx - drawWidth / 2,
            cy - drawHeight / 2,
            drawWidth,
            drawHeight,
        );
    } catch {
        // mantem o espaco vazio se o navegador nao conseguir ler a
        // imagem (ex.: restricao de CORS no canvas).
    }
}

/* Icone generico de usuario, usado quando nao ha foto de perfil. */
function drawPersonPlaceholder(
    pdf: jsPDF,
    x: number,
    y: number,
    w: number,
    h: number,
) {
    pdf.saveGraphicsState();
    pdf.rect(x, y, w, h, null);
    pdf.clip();
    pdf.discardPath();

    const cx = x + w / 2;
    const size = Math.min(w, h);

    pdf.setDrawColor(COLOR.blue300);
    pdf.setLineWidth(size * 0.06);

    const headCy = y + h * 0.34;
    const headR = size * 0.14;
    pdf.ellipse(cx, headCy, headR, headR, "S");

    const shoulderCy = y + h * 0.82;
    pdf.ellipse(cx, shoulderCy, size * 0.27, size * 0.21, "S");

    pdf.restoreGraphicsState();
}

function drawFrontFace(
    pdf: jsPDF,
    data: MembershipCardPdfData,
    logo: HTMLImageElement | undefined,
    photo: HTMLImageElement | undefined,
) {
    const headerHeight = CARD_HEIGHT_MM * 0.27;

    pdf.setFillColor(COLOR.blue950);
    pdf.rect(0, 0, CARD_WIDTH_MM, headerHeight, "F");

    drawLogo(pdf, logo, 9, headerHeight / 2, 5);

    const textX = 17;

    pdf.setTextColor(COLOR.yellow300);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(5);
    pdf.setCharSpace(0.15);
    pdf.text("JEEP CLUBE TAMOIOS", textX, 5.4);
    pdf.setCharSpace(0);

    pdf.setTextColor(COLOR.white);
    pdf.setFontSize(10.5);
    pdf.text("CARTEIRA DE ASSOCIADO", textX, 9.7);

    pdf.setTextColor(COLOR.blue200);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(3.6);
    pdf.setCharSpace(0.18);
    pdf.text(
        "DOCUMENTO DE IDENTIFICAÇÃO DO CLUBE",
        textX,
        12.7,
    );
    pdf.setCharSpace(0);

    const dividerX = CARD_WIDTH_MM - 18.5;

    pdf.setDrawColor(COLOR.blue700);
    pdf.setLineWidth(0.25);
    pdf.line(dividerX, 3.6, dividerX, headerHeight - 3.6);

    const statusTextX = dividerX + 3;

    pdf.setTextColor(COLOR.blue300);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(3.4);
    pdf.text("SITUAÇÃO", statusTextX, headerHeight / 2 - 1.3);

    pdf.setTextColor(COLOR.white);
    pdf.setFontSize(4.6);
    pdf.text(
        (data.roleLabel ?? "Associado").toUpperCase(),
        statusTextX,
        headerHeight / 2 + 2.1,
    );

    pdf.setFillColor(COLOR.yellow300);
    pdf.rect(0, headerHeight, CARD_WIDTH_MM, 0.7, "F");

    const contentTop = headerHeight + 3.6;
    const leftX = 4;
    const leftWidth = 19;
    const rightX = leftX + leftWidth + 4;
    const rightWidth = CARD_WIDTH_MM - rightX - 4;
    const photoHeight = 23;

    pdf.setFillColor("#f5f7fb");
    pdf.roundedRect(
        leftX,
        contentTop,
        leftWidth,
        photoHeight,
        1.2,
        1.2,
        "F",
    );

    if (photo) {
        try {
            const inset = 0.45;
            const frameX = leftX + inset;
            const frameY = contentTop + inset;
            const frameWidth = leftWidth - inset * 2;
            const frameHeight = photoHeight - inset * 2;
            const imageAspect = photo.naturalWidth / photo.naturalHeight;
            const frameAspect = frameWidth / frameHeight;
            let drawWidth = frameWidth;
            let drawHeight = frameHeight;

            if (imageAspect > frameAspect) {
                drawWidth = frameHeight * imageAspect;
            } else {
                drawHeight = frameWidth / imageAspect;
            }

            const drawX = frameX + (frameWidth - drawWidth) / 2;
            const drawY = frameY + (frameHeight - drawHeight) / 2;

            pdf.saveGraphicsState();
            pdf.roundedRect(
                frameX,
                frameY,
                frameWidth,
                frameHeight,
                1.35,
                1.35,
                null,
            );
            pdf.clip();
            pdf.discardPath();
            pdf.addImage(
                photo,
                "JPEG",
                drawX,
                drawY,
                drawWidth,
                drawHeight,
            );
            pdf.restoreGraphicsState();
        } catch {
            // mantem a moldura vazia se a foto nao puder ser lida.
        }
    } else {
        drawPersonPlaceholder(
            pdf,
            leftX,
            contentTop,
            leftWidth,
            photoHeight,
        );
    }

    pdf.setDrawColor(COLOR.blue100);
    pdf.setLineWidth(0.18);
    pdf.roundedRect(
        leftX,
        contentTop,
        leftWidth,
        photoHeight,
        1.4,
        1.4,
        "S",
    );

    const photoBottom = contentTop + photoHeight;

    pdf.setDrawColor(COLOR.yellow300);
    pdf.setLineWidth(0.5);
    pdf.line(leftX, photoBottom + 1.4, leftX + leftWidth, photoBottom + 1.4);

    pdf.setTextColor(COLOR.blue500);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(4);
    pdf.text("REGISTRO", leftX, photoBottom + 4.6);

    pdf.setTextColor(COLOR.blue950);
    pdf.setFontSize(6.5);
    pdf.text(
        displayValue(data.registrationNumber),
        leftX + leftWidth,
        photoBottom + 4.6,
        { align: "right" },
    );

    pdf.setTextColor(COLOR.blue500);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(4);
    pdf.text("NOME DO ASSOCIADO", rightX, contentTop + 2);

    pdf.setTextColor(COLOR.blue950);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.text(displayValue(data.fullName), rightX, contentTop + 6.4);

    pdf.setDrawColor(COLOR.blue950);
    pdf.setLineWidth(0.25);
    pdf.line(rightX, contentTop + 8, rightX + rightWidth, contentTop + 8);

    const fields: Array<[string, string | null | undefined]> = [
        ["NASCIMENTO", data.birthDate],
        ["TELEFONE", data.phoneNumber],
        ["CATEGORIA", data.roleLabel],
        ["MEMBRO DESDE", data.memberSince],
    ];

    const colWidth = rightWidth / 2;
    const colGap = 3;

    fields.forEach(([label, value], index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const x = rightX + col * colWidth;
        const y = contentTop + 12 + row * 7;

        pdf.setTextColor(COLOR.blue500);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(3.8);
        pdf.text(label, x, y);

        pdf.setTextColor(COLOR.blue950);
        pdf.setFontSize(5.8);
        pdf.text(displayValue(value), x, y + 3);

        const lineEndX = col === 0
            ? x + colWidth - colGap
            : rightX + rightWidth;

        pdf.setDrawColor(COLOR.blue100);
        pdf.setLineWidth(0.15);
        pdf.line(
            x,
            y + 4.2,
            lineEndX,
            y + 4.2,
        );
    });

    const bloodBoxWidth = 20;
    const bloodBoxHeight = 7;
    const bloodBoxX = rightX + rightWidth - bloodBoxWidth;
    // fica abaixo da grade de campos (2 linhas a partir de
    // contentTop + 12, a segunda terminando em contentTop + 22.2),
    // com uma folga de 2.3mm.
    const bloodBoxY = contentTop + 24.5;

    pdf.setDrawColor(COLOR.yellow300);
    pdf.setLineWidth(0.4);
    pdf.roundedRect(
        bloodBoxX,
        bloodBoxY,
        bloodBoxWidth,
        bloodBoxHeight,
        1,
        1,
        "S",
    );

    pdf.setTextColor(COLOR.blue500);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(3.6);
    pdf.text(
        "TIPO SANGUÍNEO",
        bloodBoxX + bloodBoxWidth / 2,
        bloodBoxY + 3,
        { align: "center" },
    );

    pdf.setTextColor(COLOR.blue950);
    pdf.setFontSize(6);
    pdf.text(
        displayValue(data.bloodType),
        bloodBoxX + bloodBoxWidth / 2,
        bloodBoxY + 5.8,
        { align: "center" },
    );

    const footerY = CARD_HEIGHT_MM - 3.2;

    pdf.setFillColor(COLOR.blue950);
    pdf.rect(0, footerY, CARD_WIDTH_MM, CARD_HEIGHT_MM - footerY, "F");

    pdf.setTextColor(COLOR.blue200);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(3.4);
    pdf.setCharSpace(0.1);
    pdf.text(
        "USO PESSOAL E INTRANSFERÍVEL",
        CARD_WIDTH_MM / 2,
        footerY + 2.2,
        { align: "center" },
    );
    pdf.setCharSpace(0);

    drawCardBorder(pdf);
}

function drawBackFace(pdf: jsPDF, logo: HTMLImageElement | undefined) {
    const headerHeight = CARD_HEIGHT_MM * 0.38;
    const headerCenterY = headerHeight / 2;

    pdf.setFillColor(COLOR.blue800);
    pdf.rect(0, 0, CARD_WIDTH_MM, headerHeight, "F");

    drawLogo(pdf, logo, 11, headerCenterY, 6);

    const textX = 20;

    pdf.setTextColor(COLOR.yellow300);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(4.6);
    pdf.setCharSpace(0.15);
    pdf.text("CLUBE DE OFF-ROAD", textX, headerCenterY - 2.5);
    pdf.setCharSpace(0);

    pdf.setTextColor(COLOR.white);
    pdf.setFontSize(8.5);
    pdf.text("JEEP CLUBE TAMOIOS", textX, headerCenterY + 1.5);

    pdf.setTextColor(COLOR.blue100);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(4.2);
    pdf.text("Caraguatatuba - São Paulo", textX, headerCenterY + 5);

    pdf.setFillColor(COLOR.yellow300);
    pdf.rect(0, headerHeight, CARD_WIDTH_MM, 0.7, "F");

    pdf.setTextColor(COLOR.blue800);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(4.4);

    const bodyLines = pdf.splitTextToSize(
        "Esta carteirinha identifica o associado ativo do Jeep Clube Tamoios.",
        CARD_WIDTH_MM - 16,
    );

    pdf.text(bodyLines, CARD_WIDTH_MM / 2, headerHeight + 5, {
        align: "center",
    });

    const columns: Array<[string, string]> = [
        ["SITE", "JeepTamoios.com"],
        ["INSTAGRAM", "@JeepTamoios"],
        ["DESDE", "1999"],
    ];

    const columnsY = headerHeight + 14;
    const columnsAreaWidth = CARD_WIDTH_MM - 16;
    const columnWidth = columnsAreaWidth / 3;
    const columnsStartX = 8;

    pdf.setDrawColor(COLOR.blue100);
    pdf.setLineWidth(0.2);
    pdf.line(
        columnsStartX + columnWidth,
        columnsY - 3,
        columnsStartX + columnWidth,
        columnsY + 3,
    );
    pdf.line(
        columnsStartX + columnWidth * 2,
        columnsY - 3,
        columnsStartX + columnWidth * 2,
        columnsY + 3,
    );

    columns.forEach(([label, value], index) => {
        const centerX =
            columnsStartX + columnWidth * index + columnWidth / 2;

        pdf.setTextColor(COLOR.blue500);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(3.8);
        pdf.text(label, centerX, columnsY, { align: "center" });

        pdf.setTextColor(COLOR.blue950);
        pdf.setFontSize(4.4);
        pdf.text(value, centerX, columnsY + 3, { align: "center" });
    });

    pdf.setTextColor(COLOR.gray400);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(3.4);
    pdf.text(
        "USO PESSOAL E INTRANSFERÍVEL",
        CARD_WIDTH_MM / 2,
        CARD_HEIGHT_MM - 3,
        { align: "center" },
    );

    drawCardBorder(pdf);
}

function addGenerationFooter(pdf: jsPDF, generatedDate: string) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6);
    pdf.setTextColor("#475569");
    pdf.text(
        `PDF gerado em ${generatedDate} - recorte na linha acima para imprimir a carteirinha.`,
        pageWidth / 2,
        pageHeight - 2.5,
        { align: "center" },
    );
}

export async function buildAndSaveMembershipCardPdf({
    scope,
    data,
    fileName,
}: BuildMembershipCardPdfParams) {
    const [logo, photo] = await Promise.all([
        loadImageElement("/images/logo_grande.jpg"),
        data.profilePhotoUrl
            ? loadImageElement(data.profilePhotoUrl)
            : Promise.resolve(undefined),
    ]);

    const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: PAGE_FORMAT,
        compress: true,
    });

    const generatedAt = new Date();
    const generatedDate = generatedAt.toISOString().slice(0, 10);

    pdf.setCreationDate(generatedAt);
    pdf.setProperties({
        title: "Carteirinha Jeep Clube Tamoios",
        subject: "Carteirinha digital de associado",
        author: "Jeep Clube Tamoios",
    });

    drawFrontFace(pdf, data, logo, photo);
    addGenerationFooter(pdf, generatedDate);

    if (scope === "front-and-back") {
        pdf.addPage(PAGE_FORMAT, "landscape");
        drawBackFace(pdf, logo);
        addGenerationFooter(pdf, generatedDate);
    }

    pdf.save(`${fileName}-emitida-${generatedDate}.pdf`);
}
