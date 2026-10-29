"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getMediaImageUrl } from "@/utils/media/imageUrl";

export function PublicationPhotoCarousel({ images, title }: {
    images: { storageKey: string; position: number }[];
    title: string;
}) {
    const photos = [...images].sort((a, b) => a.position - b.position);
    const [selected, setSelected] = useState(0);
    const start = useRef<{ x: number; y: number } | null>(null);
    const index = Math.min(selected, Math.max(photos.length - 1, 0));
    const move = (direction: number) => setSelected((index + direction + photos.length) % photos.length);
    if (!photos.length) return null;

    return <section role="region" aria-roledescription="carrossel" aria-label="Fotos da publicação" className="w-full">
        <div
            tabIndex={photos.length > 1 ? 0 : undefined}
            className="relative aspect-video w-full touch-pan-y overflow-hidden rounded-xl bg-j-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-blue-800"
            onKeyDown={(event) => {
                if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
                if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
            }}
            onTouchStart={(event) => { start.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }}
            onTouchEnd={(event) => {
                if (!start.current) return;
                const dx = event.changedTouches[0].clientX - start.current.x;
                const dy = event.changedTouches[0].clientY - start.current.y;
                start.current = null;
                if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
            }}
            onTouchCancel={() => { start.current = null; }}
        >
            <Image src={getMediaImageUrl(photos[index].storageKey)} alt={`${title} — foto ${index + 1} de ${photos.length}`} fill unoptimized sizes="(min-width: 768px) 720px, 90vw" className="object-contain" />
            {photos.length > 1 && <>
                <button type="button" aria-label="Foto anterior" onClick={() => move(-1)} className="absolute left-2 top-1/2 z-10 flex size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#0b2054] text-white shadow-[0_2px_10px_rgba(0,0,0,0.45)] hover:bg-[#17366f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-yellow-300"><ChevronLeft size={28} strokeWidth={3} className="stroke-white" /></button>
                <button type="button" aria-label="Próxima foto" onClick={() => move(1)} className="absolute right-2 top-1/2 z-10 flex size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#0b2054] text-white shadow-[0_2px_10px_rgba(0,0,0,0.45)] hover:bg-[#17366f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-yellow-300"><ChevronRight size={28} strokeWidth={3} className="stroke-white" /></button>
            </>}
        </div>
        {photos.length > 1 && <div className="mt-2 flex flex-wrap items-center justify-center gap-1">
            {photos.map((photo, photoIndex) => <button key={`${photo.storageKey}-${photoIndex}`} type="button" aria-label={`Mostrar foto ${photoIndex + 1}`} aria-pressed={photoIndex === index} onClick={() => setSelected(photoIndex)} className="flex size-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-j-blue-800"><span className={`size-2.5 rounded-full ${photoIndex === index ? "bg-j-blue-800" : "bg-j-gray-300"}`} /></button>)}
            <p aria-live="polite" aria-atomic="true" className="w-full text-center text-sm text-j-gray-600">Foto {index + 1} de {photos.length}</p>
        </div>}
    </section>;
}
