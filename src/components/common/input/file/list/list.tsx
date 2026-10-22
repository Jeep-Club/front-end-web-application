"use client"

import { FileText, FilePlay, FileImage } from "lucide-react";
import { formatFileSize } from "@/utils/formats/formatFileSize";
import { twMerge } from "tailwind-merge";
import { RemoveFile } from "../actions/remove";
import type { InputVariant } from "../../input";

export type ListProps = {
    files: File[];
    /** * Callback chamado quando o usuário clica no botão de remover.
     * Recebe o index do arquivo no array.
     */
    onRemove: (index: number) => void;
    className?: string;
    variant?: InputVariant;
}

// Helper para escolher o ícone baseado no MIME Type
function getFileIcon(type: string) {
    if (type.startsWith('image/')) return <FileImage size={20}/>;
    if (type.startsWith('video/')) return <FilePlay size={20}/>;
    return <FileText size={20}/>;
}

export function ListFile({ files, onRemove, className, variant = "white" }: ListProps) {
    if (!files || files.length === 0) return null;

    return (
        <ul className={twMerge("flex flex-col gap-2 w-full mt-2", className)}>
            {files.map((file, idx) => (
                <li 
                    key={`${file.name}-${idx}`} 
                    className={twMerge("flex items-center justify-between p-3 rounded-lg border transition-colors", variant === "white" ? "border-j-gray-300 bg-j-white" : "bg-input-bg border-input-border hover:border-input-border-hover")}
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className={twMerge("w-10 h-10 flex items-center justify-center rounded-md shrink-0", variant === "white" ? "bg-j-gray-100 text-j-gray-500" : "bg-background text-j-gray-400")}>
                            {getFileIcon(file.type)}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className={twMerge("text-sm font-medium truncate", variant === "white" ? "text-j-gray-700" : "text-input-text")} title={file.name}>
                                {file.name}
                            </span>
                            <span className={twMerge("text-xs", variant === "white" ? "text-j-gray-500" : "text-j-white/70")}>
                                {formatFileSize(file.size)}
                            </span>
                        </div>
                    </div>
                    
                    <RemoveFile onClick={()=>{onRemove(idx)}}/>
                </li>
            ))}
        </ul>
    );
}
