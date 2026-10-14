"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Image as ImageIcon, Minus, Plus, RotateCcw, X } from "lucide-react";

const STAGE_SIZE = 400;
const CROP_SIZE = 300;
const CROP_START = (STAGE_SIZE - CROP_SIZE) / 2;
const OUTPUT_SIZE = 512;

type ImageCropDialogProps = {
    files: File[];
    shape?: "circle" | "square";
    onComplete: (files: File[]) => void;
    onCancel: () => void;
};

/** Shared crop UI for profile and vehicle photos. */
export function ImageCropDialog({ files, shape = "square", onComplete, onCancel }: ImageCropDialogProps) {
    const [index, setIndex] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [dragStart, setDragStart] = useState<{ x: number; y: number; originX: number; originY: number } | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const completedFiles = useRef<File[]>([]);
    const currentFile = files[index];
    const sourceUrl = useMemo(() => currentFile ? URL.createObjectURL(currentFile) : "", [currentFile]);

    useEffect(() => {
        setZoom(1);
        setOffset({ x: 0, y: 0 });
        setIsLoading(true);
    }, [files, index]);

    useEffect(() => {
        completedFiles.current = [];
    }, [files]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const image = imageRef.current;
        const context = canvas?.getContext("2d");
        if (!canvas || !image || !context || !image.complete || !image.naturalWidth) return;

        const baseScale = Math.max(CROP_SIZE / image.naturalWidth, CROP_SIZE / image.naturalHeight);
        const width = image.naturalWidth * baseScale * zoom;
        const height = image.naturalHeight * baseScale * zoom;
        const left = (STAGE_SIZE - width) / 2 + offset.x;
        const top = (STAGE_SIZE - height) / 2 + offset.y;
        context.clearRect(0, 0, STAGE_SIZE, STAGE_SIZE);
        context.fillStyle = "#191a1e";
        context.fillRect(0, 0, STAGE_SIZE, STAGE_SIZE);
        context.drawImage(image, left, top, width, height);
    }, [zoom, offset, isLoading, index, sourceUrl]);

    useEffect(() => () => {
        if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    }, [sourceUrl]);

    const moveImage = (dx: number, dy: number) => {
        const image = imageRef.current;
        if (!image) return;
        const baseScale = Math.max(CROP_SIZE / image.naturalWidth, CROP_SIZE / image.naturalHeight) * zoom;
        const width = image.naturalWidth * baseScale;
        const height = image.naturalHeight * baseScale;
        const minX = CROP_START + CROP_SIZE - (STAGE_SIZE - width) / 2 - width;
        const maxX = CROP_START - (STAGE_SIZE - width) / 2;
        const minY = CROP_START + CROP_SIZE - (STAGE_SIZE - height) / 2 - height;
        const maxY = CROP_START - (STAGE_SIZE - height) / 2;
        setOffset((current) => ({
            x: Math.max(minX, Math.min(maxX, current.x + dx)),
            y: Math.max(minY, Math.min(maxY, current.y + dy)),
        }));
    };

    useEffect(() => {
        const image = imageRef.current;
        if (!image) return;
        const baseScale = Math.max(CROP_SIZE / image.naturalWidth, CROP_SIZE / image.naturalHeight) * zoom;
        const width = image.naturalWidth * baseScale;
        const height = image.naturalHeight * baseScale;
        const minX = CROP_START + CROP_SIZE - (STAGE_SIZE - width) / 2 - width;
        const maxX = CROP_START - (STAGE_SIZE - width) / 2;
        const minY = CROP_START + CROP_SIZE - (STAGE_SIZE - height) / 2 - height;
        const maxY = CROP_START - (STAGE_SIZE - height) / 2;
        setOffset((current) => ({ x: Math.max(minX, Math.min(maxX, current.x)), y: Math.max(minY, Math.min(maxY, current.y)) }));
    }, [zoom]);

    const applyCrop = async () => {
        const source = imageRef.current;
        if (!source || isSaving || !currentFile) return;
        setIsSaving(true);
        try {
            const output = document.createElement("canvas");
            output.width = OUTPUT_SIZE;
            output.height = OUTPUT_SIZE;
            const context = output.getContext("2d");
            if (!context) throw new Error("Could not create crop canvas");

            const baseScale = Math.max(CROP_SIZE / source.naturalWidth, CROP_SIZE / source.naturalHeight) * zoom;
            const width = source.naturalWidth * baseScale;
            const height = source.naturalHeight * baseScale;
            const left = (STAGE_SIZE - width) / 2 + offset.x;
            const top = (STAGE_SIZE - height) / 2 + offset.y;
            const outputScale = OUTPUT_SIZE / CROP_SIZE;
            context.drawImage(source, (left - CROP_START) * outputScale, (top - CROP_START) * outputScale, width * outputScale, height * outputScale);

            const mimeType = currentFile.type === "image/png" ? "image/png" : "image/jpeg";
            const blob = await new Promise<Blob>((resolve, reject) => {
                output.toBlob((result) => result ? resolve(result) : reject(new Error("Could not export cropped image")), mimeType, 0.92);
            });
            const extension = mimeType === "image/png" ? "png" : "jpg";
            completedFiles.current.push(new File([blob], currentFile.name.replace(/\.[^.]+$/, `.${extension}`), { type: mimeType, lastModified: Date.now() }));

            if (index + 1 < files.length) {
                setIsSaving(false);
                setIndex(index + 1);
            } else {
                onComplete(completedFiles.current);
            }
        } catch {
            setIsSaving(false);
        }
    };

    if (!currentFile) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/75 p-3 backdrop-blur-[2px] sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
            <section role="dialog" aria-modal="true" aria-labelledby="image-crop-title" className="my-auto w-full max-w-[540px] rounded-2xl border border-white/10 bg-[#232428] p-4 text-white shadow-2xl sm:p-6">
                <header className="mb-4 flex items-center justify-between sm:mb-5">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white"><ImageIcon size={18} /></span>
                        <div className="min-w-0">
                            <h2 id="image-crop-title" className="truncate text-base font-bold sm:text-lg">Editar imagem</h2>
                            <p className="text-xs text-[#b5bac1]">{files.length > 1 ? `Imagem ${index + 1} de ${files.length} · arraste para ajustar` : "Arraste para ajustar o enquadramento"}</p>
                        </div>
                    </div>
                    <button type="button" onClick={onCancel} aria-label="Fechar edição de imagem" className="rounded-lg p-2 text-[#b5bac1] transition hover:bg-white/10 hover:text-white"><X size={20} /></button>
                </header>

                <div className="relative mx-auto aspect-square w-full max-w-[400px] touch-none overflow-hidden rounded-xl bg-[#191a1e]" onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); setDragStart({ x: event.clientX, y: event.clientY, originX: offset.x, originY: offset.y }); }} onPointerMove={(event) => { if (!dragStart) return; const scale = STAGE_SIZE / event.currentTarget.getBoundingClientRect().width; moveImage((event.clientX - dragStart.x) * scale - (offset.x - dragStart.originX), (event.clientY - dragStart.y) * scale - (offset.y - dragStart.originY)); }} onPointerUp={() => setDragStart(null)} onPointerCancel={() => setDragStart(null)}>
                    <img ref={imageRef} src={sourceUrl} alt="Image crop preview" className="hidden" onLoad={() => setIsLoading(false)} />
                    <canvas ref={canvasRef} width={STAGE_SIZE} height={STAGE_SIZE} className="absolute inset-0 h-full w-full" />
                    <div className={`pointer-events-none absolute left-1/2 top-1/2 h-[75%] w-[75%] -translate-x-1/2 -translate-y-1/2 border-[3px] border-white shadow-[0_0_0_999px_rgba(0,0,0,0.56)] ${shape === "circle" ? "rounded-full" : "rounded-2xl"}`} />
                    {isLoading && <div className="absolute inset-0 flex items-center justify-center bg-[#191a1e] text-sm text-[#b5bac1]">Carregando imagem...</div>}
                </div>

                <div className="mx-auto mt-4 flex max-w-[400px] items-center gap-3 text-[#b5bac1]">
                    <ImageIcon size={15} aria-hidden="true" />
                    <input aria-label="Zoom da imagem" type="range" min="1" max="3" step="0.01" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="h-1.5 w-full cursor-pointer accent-[#5865f2]" />
                    <ImageIcon size={20} aria-hidden="true" />
                    <button type="button" onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }} aria-label="Redefinir enquadramento" className="ml-1 rounded-lg p-2 transition hover:bg-white/10 hover:text-white"><RotateCcw size={17} /></button>
                </div>

                <footer className="mt-5 flex flex-col-reverse gap-3 border-t border-white/10 pt-4 sm:mt-6 sm:flex-row sm:items-center sm:justify-between">
                    <button type="button" onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }} className="self-start text-sm font-medium text-[#a5b4fc] transition hover:text-white">Redefinir</button>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onCancel} className="rounded-lg bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15">Cancelar</button>
                        <button type="button" disabled={isLoading || isSaving} onClick={() => void applyCrop()} className="rounded-lg bg-[#5865f2] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#4752c4] disabled:cursor-not-allowed disabled:opacity-50">{isSaving ? "Aplicando..." : index + 1 < files.length ? "Próxima" : "Aplicar"}</button>
                    </div>
                </footer>
            </section>
        </div>
    );
}
