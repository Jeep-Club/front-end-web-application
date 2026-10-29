"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/common/button";
import { SESSION_EXPIRED_MESSAGE } from "@/utils/http/apiError";

export default function PaymentReceipt({ id }: { id: number }) {
    const [attempt, setAttempt] = useState(0);
    const [receipt, setReceipt] = useState<{ url: string; type: string } | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();
        let objectUrl: string | undefined;
        async function load() {
            try {
                const response = await fetch(`/api/payments/${id}/receipt`, { signal: controller.signal, cache: "no-store" });
                if (!response.ok) {
                    const problem = await response.json().catch(() => null);
                    if (response.status === 401) window.location.href = "/api/auth/logout";
                    throw new Error(response.status === 401 ? SESSION_EXPIRED_MESSAGE : problem?.message || "Não foi possível carregar o comprovante.");
                }
                const blob = await response.blob();
                if (controller.signal.aborted) return;
                objectUrl = URL.createObjectURL(blob);
                setReceipt({ url: objectUrl, type: blob.type });
            } catch (error) {
                if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Não foi possível carregar o comprovante.");
            }
        }
        void load();
        return () => {
            controller.abort();
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [id, attempt]);

    return <section className="rounded-2xl border border-j-gray-200 bg-j-white p-4 md:p-6">
        <h2 className="mb-4 text-lg font-black text-j-blue-800">Comprovante</h2>
        {error ? <div role="alert" className="flex flex-col items-start gap-3 text-red-700"><p>{error}</p><Button onClick={() => { setError(""); setReceipt(null); setAttempt(value => value + 1); }}>Tentar novamente</Button></div>
            : !receipt ? <p role="status" className="text-sm text-j-gray-600">Carregando comprovante...</p>
                : <>
                    <a href={receipt.url} target="_blank" rel="noopener noreferrer" className="mb-4 inline-block rounded-lg bg-j-gray-100 px-4 py-2 text-sm font-bold text-j-blue-800">Abrir comprovante em outra aba</a>
                    {receipt.type === "application/pdf"
                        ? <object data={receipt.url} type="application/pdf" aria-label={`Comprovante do pagamento ${id}`} className="h-[65vh] w-full"><p>Use o link acima para consultar o PDF.</p></object>
                        // Object URLs autenticadas não são compatíveis com o otimizador do Next Image.
                        // eslint-disable-next-line @next/next/no-img-element
                        : <img src={receipt.url} alt={`Comprovante do pagamento ${id}`} className="mx-auto max-h-[65vh] max-w-full rounded-lg object-contain" />}
                </>}
    </section>;
}
