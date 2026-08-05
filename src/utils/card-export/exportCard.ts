import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

import type {
    CardExportFormat,
    CardExportScope,
} from "@/components/common/card-export/CardExportActions";

interface ExportCardImagesParams {
    format: CardExportFormat;
    scope: CardExportScope;
    frontImage: string;
    backImage?: string;
    fileName: string;
}

interface ExportImageParams {
    scope: CardExportScope;
    frontImage: string;
    backImage?: string;
    fileName: string;
}

const CARD_WIDTH_MM = 85.6;
const CARD_HEIGHT_MM = 53.98;

const EXPORT_SCALE = 3;
const PDF_BLEED_MM = 0.15;

export async function captureCardElement(
    element: HTMLElement,
) {
    if ("fonts" in document) {
        await document.fonts.ready;
    }

    const rect =
        element.getBoundingClientRect();

    const width = Math.ceil(rect.width);
    const height = Math.ceil(rect.height);

    const computedBackground =
        window.getComputedStyle(
            element,
        ).backgroundColor;

    const backgroundColor =
        computedBackground ===
            "rgba(0, 0, 0, 0)" ||
        computedBackground ===
            "transparent"
            ? "#f3f3f3"
            : computedBackground;

    return toPng(element, {
        cacheBust: true,

        /*
         * Não usamos pixelRatio junto com
         * canvasWidth/canvasHeight para não
         * aumentar a imagem duas vezes.
         */
        pixelRatio: 1,

        width,
        height,

        canvasWidth:
            width * EXPORT_SCALE,

        canvasHeight:
            height * EXPORT_SCALE,

        /*
         * Essas alterações são aplicadas somente
         * ao clone usado no arquivo exportado.
         * A carteirinha da tela continua arredondada.
         */
        style: {
            width: `${width}px`,
            height: `${height}px`,
            maxWidth: "none",
            margin: "0",
            transform: "none",
            boxShadow: "none",
            borderRadius: "0px",
            backgroundColor,
        },
    });
}

export async function exportCardImages({
    format,
    scope,
    frontImage,
    backImage,
    fileName,
}: ExportCardImagesParams) {
    const safeFileName =
        sanitizeFileName(fileName) ||
        "carteirinha";

    if (format === "pdf") {
        exportAsPdf({
            scope,
            frontImage,
            backImage,
            fileName: safeFileName,
        });

        return;
    }

    await exportAsPng({
        scope,
        frontImage,
        backImage,
        fileName: safeFileName,
    });
}

function exportAsPdf({
    scope,
    frontImage,
    backImage,
    fileName,
}: ExportImageParams) {
    const pdf = createCardPdf();

    addImageToCurrentPage(
        pdf,
        frontImage,
    );

    if (
        scope === "front-and-back" &&
        backImage
    ) {
        pdf.addPage(
            [
                CARD_WIDTH_MM,
                CARD_HEIGHT_MM,
            ],
            "landscape",
        );

        addImageToCurrentPage(
            pdf,
            backImage,
        );
    }

    pdf.save(`${fileName}.pdf`);
}

function createCardPdf() {
    return new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [
            CARD_WIDTH_MM,
            CARD_HEIGHT_MM,
        ],
        compress: true,
    });
}

function addImageToCurrentPage(
    pdf: jsPDF,
    image: string,
) {
    const pageWidth =
        pdf.internal.pageSize.getWidth();

    const pageHeight =
        pdf.internal.pageSize.getHeight();

    /*
     * A pequena sangria remove possíveis
     * linhas brancas nas bordas do PDF.
     */
    pdf.addImage(
        image,
        "PNG",
        -PDF_BLEED_MM,
        -PDF_BLEED_MM,
        pageWidth +
            PDF_BLEED_MM * 2,
        pageHeight +
            PDF_BLEED_MM * 2,
        undefined,
        "FAST",
    );
}

async function exportAsPng({
    scope,
    frontImage,
    backImage,
    fileName,
}: ExportImageParams) {
    if (
        scope === "front" ||
        !backImage
    ) {
        triggerDownload(
            frontImage,
            `${fileName}-frente.png`,
        );

        return;
    }

    const combinedImage =
        await combineCardImages(
            frontImage,
            backImage,
        );

    triggerDownload(
        combinedImage,
        `${fileName}-frente-verso.png`,
    );
}

async function combineCardImages(
    frontImageUrl: string,
    backImageUrl: string,
) {
    const [frontImage, backImage] =
        await Promise.all([
            loadImage(frontImageUrl),
            loadImage(backImageUrl),
        ]);

    const gap = Math.max(
        32,
        Math.round(
            frontImage.width * 0.025,
        ),
    );

    const canvas =
        document.createElement("canvas");

    canvas.width = Math.max(
        frontImage.width,
        backImage.width,
    );

    canvas.height =
        frontImage.height +
        gap +
        backImage.height;

    const context =
        canvas.getContext("2d");

    if (!context) {
        throw new Error(
            "Não foi possível gerar a imagem.",
        );
    }

    context.fillStyle = "#ffffff";

    context.fillRect(
        0,
        0,
        canvas.width,
        canvas.height,
    );

    const frontX =
        (canvas.width -
            frontImage.width) /
        2;

    const backX =
        (canvas.width -
            backImage.width) /
        2;

    context.drawImage(
        frontImage,
        frontX,
        0,
    );

    context.drawImage(
        backImage,
        backX,
        frontImage.height + gap,
    );

    return canvas.toDataURL(
        "image/png",
        1,
    );
}

function loadImage(
    source: string,
): Promise<HTMLImageElement> {
    return new Promise(
        (resolve, reject) => {
            const image = new Image();

            image.onload = () => {
                resolve(image);
            };

            image.onerror = () => {
                reject(
                    new Error(
                        "Não foi possível carregar a imagem gerada.",
                    ),
                );
            };

            image.src = source;
        },
    );
}

function triggerDownload(
    source: string,
    fileName: string,
) {
    const link =
        document.createElement("a");

    link.href = source;
    link.download = fileName;

    document.body.appendChild(link);

    link.click();
    link.remove();
}

function sanitizeFileName(
    value: string,
) {
    return value
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            "",
        )
        .toLowerCase()
        .replace(
            /[^a-z0-9-_]/g,
            "-",
        )
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}