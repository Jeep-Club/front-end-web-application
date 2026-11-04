"use client"

import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";
import Image from "next/image";
import type { InputVariant } from "../../../input";
import { twMerge } from "tailwind-merge";

export function ImageThumbnail({ file, children, variant = "white" }: { file: File, children?: React.ReactNode, variant?: InputVariant}) {
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
        <div className={twMerge("relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden border group", variant === "white" ? "border-j-gray-300 bg-j-white" : "border-input-border bg-input-bg")}>
            {preview ? (
                <Image 
                    src={preview} 
                    alt={`Visualização do arquivo: ${file.name}`}
                    fill
                    unoptimized
                    className="object-contain p-1 transition-transform duration-300 group-hover:scale-105"
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
