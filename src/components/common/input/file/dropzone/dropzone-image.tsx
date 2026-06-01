"use client"

import { useDropzone, DropzoneOptions, DropzoneState } from "react-dropzone";
import { twMerge } from "tailwind-merge";
import { Image as ImageIcon } from "lucide-react";

export type DropzoneProps = DropzoneOptions & {
    className?: string;
    /** * Se true (padrão), aplica o estilo visual da caixa tracejada. 
     * Se false, atua como um componente headless puro. 
     */
    dStyle?: boolean;
    /** * Permite passar React Nodes comuns ou uma função (Render Props) 
     * para acessar o estado interno do dropzone e criar designs 100% customizados.
     */
    children?: React.ReactNode | ((state: DropzoneState) => React.ReactNode);
}

export function DropzoneImage({ className, dStyle = true, children,...dropzoneOptions }: DropzoneProps) {
    const dropzoneState = useDropzone(dropzoneOptions);
    const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = dropzoneState;

    return (
        <div 
            {...getRootProps()} 
            className={twMerge(
                dStyle && 
                `
                relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-j-gray-400
                rounded-lg transition-colors cursor-pointer bg-transparent
                 h-24 w-24 sm:w-28 sm:h-28
                
                `,
                isDragActive && !isDragReject && "border-j-yellow-400 bg-j-yellow-400/10",
                isDragReject && "border-j-red-300 bg-j-red-300/10",
                isDragAccept && "border-j-green-300 bg-j-green-300/10",
                !isDragActive && "text-input-text hover:border-j-gray-200",
                
                // Desabilita visualmente se a prop disabled for passada no hook
                dropzoneOptions.disabled && "opacity-50 pointer-events-none",
                className,
            )}
        >
            <input {...getInputProps()} />
            
            {/* Renderização Flexível */}
            {typeof children === 'function' ? (
                // Modo 1: Render Props (Permite criar UIs complexas lendo o estado do dropzone)
                children(dropzoneState)
            ) : children ? (
                // Modo 2: Children normal (Apenas injeta elementos dentro da div)
                children
            ) : dStyle ? (
                // Modo 3: Fallback UI Padrão (Se não passar nada e dStyle for true)
                <>
                    <ImageIcon size={32} className={isDragReject ? "text-j-red-300 mb-2" : "text-j-gray-400 mb-2"} /> 
                </>
            ) : null}
        </div>
    );
}