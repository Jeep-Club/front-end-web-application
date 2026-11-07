"use client"

import { useId } from "react";
import { useFormContext, useController } from "react-hook-form";
import { Dropzone } from "./dropzone/dropzone";
import { ListFile } from "./list/list";
import { twMerge } from "tailwind-merge";
import { UploadCloud } from "lucide-react";
import { FallBackFile } from "./fallback/fallback";
import type { FileRejection } from "react-dropzone";
import type { InputVariant } from "../input";

export type InputFileProps = {
    name: string;
    variant?: InputVariant;
    label?: string;
    required?: boolean;
    multiple?: boolean;
    /** Quantidade máxima permitida. Deixe 0 para ilimitado (ou validado apenas pelo Zod) */
    maxFiles?: number;
    /** Tamanho máximo em MB */
    maxSizeMB?: number;
    /** Formatos aceitos nativamente. Ex: { 'application/pdf': ['.pdf'] } */
    accept?: Record<string, string[]>;
    className?: string;
    /** Se true, exibe uma mensagem amigável quando a lista de arquivos estiver vazia */
    isFallback?: boolean;
    /** Formato do recorte; avatar circular, imagem comum quadrada e veículo horizontal. */
    cropShape?: "circle" | "square" | "landscape";
}

export function InputFile({
    name,
    label,
    required = false,
    maxFiles = 0,
    maxSizeMB = 5,
    multiple = false || maxFiles > 1,
    accept,
    className,
    isFallback = false,
    variant = "white",
}: InputFileProps) {
    const id = useId();
    const { control, setError, clearErrors } = useFormContext();
    const {
        field: { value, onChange },
        fieldState: { error }
    } = useController({ name, control, defaultValue: [] });

    const currentFiles: File[] = Array.isArray(value) ? value : (value ? [value] : []);

    const handleDrop = (acceptedFiles: File[], fileRejections: FileRejection[]) => {
        clearErrors(name);

        // Tratamento de Rejeições do Dropzone
        if (fileRejections.length > 0) {
            const rejection = fileRejections[0];
            if (rejection.errors[0].code === 'file-too-large') {
                setError(name, { type: "manual", message: `O arquivo excedeu o limite de ${maxSizeMB}MB.` });
            } else if (rejection.errors[0].code === 'too-many-files') {
                setError(name, { type: "manual", message: `Limite de arquivos excedido. O máximo é ${maxFiles}.` });
            } else {
                setError(name, { type: "manual", message: "Formato de arquivo não suportado." });
            }
            return;
        }

        if (!acceptedFiles.length) return;

        // Atualização do RHF
        if (multiple) {
            const newFiles = [...currentFiles, ...acceptedFiles];
            if (maxFiles > 0 && newFiles.length > maxFiles) {
                setError(name, { type: "manual", message: `Máximo de ${maxFiles} arquivo(s) permitido.` });
                onChange(newFiles.slice(0, maxFiles));
            } else {
                onChange(newFiles);
            }
        } else {
            onChange([acceptedFiles[0]]); // Substitui se não for múltiplo
        }
    };

    const handleRemove = (indexToRemove: number) => {
        const newFiles = currentFiles.filter((_, idx) => idx !== indexToRemove);
        onChange(newFiles.length > 0 ? newFiles : undefined); // Limpa o state se esvaziar
        if (error) clearErrors(name);
    };

    return (
        <div className={twMerge("w-full flex flex-col gap-2", className)}>
            {label && (
                <label htmlFor={id} className="text-sm font-medium text-j-gray-700">
                    {label} {required && <span className="text-j-red-200">*</span>}
                </label>
            )}

            <Dropzone
                inputId={id}
                inputLabel={label ?? "Selecionar arquivos"}
                variant={variant}
                onDrop={handleDrop}
                multiple={multiple}
                maxFiles={maxFiles > 0 ? maxFiles : undefined}
                maxSize={maxSizeMB * 1024 * 1024}
                accept={accept}
                className={error ? "border-j-red-500 bg-j-red-100/10" : undefined}
            >
                {/* Usando o Render Props para customizar as mensagens internas */}
                {({ isDragActive, isDragReject }) => (
                    <div className="flex flex-col items-center justify-center w-full">
                        <UploadCloud aria-hidden="true" size={32} className={twMerge("mb-2", error || isDragReject ? "text-j-red-500" : variant === "white" ? "text-j-gray-500" : "text-input-legacy-text")} />
                        <p className={twMerge("text-sm text-center", variant === "white" ? "text-j-gray-500" : "text-input-legacy-text")}>
                            {isDragActive && !isDragReject ? (
                                <span className={twMerge("font-semibold", variant === "white" ? "text-j-blue-700" : "text-j-yellow-300")}>Pode soltar os arquivos aqui...</span>
                            ) : isDragReject ? (
                                <span className="font-semibold text-j-red-500">Formato de arquivo não suportado.</span>
                            ) : error ? (
                                <span className="font-semibold text-j-red-500">{String(error.message)}</span>
                            ) : (
                                <><span className={twMerge("font-semibold", variant === "white" ? "text-j-blue-700" : "text-j-yellow-300")}>Clique</span> ou arraste os arquivos</>
                            )}
                        </p>
                        {!error && (
                            <p className={twMerge("text-xs mt-1", variant === "white" ? "text-j-gray-500" : "text-input-legacy-text")}>
                                Máximo: {maxSizeMB}MB {maxFiles > 0 ? `| Limite: ${maxFiles} arquivo(s)` : ''}
                            </p>
                        )}
                    </div>
                )}
            </Dropzone>

            {/* Renderização Condicional da Lista ou Fallback */}
            {currentFiles.length > 0 ? (
                <ListFile files={currentFiles} onRemove={handleRemove} variant={variant} />
            ) : isFallback ? (
                <FallBackFile className={variant === "white" ? "border border-j-gray-300 bg-j-white text-j-gray-500" : "bg-input-legacy-bg text-input-legacy-text"}>Nenhum arquivo enviado.</FallBackFile>
            ) : null}
        </div>
    );
}
