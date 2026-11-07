import Link from "next/link";
import { ArrowRight, House, MapPinOff } from "lucide-react";
import RouteFeedback from "@/components/common/route-feedback/RouteFeedback";

export default function NotFound() {
  return (
    <RouteFeedback
      icon={MapPinOff}
      statusLabel="Página não encontrada"
      marker="404"
      title="Parece que saímos da trilha."
      description="Não encontramos a página que você procura. O endereço pode estar incorreto ou a página pode ter mudado de lugar."
      illustrationCaption="Fora da rota. Dentro da aventura."
      actions={
        <>
          <Link prefetch={false} href="/" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-j-yellow-300 px-6 py-3 text-sm font-bold text-j-blue-950 transition-colors hover:bg-j-yellow-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-j-yellow-300 sm:w-auto">
            <House size={18} aria-hidden="true" /> Voltar para o início
          </Link>
          <Link prefetch={false} href="/login" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white/50 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-j-yellow-300 sm:w-auto">
            Área do sócio <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </>
      }
    >
      <p>Confira o endereço digitado ou escolha um dos caminhos acima.</p>
    </RouteFeedback>
  );
}
