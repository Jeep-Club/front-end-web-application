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
    cropShape = "square"
}: InputFileImageProps) {
    const accept = { 'image/jpeg': [], 'image/png': [], 'image/webp': [] }
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

    const handleDrop = (acceptedFiles: File[], fileRejections: any[]) => {
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
        onChange(newFiles.length > 0 ? newFiles : undefined);
        if (error) clearErrors(name);
    };

    return (
        <div className={twMerge("w-full flex flex-col gap-2", className)}>
            {label && (
                <label htmlFor={id} className="text-sm font-medium text-j-gray-300">
                    {label} {required && <span className="text-j-red-200">*</span>}
                </label>
            )}

            <Dropzone
                onDrop={handleDrop}
                multiple={multiple}
                maxFiles={maxFiles > 0 ? maxFiles : undefined}
                maxSize={maxSizeMB * 1024 * 1024}
                accept={accept}
                className={error ? "border-j-red-300 bg-j-red-300/10" : ""}
            >
                {({ isDragActive, isDragReject }) => (
                    <div className="flex flex-col items-center justify-center w-full">
                        <UploadCloud size={32} className={error || isDragReject ? "text-j-red-300 mb-2" : "text-j-gray-300 mb-2"} />
                        <p className="text-sm text-center text-j-gray-300">
                            {isDragActive && !isDragReject ? (
                                <span className="font-semibold text-j-yellow-400">Pode soltar as imagens aqui...</span>
                            ) : isDragReject ? (
                                <span className="font-semibold text-j-red-300">Formato de imagem não suportado.</span>
                            ) : error ? (
                                <span className="font-semibold text-j-red-300">{String(error.message)}</span>
                            ) : (
                                <><span className="font-semibold text-j-yellow-400">Clique</span> ou arraste as imagens</>
                            )}
                        </p>
                        {!error && (
                            <p className="text-xs text-j-gray-400 mt-1">
                                Máximo por imagem: {maxSizeMB} MiB {maxFiles > 0 ? `| Limite: ${maxFiles} imagem(ns)` : ''}
                            </p>
                        )}
                    </div>
                )}
            </Dropzone>

            {/* Renderização Condicional da Lista ou Fallback */}
            {currentFiles.length > 0 ? (
                <ListFileImage files={currentFiles} onRemove={handleRemove}/>
            ) : isFallback ? (
                <FallBackFile>
                    Nenhuma imagem enviada.
                </FallBackFile>
            ) : null}
            {filesToCrop && <ImageCropDialog files={filesToCrop} shape={cropShape} onCancel={() => setFilesToCrop(null)} onComplete={(croppedFiles) => { addFiles(croppedFiles); setFilesToCrop(null); }} />}
        </div>
    );
}
