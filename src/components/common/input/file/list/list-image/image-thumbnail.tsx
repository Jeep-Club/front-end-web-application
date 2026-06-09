"use client"

import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";
import Image from "next/image";

export function ImageThumbnail({ file, children }: { file: File, children?: React.ReactNode}) {
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (!file.type.startsWith('image/')) return;

        const objectUrl = URL.createObjectURL(file);
        
        Promise.resolve().then(() => setPreview(objectUrl));

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [file]);

    return (
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden border border-input-border bg-input-bg group">
            {preview ? (
                <Image 
                    src={preview} 
                    alt={`Visualização do arquivo: ${file.name}`}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-j-gray-400">
                    <ImageOff size={24} />
                    <span className="text-[10px] mt-1 text-center leading-tight px-1">Formato<br/>inválido</span>
                </div>
            )}

            {children}
        </div>
    );
}