'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Falha ao renderizar a página:', error);
  }, [error]);

  return <main className="flex min-h-[70dvh] flex-col items-center justify-center px-5 py-12 text-center">
    <div className="flex max-w-lg flex-col items-center rounded-3xl border border-j-gray-200 bg-j-white p-7 shadow-lg sm:p-10">
      <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-j-red-500"><AlertTriangle size={28} /></span>
      <h1 className="text-2xl font-black text-j-blue-800 sm:text-3xl">Não foi possível abrir esta página</h1>
      <p className="mt-3 text-sm leading-6 text-j-gray-600">Ocorreu uma falha ao carregar os dados. Tente novamente; se continuar, envie o código abaixo ao suporte.</p>
      {error.digest && <p className="mt-4 rounded-lg bg-j-gray-100 px-3 py-2 font-mono text-xs text-j-gray-600">Código: {error.digest}</p>}
      <button type="button" onClick={reset} className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-j-blue-800 px-6 font-bold text-j-white hover:bg-j-blue-900"><RefreshCw size={17} /> Tentar novamente</button>
    </div>
  </main>;
}
