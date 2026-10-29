"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import styles from "./image-crop-dialog.module.css";
import { Image as ImageIcon, RotateCcw, X } from "lucide-react";

const STAGE_WIDTH = 400;
const OUTPUT_SIZE = 1024;
const CROP_SIZE = {
    circle: { width: 320, height: 320 },
    square: { width: STAGE_WIDTH, height: STAGE_WIDTH },
    landscape: { width: STAGE_WIDTH, height: 225 },
} as const;
type CropShape = keyof typeof CROP_SIZE;
type Point = { x: number; y: number };
type DragState = { pointer: Point; offset: Point };

type ImageCropDialogProps = {
    files: File[];
    shape?: CropShape;
    onComplete: (files: File[]) => void;
    onCancel: () => void;
};

/** Shared crop editor. Preview and exported canvas use the same source-to-stage transform. */
export function ImageCropDialog({ files, shape = "square", onComplete, onCancel }: ImageCropDialogProps) {
    const [index, setIndex] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const dragRef = useRef<DragState | null>(null);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const completedFiles = useRef<File[]>([]);
    const crop = CROP_SIZE[shape];
    const stageHeight = shape === "landscape" ? crop.height : STAGE_WIDTH;
    const cropLeft = (STAGE_WIDTH - crop.width) / 2;
    const cropTop = (stageHeight - crop.height) / 2;
    const currentFile = files[index];
    useEffect(() => {
        const image = imageRef.current;
        if (!image || !currentFile) return;
        const url = URL.createObjectURL(currentFile);
        image.src = url;
        return () => {
            image.removeAttribute("src");
            URL.revokeObjectURL(url);
        };
    }, [currentFile]);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const previousFocus = document.activeElement as HTMLElement | null;
        dialog.showModal();
        return () => {
            dialog.close();
            if (previousFocus?.isConnected) previousFocus.focus();
        };
    }, []);

    const getGeometry = useCallback((image: HTMLImageElement, currentZoom: number, currentOffset: Point) => {
        const baseScale = Math.max(crop.width / image.naturalWidth, crop.height / image.naturalHeight);
        const scale = baseScale * currentZoom;
        const width = image.naturalWidth * scale;
        const height = image.naturalHeight * scale;
        const left = (STAGE_WIDTH - width) / 2 + currentOffset.x;
        const top = (stageHeight - height) / 2 + currentOffset.y;
        const minX = cropLeft + crop.width - ((STAGE_WIDTH - width) / 2) - width;
        const maxX = cropLeft - ((STAGE_WIDTH - width) / 2);
        const minY = cropTop + crop.height - ((stageHeight - height) / 2) - height;
        const maxY = cropTop - ((stageHeight - height) / 2);
        return { width, height, left, top, minX, maxX, minY, maxY };
    }, [crop.width, crop.height, cropLeft, cropTop, stageHeight]);

    const clampOffset = useCallback((next: Point, currentZoom = zoom) => {
        const image = imageRef.current;
        if (!image?.naturalWidth) return next;
        const bounds = getGeometry(image, currentZoom, next);
        return {
            x: Math.max(bounds.minX, Math.min(bounds.maxX, next.x)),
            y: Math.max(bounds.minY, Math.min(bounds.maxY, next.y)),
        };
    }, [getGeometry, zoom]);

    useEffect(() => {
        completedFiles.current = [];
    }, [files]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const image = imageRef.current;
        const context = canvas?.getContext("2d");
        if (!canvas || !image || !context || !image.complete || !image.naturalWidth) return;

        const { left, top, width, height } = getGeometry(image, zoom, offset);
        context.clearRect(0, 0, STAGE_WIDTH, stageHeight);
        context.fillStyle = shape === "landscape" ? "#111827" : "#1a1b1f";
        context.fillRect(0, 0, STAGE_WIDTH, stageHeight);
        context.drawImage(image, left, top, width, height);
    }, [zoom, offset, isLoading, index, currentFile, getGeometry, stageHeight, shape]);

    const pointFromEvent = (event: ReactPointerEvent<HTMLDivElement>): Point => {
        const rect = event.currentTarget.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) * STAGE_WIDTH / rect.width,
            y: (event.clientY - rect.top) * stageHeight / rect.height,
        };
    };

    const removeCurrentImage = () => {
        if (isSaving) return;
        if (index + 1 < files.length) {
            setZoom(1);
            setOffset({ x: 0, y: 0 });
            setIsLoading(true);
            setError(null);
            dragRef.current = null;
            setIndex((value) => value + 1);
        } else if (completedFiles.current.length) {
            onComplete(completedFiles.current);
        } else {
            onCancel();
        }
    };

    const applyCrop = async () => {
        const source = imageRef.current;
        if (!source || isSaving || !currentFile) return;
        setIsSaving(true);
        setError(null);
        try {
            const output = document.createElement("canvas");
            const outputWidth = OUTPUT_SIZE;
            const outputHeight = Math.round(OUTPUT_SIZE * crop.height / crop.width);
            output.width = outputWidth;
            output.height = outputHeight;
            const context = output.getContext("2d");
            if (!context) throw new Error("Não foi possível preparar o recorte.");

            if (shape === "landscape") {
                context.fillStyle = "#111827";
                context.fillRect(0, 0, outputWidth, outputHeight);
            }

            const { left, top, width, height } = getGeometry(source, zoom, offset);
            const outputScale = outputWidth / crop.width;
            context.drawImage(source,
                (left - cropLeft) * outputScale,
                (top - cropTop) * outputScale,
                width * outputScale,
                height * outputScale,
            );

            const mimeType = currentFile.type === "image/png" ? "image/png" : "image/jpeg";
            const blob = await new Promise<Blob>((resolve, reject) => {
                output.toBlob((result) => result ? resolve(result) : reject(new Error("Não foi possível gerar o recorte. Tente outra imagem.")), mimeType, 0.92);
            });
            const extension = mimeType === "image/png" ? "png" : "jpg";
            completedFiles.current.push(new File([blob], currentFile.name.replace(/\.[^.]+$/, `.${extension}`), { type: mimeType, lastModified: Date.now() }));

            if (index + 1 < files.length) {
                setZoom(1);
                setOffset({ x: 0, y: 0 });
                setIsLoading(true);
                setError(null);
                dragRef.current = null;
                setIsSaving(false);
                setIndex((value) => value + 1);
            } else {
                onComplete(completedFiles.current);
            }
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Não foi possível aplicar o recorte.");
            setIsSaving(false);
        }
    };

    if (!currentFile) return null;
    const cropMaskStyle = { width: `${crop.width / STAGE_WIDTH * 100}%`, height: `${crop.height / stageHeight * 100}%` };

    return createPortal(
        <dialog ref={dialogRef} aria-labelledby="image-crop-title" className={styles.dialog}
            onCancel={(event) => { event.preventDefault(); if (!isSaving) onCancel(); }}
            onKeyDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}>
            <section className="w-full bg-j-white p-4 text-j-blue-800 sm:p-6">
                <header className="mb-4 flex items-center justify-between sm:mb-5">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-j-blue-800 text-j-yellow-300"><ImageIcon size={18} /></span>
                        <div className="min-w-0">
                            <h2 id="image-crop-title" className="truncate text-base font-extrabold sm:text-lg">Ajustar foto</h2>
                            <p className="mt-1 text-xs text-j-gray-500">{files.length > 1 ? `Imagem ${index + 1} de ${files.length} · ` : ""}{shape === "landscape" ? "Horizontal · 16:9. " : ""}Arraste a foto para enquadrar.</p>
                        </div>
                    </div>
                    <button type="button" disabled={isSaving} onClick={onCancel} aria-label="Fechar edição de imagem" className="rounded-full bg-j-gray-100 p-2 text-j-gray-600 transition hover:bg-j-gray-200 disabled:opacity-50"><X size={20} /></button>
                </header>

                <div
                    className={`relative mx-auto w-full max-w-[400px] touch-none select-none overflow-hidden bg-[#1a1b1f] ${shape === "landscape" ? "aspect-video rounded-lg" : "aspect-square rounded-xl"}`}
                    onPointerDown={(event) => {
                        if (isLoading || isSaving) return;
                        event.currentTarget.setPointerCapture(event.pointerId);
                        dragRef.current = { pointer: pointFromEvent(event), offset };
                    }}
                    onPointerMove={(event) => {
                        if (!dragRef.current) return;
                        const pointer = pointFromEvent(event);
                        const drag = dragRef.current;
                        setOffset(clampOffset({ x: drag.offset.x + pointer.x - drag.pointer.x, y: drag.offset.y + pointer.y - drag.pointer.y }));
                    }}
                    onPointerUp={() => { dragRef.current = null; }}
                    onPointerCancel={() => { dragRef.current = null; }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img ref={imageRef} alt="Prévia do recorte" className="hidden" onLoad={() => { setError(null); setIsLoading(false); }} onError={() => { setIsLoading(false); setError("Não foi possível abrir esta imagem. Escolha outro arquivo."); }} />
                    <canvas ref={canvasRef} width={STAGE_WIDTH} height={stageHeight} className="absolute inset-0 h-full w-full" />
                    <div
                        className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-white/90 ${shape === "circle" ? "rounded-full shadow-[0_0_0_999px_rgba(0,0,0,0.46)]" : shape === "square" ? "rounded-xl" : "rounded-lg"}`}
                        style={cropMaskStyle}
                    />
                    {isLoading && <div className="absolute inset-0 flex items-center justify-center bg-[#191a1e] text-sm text-[#b5bac1]">Carregando imagem...</div>}
                    <button
                        type="button"
                        aria-label="Remover imagem selecionada"
                        title="Remover imagem selecionada"
                        disabled={isSaving}
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={removeCurrentImage}
                        className="absolute right-2 top-2 z-10 flex size-9 items-center justify-center rounded-full bg-white text-red-600 shadow-md transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <X size={20} aria-hidden="true" />
                    </button>
                </div>

                <div className="mx-auto mt-4 flex max-w-[400px] items-center gap-3 text-j-gray-500">
                    <ImageIcon size={15} aria-hidden="true" />
                    <input aria-label="Zoom da imagem" type="range" min="1" max="4" step="0.01" value={zoom} onChange={(event) => {
                        const nextZoom = Number(event.target.value);
                        setZoom(nextZoom);
                        setOffset((current) => clampOffset(current, nextZoom));
                    }} disabled={isLoading || isSaving} className="h-1.5 w-full cursor-pointer accent-j-blue-800" />
                    <ImageIcon size={20} aria-hidden="true" />
                    <button type="button" disabled={isSaving} onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }} aria-label="Redefinir enquadramento" className="ml-1 rounded-lg p-2 transition hover:bg-j-gray-100 hover:text-j-blue-800"><RotateCcw size={17} /></button>
                </div>
                {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

                <footer className="mt-5 flex items-center justify-end gap-3 border-t border-j-gray-200 pt-4">
                    <div className="flex justify-end gap-2">
                        <button type="button" disabled={isSaving} onClick={onCancel} className="rounded-lg border border-j-gray-200 px-4 py-2.5 text-sm font-semibold text-j-gray-600 transition hover:bg-j-gray-100">Cancelar</button>
                        <button type="button" disabled={isLoading || isSaving || Boolean(error)} onClick={() => void applyCrop()} className="rounded-lg bg-j-yellow-300 px-5 py-2.5 text-sm font-bold text-j-blue-800 transition hover:bg-j-yellow-400 disabled:cursor-not-allowed disabled:opacity-50">{isSaving ? "Aplicando..." : index + 1 < files.length ? "Próxima foto" : "Usar foto"}</button>
                    </div>
                </footer>
            </section>
        </dialog>,
        document.body,
    );
}
