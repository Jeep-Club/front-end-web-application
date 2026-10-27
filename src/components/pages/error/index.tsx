"use client";

import { useEffect } from "react";
import Link from "next/link";
import { House, RefreshCw, TriangleAlert } from "lucide-react";
import RouteFeedback from "@/components/common/route-feedback/RouteFeedback";

export type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Falha ao renderizar a página:", error);
  }, [error]);

  return (
    <RouteFeedback
      icon={TriangleAlert}
      statusLabel="Falha ao carregar a página"
      marker="Ops!"
      title="Um imprevisto no caminho."
      description="Não foi possível carregar esta página. Tente novamente para retomar o caminho ou volte para o início."
      illustrationCaption="Até as melhores trilhas têm imprevistos."
      actions={
        <>
          <button type="button" onClick={reset} className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-j-yellow-300 px-6 py-3 text-sm font-bold text-j-blue-950 transition-colors hover:bg-j-yellow-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-j-yellow-300 sm:w-auto">
            <RefreshCw size={18} aria-hidden="true" /> Tentar novamente
          </button>
          <Link prefetch={false} href="/" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white/50 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-j-yellow-300 sm:w-auto">
            <House size={18} aria-hidden="true" /> Voltar para o início
          </Link>
        </>
      }
    >
      <p>Se o problema continuar, tente novamente em alguns instantes.</p>
      {error.digest && (
        <p className="mt-2">
          Informe este código ao suporte:
          <code className="mt-1 block break-all rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-white/80">{error.digest}</code>
        </p>
      )}
    </RouteFeedback>
  );
}
