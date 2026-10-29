"use client"

import React, { useId, useState } from "react";
import { useFormContext, useController } from "react-hook-form";
import { Dropzone } from "./dropzone/dropzone";
import { ListFileImage } from "./list/list-image/list-image";
import { twMerge } from "tailwind-merge";
import { InputFileProps } from "./input-file";
import { UploadCloud } from "lucide-react";
import { FallBackFile } from "./fallback/fallback";
import { ImageCropDialog } from "./image-crop-dialog";
import type { FileRejection } from "react-dropzone";
import { imageAccept } from "@/utils/media/imageAccept";

export type InputFileImageProps = Omit<InputFileProps, 'accept'>

export function InputFileImage({
    name,
    label,
    required = false,
    maxFiles = 0,
    maxSizeMB = 5,
    multiple = false || maxFiles > 1,
    className,
    isFallback = false,
    cropShape = "square",
    variant = "white",
}: InputFileImageProps) {
    const accept = imageAccept;
    const id = useId();
    const { control, setError, clearErrors } = useFormContext();
    const {
        field: { value, onChange },
        fieldState: { error }
    } = useController({ name, control, defaultValue: [] });

    const currentFiles: File[] = Array.isArray(value) ? value : (value ? [value] : []);
    const [filesToCrop, setFilesToCrop] = useState<File[] | null>(null);

    const addFiles = (acceptedFiles: File[]) => {
        if (multiple) {
            const newFiles = [...currentFiles, ...acceptedFiles];
            if (maxFiles > 0 && newFiles.length > maxFiles) {
                setError(name, { type: "manual", message: `Máximo de ${maxFiles} imagem(ns) permitida(s).` });
                onChange(newFiles.slice(0, maxFiles));
            } else {
                onChange(newFiles);
            }
        } else {
            onChange([acceptedFiles[0]]);
        }
    };

    const handleDrop = (acceptedFiles: File[], fileRejections: FileRejection[]) => {
        clearErrors(name);

        if (fileRejections.length > 0) {
            const rejection = fileRejections[0];
            if (rejection.errors[0].code === 'file-invalid-type') {
                 setError(name, { type: "manual", message: "Apenas imagens são aceitas." });
            } else if (rejection.errors[0].code === 'file-too-large') {
                setError(name, { type: "manual", message: `A imagem excede o limite de ${maxSizeMB} MiB. Escolha um arquivo menor.` });
            } else if (rejection.errors[0].code === 'too-many-files') {
                setError(name, { type: "manual", message: `Limite excedido. O máximo é de ${maxFiles} imagem(ns).` });
            } else {
                setError(name, { type: "manual", message: "Imagem não suportada." });
            }
            return;
        }

        if (!acceptedFiles.length) return;
        const availableFiles = maxFiles > 0 ? Math.max(maxFiles - (multiple ? currentFiles.length : 0), 0) : acceptedFiles.length;
        const filesToProcess = acceptedFiles.slice(0, multiple ? availableFiles : 1);
        if (!filesToProcess.length) {
            setError(name, { type: "manual", message: `Máximo de ${maxFiles} imagem(ns) permitida(s).` });
            return;
        }
        setFilesToCrop(filesToProcess);
    };

    const handleRemove = (indexToRemove: number) => {
        const newFiles = currentFiles.filter((_, idx) => idx !== indexToRemove);
        onChange(newFiles);
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
                inputLabel={label ?? "Selecionar imagens"}
                variant={variant}
                onDrop={handleDrop}
                multiple={multiple}
                maxFiles={maxFiles > 0 ? maxFiles : undefined}
                maxSize={maxSizeMB * 1024 * 1024}
                accept={accept}
                className={error ? "border-j-red-500 bg-j-red-100/10" : undefined}
            >
                {({ isDragActive, isDragReject }) => (
                    <div className="flex flex-col items-center justify-center w-full">
                        <UploadCloud aria-hidden="true" size={32} className={twMerge("mb-2", error || isDragReject ? "text-j-red-500" : variant === "white" ? "text-j-gray-500" : "text-input-legacy-text")} />
                        <p className={twMerge("text-sm text-center", variant === "white" ? "text-j-gray-500" : "text-input-legacy-text")}>
                            {isDragActive && !isDragReject ? (
                                <span className={twMerge("font-semibold", variant === "white" ? "text-j-blue-700" : "text-j-yellow-300")}>Pode soltar as imagens aqui...</span>
                            ) : isDragReject ? (
                                <span className="font-semibold text-j-red-500">Formato de imagem não suportado.</span>
                            ) : error ? (
                                <span className="font-semibold text-j-red-500">{String(error.message)}</span>
                            ) : (
                                <><span className={twMerge("font-semibold", variant === "white" ? "text-j-blue-700" : "text-j-yellow-300")}>Clique</span> ou arraste as imagens</>
                            )}
                        </p>
                        {!error && (
                            <p className={twMerge("text-xs mt-1", variant === "white" ? "text-j-gray-500" : "text-input-legacy-text")}>
                                Máximo por imagem: {maxSizeMB} MiB {maxFiles > 0 ? `| Limite: ${maxFiles} imagem(ns)` : ''}
                            </p>
                        )}
                    </div>
                )}
            </Dropzone>

            {/* Renderização Condicional da Lista ou Fallback */}
            {currentFiles.length > 0 ? (
                <ListFileImage files={currentFiles} onRemove={handleRemove} variant={variant}/>
            ) : isFallback ? (
                <FallBackFile className={variant === "white" ? "border border-j-gray-300 bg-j-white text-j-gray-500" : "bg-input-legacy-bg text-input-legacy-text"}>
                    Nenhuma imagem enviada.
                </FallBackFile>
            ) : null}
            {filesToCrop && <ImageCropDialog files={filesToCrop} shape={cropShape} onCancel={() => setFilesToCrop(null)} onComplete={(croppedFiles) => { addFiles(croppedFiles); setFilesToCrop(null); }} />}
        </div>
    );
}
