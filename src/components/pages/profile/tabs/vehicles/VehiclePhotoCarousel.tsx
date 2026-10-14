'use client';

import { useState } from "react";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";
import { ButtonIcon } from "@/components/common/button";
import { getMediaImageUrl } from "@/utils/media/imageUrl";

interface VehiclePhotoCarouselProps {
    photos?: (string | null | undefined)[];
    alt: string;
    className?: string;
}

export function VehiclePhotoCarousel({ photos, alt, className = "" }: VehiclePhotoCarouselProps) {
    const images = [...new Set((photos ?? []).filter((photo): photo is string => !!photo))].slice(0, 3);
    const [index, setIndex] = useState(0);
    const move = (direction: number) => setIndex((current) => (current + direction + images.length) % images.length);

    if (!images.length) {
        return <div className={`flex items-center justify-center bg-j-gray-100 text-j-gray-400 ${className}`}><Images size={32} /></div>;
    }

    return (
        <div className={`group relative overflow-hidden bg-j-gray-100 ${className}`} aria-label={`${images.length} fotos do veículo`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={getMediaImageUrl(images[index])} alt={`${alt} — foto ${index + 1} de ${images.length}`} className="h-full w-full object-cover" />
            {images.length > 1 && <>
                <ButtonIcon type="button" aria-label="Foto anterior" onClick={() => move(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white opacity-100 hover:bg-black/75 sm:opacity-0 sm:group-hover:opacity-100"><ChevronLeft size={18} /></ButtonIcon>
                <ButtonIcon type="button" aria-label="Próxima foto" onClick={() => move(1)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white opacity-100 hover:bg-black/75 sm:opacity-0 sm:group-hover:opacity-100"><ChevronRight size={18} /></ButtonIcon>
                <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/50 px-2 py-1" aria-label={`Foto ${index + 1} de ${images.length}`}>
                    {images.map((_, dot) => <button key={dot} type="button" aria-label={`Mostrar foto ${dot + 1}`} onClick={() => setIndex(dot)} className={`h-2 w-2 rounded-full ${dot === index ? "bg-white" : "bg-white/50"}`} />)}
                </div>
            </>}
        </div>
    );
}
