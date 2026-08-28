import { toPng } from "html-to-image";

import type { CardExportScope } from "@/components/common/card-export/CardExportActions";

interface ExportImageParams {
    scope: CardExportScope;
    frontImage: string;
    backImage?: string;
    fileName: string;
}

const CARD_WIDTH_MM = 85.6;
const CARD_HEIGHT_MM = 53.98;

const MILLIMETERS_PER_INCH = 25.4;
const CARD_EXPORT_DPI = 300;
const CARD_RENDER_WIDTH_PX = 856;
const CARD_RENDER_HEIGHT_PX = 540;
const CARD_EXPORT_WIDTH_PX = Math.round(
    (CARD_WIDTH_MM /
        MILLIMETERS_PER_INCH) *
        CARD_EXPORT_DPI,
);
const CARD_EXPORT_HEIGHT_PX = Math.round(
    (CARD_HEIGHT_MM /
        MILLIMETERS_PER_INCH) *
        CARD_EXPORT_DPI,
);
export async function captureCardElement(
    element: HTMLElement,
) {
    if ("fonts" in document) {
        await document.fonts.ready;
    }

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

    const exportHost =
        document.createElement("div");
    const exportElement =
        element.cloneNode(true) as HTMLElement;

    exportHost.setAttribute(
        "aria-hidden",
        "true",
    );
    Object.assign(exportHost.style, {
        position: "fixed",
        left: "-10000px",
        top: "0",
        width: `${CARD_RENDER_WIDTH_PX}px`,
        height: `${CARD_RENDER_HEIGHT_PX}px`,
        containerType: "inline-size",
        pointerEvents: "none",
        overflow: "hidden",
    });

    exportElement.removeAttribute("id");
    Object.assign(exportElement.style, {
        width: `${CARD_RENDER_WIDTH_PX}px`,
        height: `${CARD_RENDER_HEIGHT_PX}px`,
        maxWidth: "none",
        margin: "0",
        transform: "none",
        boxShadow: "none",
        borderRadius: "0px",
        backgroundColor,
    });

    exportHost.appendChild(exportElement);
    document.body.appendChild(exportHost);

    try {
        await waitForImages(exportElement);
        await waitForLayout();

        return await toPng(exportElement, {
        cacheBust: true,

        /*
         * Não usamos pixelRatio junto com
         * canvasWidth/canvasHeight para não
         * aumentar a imagem duas vezes.
         */
        pixelRatio: 1,

        width: CARD_RENDER_WIDTH_PX,
        height: CARD_RENDER_HEIGHT_PX,

        canvasWidth:
            CARD_EXPORT_WIDTH_PX,

        canvasHeight:
            CARD_EXPORT_HEIGHT_PX,

        /*
         * Essas alterações são aplicadas somente
         * ao clone usado no arquivo exportado.
         * A carteirinha da tela continua arredondada.
         */
        style: {
            width: `${CARD_RENDER_WIDTH_PX}px`,
            height: `${CARD_RENDER_HEIGHT_PX}px`,
            maxWidth: "none",
            margin: "0",
            transform: "none",
            boxShadow: "none",
            borderRadius: "0px",
            backgroundColor,
            },
        });
    } finally {
        exportHost.remove();
    }
}

function waitForLayout() {
    return new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() =>
                resolve(),
            );
        });
    });
}

async function waitForImages(
    element: HTMLElement,
) {
    const images = Array.from(
        element.querySelectorAll("img"),
    );

    await Promise.all(
        images.map((image) => {
            if (image.complete) {
                return Promise.resolve();
            }

            return new Promise<void>(
                (resolve) => {
                    image.addEventListener(
                        "load",
                        () => resolve(),
                        { once: true },
                    );
                    image.addEventListener(
                        "error",
                        () => resolve(),
                        { once: true },
                    );
                },
            );
        }),
    );
}

export async function exportCardAsPng({
    scope,
    frontImage,
    backImage,
    fileName,
}: ExportImageParams) {
    const safeFileName =
        sanitizeFileName(fileName) ||
        "carteirinha";

    if (
        scope === "front" ||
        !backImage
    ) {
        triggerDownload(
            frontImage,
            `${safeFileName}-frente.png`,
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
        `${safeFileName}-frente-verso.png`,
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
