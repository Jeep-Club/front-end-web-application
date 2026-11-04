"use client"

import { ListProps } from "../list";
import { ImageThumbnail } from "./image-thumbnail";
import { twMerge } from "tailwind-merge";
import { RemoveFile } from "../../actions/remove";

export type ListImageProps = ListProps;

export function ListFileImage({ files, onRemove, className, variant = "white" }: ListImageProps) {
    if (!files || files.length === 0) return null;

    return (
        <div className={twMerge("flex gap-3", className)}>
            {files.map((file, idx) => (
                <ImageThumbnail 
                    key={`${file.name}-${idx}`} 
                    file={file} 
                    variant={variant}
                >
                    {/* Fundo escuro sutil ao passar o mouse para dar contraste no botão */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
                    <RemoveFile 
                        onClick={()=>{onRemove(idx)}} 
                        aria-label={`Remover imagem ${file.name}`}
                        title="Remover imagem"
                        className="absolute top-1.5 right-1.5 z-10 flex size-8 items-center justify-center rounded-full bg-white text-red-600 shadow-md hover:bg-red-50 hover:text-red-700"
                    />
                </ImageThumbnail>
            ))}
        </div>
    );
}

