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
    exportElement.querySelectorAll("img").forEach((image) => {
        const source = image.currentSrc || image.src;
        image.loading = "eager";
        image.decoding = "sync";
        image.removeAttribute("srcset");
        image.removeAttribute("sizes");
        if (source) {
            image.src = source;
        }
    });
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
                return image.naturalWidth > 0
                    ? Promise.resolve()
                    : Promise.reject(new Error("Uma imagem da carteirinha não carregou. Tente novamente."));
            }

            return new Promise<void>(
                (resolve, reject) => {
                    const timeout = window.setTimeout(() => {
                        cleanup();
                        reject(new Error("Uma imagem da carteirinha demorou para carregar. Tente novamente."));
                    }, 12_000);
                    const cleanup = () => {
                        window.clearTimeout(timeout);
                        image.removeEventListener("load", handleLoad);
                        image.removeEventListener("error", handleError);
                    };
                    const handleLoad = () => {
                        cleanup();
                        resolve();
                    };
                    const handleError = () => {
                        cleanup();
                        reject(new Error("Uma imagem da carteirinha não carregou. Tente novamente."));
                    };
                    image.addEventListener(
                        "load",
                        handleLoad,
                        { once: true },
                    );
                    image.addEventListener(
                        "error",
                        handleError,
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
        await triggerDownload(
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

    await triggerDownload(
        combinedImage,
        `${safeFileName}-frente-verso.png`,
        true,
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

    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error("Não foi possível preparar o PNG da frente e do verso."));
            }
        }, "image/png");
    });
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

async function triggerDownload(
    source: string | Blob,
    fileName: string,
    preferNativeShare = false,
) {
    const file = source instanceof Blob
        ? source
        : await fetch(source).then(async (response) => {
            if (!response.ok) {
                throw new Error("Não foi possível preparar o arquivo PNG.");
            }
            return response.blob();
        });

    if (preferNativeShare && navigator.share && navigator.canShare) {
        const imageFile = new File([file], fileName, { type: "image/png" });
        if (navigator.canShare({ files: [imageFile] })) {
            try {
                await navigator.share({ files: [imageFile], title: fileName });
                return;
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") {
                    return;
                }
                // If native sharing is unavailable or rejected, fall back to download.
            }
        }
    }

    const objectUrl = URL.createObjectURL(file);
    const link =
        document.createElement("a");

    link.href = objectUrl;
    link.download = fileName;

    document.body.appendChild(link);

    link.click();
    link.remove();
    // Keep the object URL alive long enough for mobile browsers to start
    // the download before releasing its memory.
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
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
