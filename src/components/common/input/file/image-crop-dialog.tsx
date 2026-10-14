"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, RotateCcw, X } from "lucide-react";

const VIEW_SIZE = 320;
const OUTPUT_SIZE = 512;

type ImageCropDialogProps = {
    files: File[];
    onComplete: (files: File[]) => void;
    onCancel: () => void;
};

/** A small, dependency-free square cropper shared by every image upload field. */
export function ImageCropDialog({ files, onComplete, onCancel }: ImageCropDialogProps) {
    const [index, setIndex] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [dragStart, setDragStart] = useState<{ x: number; y: number; originX: number; originY: number } | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const croppedFilesRef = useRef<File[]>([]);
    const currentFile = files[index];
    const sourceUrl = useMemo(() => currentFile ? URL.createObjectURL(currentFile) : "", [currentFile]);

    useEffect(() => {
        setZoom(1);
        setOffset({ x: 0, y: 0 });
        setIsLoading(true);
        croppedFilesRef.current = [];
    }, [files, index]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const image = imageRef.current;
        const context = canvas?.getContext("2d");
        if (!canvas || !image || !context || !image.complete || !image.naturalWidth) return;

        const coverScale = Math.max(VIEW_SIZE / image.naturalWidth, VIEW_SIZE / image.naturalHeight);
        const width = image.naturalWidth * coverScale * zoom;
        const height = image.naturalHeight * coverScale * zoom;
        const left = (VIEW_SIZE - width) / 2 + offset.x;
        const top = (VIEW_SIZE - height) / 2 + offset.y;
        context.clearRect(0, 0, VIEW_SIZE, VIEW_SIZE);
        context.drawImage(image, left, top, width, height);
    }, [zoom, offset, isLoading, index, sourceUrl]);

    useEffect(() => () => {
        if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    }, [sourceUrl]);

    const changeOffset = (dx: number, dy: number) => {
        const image = imageRef.current;
        if (!image) return;
        const coverScale = Math.max(VIEW_SIZE / image.naturalWidth, VIEW_SIZE / image.naturalHeight) * zoom;
        const width = image.naturalWidth * coverScale;
        const height = image.naturalHeight * coverScale;
        setOffset((current) => ({
            x: Math.min(0, Math.max(VIEW_SIZE - width, current.x + dx)),
            y: Math.min(0, Math.max(VIEW_SIZE - height, current.y + dy)),
        }));
    };

    const saveCrop = async () => {
        const source = imageRef.current;
        if (!source || isSaving) return;
        setIsSaving(true);
        try {
            const output = document.createElement("canvas");
            output.width = OUTPUT_SIZE;
            output.height = OUTPUT_SIZE;
            const context = output.getContext("2d");
            if (!context) throw new Error("Não foi possível preparar o recorte.");

            const coverScale = Math.max(VIEW_SIZE / source.naturalWidth, VIEW_SIZE / source.naturalHeight) * zoom;
            const width = source.naturalWidth * coverScale;
            const height = source.naturalHeight * coverScale;
            const left = (VIEW_SIZE - width) / 2 + offset.x;
            const top = (VIEW_SIZE - height) / 2 + offset.y;
            context.drawImage(source, -left * OUTPUT_SIZE / VIEW_SIZE, -top * OUTPUT_SIZE / VIEW_SIZE, width * OUTPUT_SIZE / VIEW_SIZE, height * OUTPUT_SIZE / VIEW_SIZE);

            const mimeType = currentFile.type === "image/png" ? "image/png" : "image/jpeg";
            const blob = await new Promise<Blob>((resolve, reject) => output.toBlob((result) => result ? resolve(result) : reject(new Error("Não foi possível gerar a imagem recortada.")), mimeType, 0.92));
            const extension = mimeType === "image/png" ? "png" : "jpg";
            croppedFilesRef.current.push(new File([blob], currentFile.name.replace(/\.[^.]+$/, `.${extension}`), { type: mimeType, lastModified: Date.now() }));

            if (index + 1 < files.length) {
                setIsSaving(false);
                setIndex(index + 1);
                setIsLoading(true);
            } else {
                onComplete(croppedFilesRef.current);
            }
        } catch {
            setIsSaving(false);
        }
    };

    if (!currentFile) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
            <section role="dialog" aria-modal="true" aria-labelledby="image-crop-title" className="w-full max-w-md rounded-2xl bg-white p-5 text-j-gray-800 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 id="image-crop-title" className="text-lg font-bold text-j-blue-800">Ajustar imagem</h2>
                        <p className="text-sm text-j-gray-500">Arraste para enquadrar{files.length > 1 ? ` · ${index + 1} de ${files.length}` : ""}</p>
                    </div>
                    <button type="button" onClick={onCancel} aria-label="Cancelar recorte" className="rounded-full p-2 hover:bg-j-gray-100"><X size={20} /></button>
                </div>
                <div className="relative mx-auto aspect-square w-full max-w-80 touch-none overflow-hidden rounded-xl bg-j-gray-100" onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); setDragStart({ x: event.clientX, y: event.clientY, originX: offset.x, originY: offset.y }); }} onPointerMove={(event) => { if (!dragStart) return; const scale = VIEW_SIZE / event.currentTarget.getBoundingClientRect().width; changeOffset((event.clientX - dragStart.x) * scale - (offset.x - dragStart.originX), (event.clientY - dragStart.y) * scale - (offset.y - dragStart.originY)); }} onPointerUp={() => setDragStart(null)} onPointerCancel={() => setDragStart(null)}>
                    <img ref={imageRef} src={sourceUrl} alt="Prévia da imagem para recorte" className="hidden" onLoad={() => setIsLoading(false)} />
                    <canvas ref={canvasRef} width={VIEW_SIZE} height={VIEW_SIZE} className="h-full w-full" />
                    {!isLoading && <div className="pointer-events-none absolute inset-0 border border-white/50" />}
                    {isLoading && <div className="absolute inset-0 flex items-center justify-center text-sm text-j-gray-500">Carregando imagem…</div>}
                </div>
                <div className="mt-4 flex items-center gap-3">
                    <Minus size={17} aria-hidden="true" />
                    <input aria-label="Zoom da imagem" type="range" min="1" max="3" step="0.01" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="w-full accent-j-blue-700" />
                    <Plus size={17} aria-hidden="true" />
                    <button type="button" onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }} aria-label="Redefinir enquadramento" className="rounded-lg p-2 text-j-blue-800 hover:bg-j-gray-100"><RotateCcw size={17} /></button>
                </div>
                <div className="mt-5 flex justify-end gap-3">
                    <button type="button" onClick={onCancel} className="rounded-xl px-4 py-2 text-sm font-semibold text-j-gray-600 hover:bg-j-gray-100">Cancelar</button>
                    <button type="button" disabled={isLoading || isSaving} onClick={() => void saveCrop()} className="rounded-xl bg-j-blue-800 px-5 py-2 text-sm font-bold text-white hover:bg-j-blue-700 disabled:opacity-50">{isSaving ? "Preparando…" : index + 1 < files.length ? "Próxima" : "Usar imagem"}</button>
                </div>
            </section>
        </div>
    );
}
