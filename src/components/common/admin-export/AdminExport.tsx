"use client";

import { useId, useState } from "react";
import { Download, LoaderCircle } from "lucide-react";
import { twMerge } from "tailwind-merge";

export type AdminExportFormat = "CSV" | "PDF";
export type AdminExportFile = { base64: string; contentType: string; filename: string };

/** Shared format picker and feedback for admin exports; permission checks stay with each consumer/action. */
export function AdminExport({
    label = "Exportar",
    formats = ["CSV", "PDF"],
    disabled = false,
    className = "",
    onExport,
}: {
    label?: string;
    formats?: AdminExportFormat[];
    disabled?: boolean;
    className?: string;
    onExport: (format: AdminExportFormat) => Promise<void | AdminExportFile>;
}) {
    const [format, setFormat] = useState<AdminExportFormat>(formats[0] ?? "CSV");
    const [pending, setPending] = useState(false);
    const [message, setMessage] = useState("");
    const [failed, setFailed] = useState(false);
    const formatId = useId();

    async function exportFile() {
        if (pending || disabled || !formats.includes(format)) return;
        setPending(true);
        setMessage("");
        setFailed(false);
        try {
            const file = await onExport(format);
            if (file) {
                const bytes = Uint8Array.from(atob(file.base64), (character) => character.charCodeAt(0));
                const url = URL.createObjectURL(new Blob([bytes], { type: file.contentType }));
                const link = document.createElement("a");
                link.href = url;
                link.download = file.filename;
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.setTimeout(() => URL.revokeObjectURL(url), 1000);
            }
            setMessage(`Arquivo ${format} gerado e download iniciado.`);
        } catch (error) {
            setFailed(true);
            setMessage(error instanceof Error ? error.message : "Não foi possível gerar o arquivo. Tente novamente.");
        } finally {
            setPending(false);
        }
    }

    return <div className={twMerge("flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center", className)}>
        <label className="sr-only" htmlFor={formatId}>Formato do arquivo</label>
        <select id={formatId} value={format} disabled={disabled || pending || !formats.length} onChange={(event) => setFormat(event.target.value as AdminExportFormat)} className="min-h-10 w-full min-w-0 rounded-lg border border-j-gray-300 bg-j-white px-3 text-sm text-j-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-blue-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
            {formats.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
        <button type="button" disabled={disabled || pending || !formats.length} onClick={() => void exportFile()} className="inline-flex min-h-10 w-full min-w-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-j-blue-800 px-4 text-sm font-bold text-j-white transition-colors hover:bg-j-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-blue-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
            {pending ? <><LoaderCircle size={16} className="animate-spin" aria-hidden="true" />Gerando...</> : <><Download size={16} aria-hidden="true" />{label} {format}</>}
        </button>
        {message && <p role={failed ? "alert" : "status"} aria-live={failed ? "assertive" : "polite"} className={`min-w-0 basis-full break-words text-xs ${failed ? "text-j-red-600" : "text-j-green-700"}`}>{message}{failed && <span className="ml-1">Selecione o formato e tente novamente.</span>}</p>}
    </div>;
}
