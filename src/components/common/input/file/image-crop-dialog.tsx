"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Image as ImageIcon, RotateCcw, X } from "lucide-react";

const STAGE_SIZE = 400;
const OUTPUT_SIZE = 1024;
const CROP_SIZE = {
    circle: { width: 300, height: 300 },
    square: { width: 340, height: 340 },
    landscape: { width: 380, height: 214 },
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
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const completedFiles = useRef<File[]>([]);
    const crop = CROP_SIZE[shape];
    const cropLeft = (STAGE_SIZE - crop.width) / 2;
    const cropTop = (STAGE_SIZE - crop.height) / 2;
    const currentFile = files[index];
    const sourceUrl = useMemo(() => currentFile ? URL.createObjectURL(currentFile) : "", [currentFile]);

    const getGeometry = useCallback((image: HTMLImageElement, currentZoom: number, currentOffset: Point) => {
        const baseScale = Math.max(crop.width / image.naturalWidth, crop.height / image.naturalHeight);
        const scale = baseScale * currentZoom;
        const width = image.naturalWidth * scale;
        const height = image.naturalHeight * scale;
        const left = (STAGE_SIZE - width) / 2 + currentOffset.x;
        const top = (STAGE_SIZE - height) / 2 + currentOffset.y;
        const minX = cropLeft + crop.width - ((STAGE_SIZE - width) / 2) - width;
        const maxX = cropLeft - ((STAGE_SIZE - width) / 2);
        const minY = cropTop + crop.height - ((STAGE_SIZE - height) / 2) - height;
        const maxY = cropTop - ((STAGE_SIZE - height) / 2);
        return { width, height, left, top, minX, maxX, minY, maxY };
    }, [crop.width, crop.height, cropLeft, cropTop]);

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
        context.clearRect(0, 0, STAGE_SIZE, STAGE_SIZE);
        context.fillStyle = "#1a1b1f";
        context.fillRect(0, 0, STAGE_SIZE, STAGE_SIZE);
        context.drawImage(image, left, top, width, height);
    }, [zoom, offset, isLoading, index, sourceUrl, getGeometry]);

    useEffect(() => () => {
        if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    }, [sourceUrl]);

    const pointFromEvent = (event: ReactPointerEvent<HTMLDivElement>): Point => {
        const rect = event.currentTarget.getBoundingClientRect();
        const factor = STAGE_SIZE / rect.width;
        return { x: event.clientX * factor, y: event.clientY * factor };
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
    const cropMaskStyle = { width: `${crop.width / STAGE_SIZE * 100}%`, height: `${crop.height / STAGE_SIZE * 100}%` };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/75 p-3 backdrop-blur-[2px] sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
            <section role="dialog" aria-modal="true" aria-labelledby="image-crop-title" className="my-auto w-full max-w-[540px] rounded-2xl border border-white/10 bg-[#232428] p-4 text-white shadow-2xl sm:p-6">
                <header className="mb-4 flex items-center justify-between sm:mb-5">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white"><ImageIcon size={18} /></span>
                        <div className="min-w-0">
                            <h2 id="image-crop-title" className="truncate text-base font-bold sm:text-lg">Editar imagem</h2>
                            <p className="text-xs text-[#b5bac1]">{files.length > 1 ? `Imagem ${index + 1} de ${files.length} · ` : ""}Arraste para ajustar o enquadramento</p>
                        </div>
                    </div>
                    <button type="button" onClick={onCancel} aria-label="Fechar edição de imagem" className="rounded-lg p-2 text-[#b5bac1] transition hover:bg-white/10 hover:text-white"><X size={20} /></button>
                </header>

                <div
                    className="relative mx-auto aspect-square w-full max-w-[400px] touch-none select-none overflow-hidden rounded-xl bg-[#1a1b1f]"
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
                    <img ref={imageRef} src={sourceUrl} alt="Prévia do recorte" className="hidden" onLoad={() => setIsLoading(false)} onError={() => { setIsLoading(false); setError("Não foi possível abrir esta imagem. Escolha outro arquivo."); }} />
                    <canvas ref={canvasRef} width={STAGE_SIZE} height={STAGE_SIZE} className="absolute inset-0 h-full w-full" />
                    <div
                        className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-[3px] border-white shadow-[0_0_0_999px_rgba(0,0,0,0.58)] ${shape === "circle" ? "rounded-full" : shape === "square" ? "rounded-xl" : "rounded-lg"}`}
                        style={cropMaskStyle}
                    />
                    {isLoading && <div className="absolute inset-0 flex items-center justify-center bg-[#191a1e] text-sm text-[#b5bac1]">Carregando imagem...</div>}
                </div>

                <div className="mx-auto mt-4 flex max-w-[400px] items-center gap-3 text-[#b5bac1]">
                    <ImageIcon size={15} aria-hidden="true" />
                    <input aria-label="Zoom da imagem" type="range" min="1" max="4" step="0.01" value={zoom} onChange={(event) => {
                        const nextZoom = Number(event.target.value);
                        setZoom(nextZoom);
                        setOffset((current) => clampOffset(current, nextZoom));
                    }} className="h-1.5 w-full cursor-pointer accent-[#5865f2]" />
                    <ImageIcon size={20} aria-hidden="true" />
                    <button type="button" onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }} aria-label="Redefinir enquadramento" className="ml-1 rounded-lg p-2 transition hover:bg-white/10 hover:text-white"><RotateCcw size={17} /></button>
                </div>
                {error && <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}

                <footer className="mt-5 flex flex-col-reverse gap-3 border-t border-white/10 pt-4 sm:mt-6 sm:flex-row sm:items-center sm:justify-between">
                    <button type="button" onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); setError(null); }} className="self-start text-sm font-medium text-[#a5b4fc] transition hover:text-white">Redefinir</button>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onCancel} className="rounded-lg bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15">Cancelar</button>
                        <button type="button" disabled={isLoading || isSaving || Boolean(error)} onClick={() => void applyCrop()} className="rounded-lg bg-[#5865f2] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#4752c4] disabled:cursor-not-allowed disabled:opacity-50">{isSaving ? "Aplicando..." : index + 1 < files.length ? "Próxima" : "Aplicar"}</button>
                    </div>
                </footer>
            </section>
        </div>
    );
}
