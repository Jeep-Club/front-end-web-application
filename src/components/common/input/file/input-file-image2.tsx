"use client"

import { useId, useState } from "react";
import { useFormContext, useController } from "react-hook-form";
import { DropZone } from "./dropzone";
import { ImageThumbnail } from "./list/list-image/image-thumbnail";
import { twMerge } from "tailwind-merge";
import { InputFileProps } from "./input-file";
import { Image as ImageIcon } from "lucide-react";
import { RemoveFile } from "./actions/remove";
import { ImageCropDialog } from "./image-crop-dialog";
import type { FileRejection } from "react-dropzone";
import { imageAccept } from "@/utils/media/imageAccept";

export type InputFileImageProps = Omit<InputFileProps, 'accept' | 'isFallback'>

export function InputFileImage2({
    name,
    label,
    required = false,
    maxFiles = 0,
    maxSizeMB = 5,
    multiple = false || maxFiles > 1,
    className,
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

    const handleDrop = (acceptedFiles: File[], fileRejections: FileRejection[]) => {
        clearErrors(name);

        if (fileRejections.length > 0) {
            const rejection = fileRejections[0];
            if (rejection.errors[0].code === 'file-invalid-type') {
                 setError(name, { type: "manual", message: "Apenas imagens são aceitas." });
            } else if (rejection.errors[0].code === 'file-too-large') {
                setError(name, { type: "manual", message: `A imagem excede o limite de ${maxSizeMB}MB.` });
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

            <div className={`flex gap-3 w-full flex-wrap`}>
                

                {currentFiles.length < 1 || multiple ? 
                    <DropZone.Image
                        inputId={id}
                        inputLabel={label ?? "Selecionar imagens"}
                        variant={variant}
                        onDrop={handleDrop}
                        multiple={multiple}
                        maxFiles={maxFiles > 0 ? maxFiles : undefined}
                        maxSize={maxSizeMB * 1024 * 1024}
                        accept={accept}
                        className={twMerge(variant === "gray" && "bg-input-legacy-bg", error && "border-j-red-500 bg-j-red-100/10")}
                    >
                        {({ isDragReject }) => (
                            <>
                                <ImageIcon size={32} className={error || isDragReject ? "text-j-red-300 mb-2" : "text-j-gray-400 mb-2"} />  
                            </>
                        )}
                    </DropZone.Image>
                : null }
                
                {currentFiles.map((file, idx) => (
                    <ImageThumbnail 
                        key={`${file.name}-${idx}`} 
                        file={file} 
                        variant={variant}
                    >
                        {/* Fundo escuro sutil ao passar o mouse para dar contraste no botão */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
                        <RemoveFile 
                            onClick={()=>{handleRemove(idx)}} 
                            aria-label={`Remover imagem ${file.name}`}
                            title="Remover imagem"
                            className="absolute top-1.5 right-1.5 z-10 flex size-8 items-center justify-center rounded-full bg-white text-red-600 shadow-md hover:bg-red-50 hover:text-red-700"
                        />
                    </ImageThumbnail>
                ))}
            </div>
            { error && <span className="text-j-red-300 text-xs">{String(error.message)}</span> }
            {filesToCrop && <ImageCropDialog files={filesToCrop} shape={cropShape} onCancel={() => setFilesToCrop(null)} onComplete={(croppedFiles) => { onChange(multiple ? [...currentFiles, ...croppedFiles].slice(0, maxFiles || undefined) : [croppedFiles[0]]); setFilesToCrop(null); }} />}
        </div>
    );
}
