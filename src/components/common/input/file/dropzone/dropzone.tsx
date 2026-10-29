"use client"

import { useDropzone, DropzoneOptions, DropzoneState } from "react-dropzone";
import { twMerge } from "tailwind-merge";
import { UploadCloud } from "lucide-react";
import type { InputVariant } from "../../input";

export type DropzoneProps = DropzoneOptions & {
    inputId?: string;
    inputLabel?: string;
    variant?: InputVariant;
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

export function Dropzone({ className, dStyle = true, children, inputId, inputLabel, variant = "gray", ...dropzoneOptions }: DropzoneProps) {
    const dropzoneState = useDropzone(dropzoneOptions);
    const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = dropzoneState;

    return (
        <>
        {/* O botão visual controla o seletor; o input fica fora dele para evitar controles aninhados. */}
        <input {...getInputProps({ id: inputId, style: { display: "none" } })} />
        <div 
            {...getRootProps({ role: "button", "aria-label": inputLabel })}
            data-file-dropzone
            className={twMerge(
                dStyle && 
                `
                  relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors cursor-pointer bg-input-bg
                  w-full   
                `,
                dStyle && variant === "white" && "border-j-gray-300 bg-j-white text-j-gray-700",
                isDragActive && !isDragReject && "border-j-yellow-400 bg-j-yellow-400/10",
                isDragReject && "border-j-red-300 bg-j-red-300/10",
                isDragAccept && "border-j-green-300 bg-j-green-300/10",
                !isDragActive && (variant === "white" ? "border-j-gray-300 text-j-gray-700 hover:border-j-blue-500" : "border-transparent text-input-text hover:border-j-gray-200"),
                
                // Desabilita visualmente se a prop disabled for passada no hook
                dropzoneOptions.disabled && "opacity-50 pointer-events-none",
                className,
            )}
        >
            
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
                    <UploadCloud size={32} className="text-j-gray-300 mb-2" />
                    <p className="text-sm text-center text-j-gray-300">
                        {isDragActive && !isDragReject ? (
                            <span className="font-semibold text-j-yellow-400">Pode soltar os arquivos aqui...</span>
                        ) : isDragReject ? (
                            <span className="font-semibold text-j-red-300">Arquivo não suportado</span>
                        ) : (
                            <><span className="font-semibold text-j-yellow-400">Clique</span> ou arraste os arquivos</>
                        )}
                    </p>
                </>
            ) : null}
        </div>
        </>
    );
}
