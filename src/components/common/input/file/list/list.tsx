"use client"

import { FileText, FilePlay, FileImage, X } from "lucide-react";
import { formatFileSize } from "@/utils/formats/formatFileSize";
import { twMerge } from "tailwind-merge";
import { RemoveFile } from "../actions/remove";

export type ListProps = {
    files: File[];
    /** * Callback chamado quando o usuário clica no botão de remover.
     * Recebe o index do arquivo no array.
     */
    onRemove: (index: number) => void;
    className?: string;
}

// Helper para escolher o ícone baseado no MIME Type
function getFileIcon(type: string) {
    if (type.startsWith('image/')) return <FileImage size={20}/>;
    if (type.startsWith('video/')) return <FilePlay size={20}/>;
    return <FileText size={20}/>;
}

export function ListFile({ files, onRemove, className }: ListProps) {
    if (!files || files.length === 0) return null;

    return (
        <ul className={twMerge("flex flex-col gap-2 w-full mt-2", className)}>
            {files.map((file, idx) => (
                <li 
                    key={`${file.name}-${idx}`} 
                    className="flex items-center justify-between p-3 rounded-lg bg-input-bg border border-input-border hover:border-input-border-hover transition-colors"
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 flex items-center justify-center bg-background rounded-md shrink-0 text-j-gray-400">
                            {getFileIcon(file.type)}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium text-input-text truncate" title={file.name}>
                                {file.name}
                            </span>
                            <span className="text-xs text-j-gray-400">
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