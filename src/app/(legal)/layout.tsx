import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SiteFooter from "@/components/common/site-footer";
import styles from "./legal.module.css";

// Mantém os contatos públicos atualizados a partir da configuração do servidor.
export const dynamic = "force-dynamic";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={`${styles.layout} flex min-h-dvh flex-col bg-j-white`}>
            <a href="#conteudo-legal" className="sr-only focus:not-sr-only focus:bg-j-yellow-300 focus:p-4 focus:text-j-blue-800">Ir para o conteúdo</a>
            <header className="bg-j-blue-800 px-5 py-5 text-j-white sm:px-8 print:hidden">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
                    <Link href="/" className="font-extrabold tracking-tight focus-visible:outline-2 focus-visible:outline-j-yellow-300">Jeep Clube <span className="text-j-yellow-300">Tamoios</span></Link>
          <Link
            href="/"
            className="group inline-flex min-h-11 items-center gap-3 rounded-full border border-yellow-300/50 bg-yellow-400 py-2.5 pl-3 pr-5 text-sm font-semibold text-j-blue-950 shadow-lg shadow-black/15 transition-colors hover:bg-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-300 motion-safe:transition-all motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-xl motion-safe:active:translate-y-0"
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-j-blue-950/10" aria-hidden="true">
              <ArrowLeft size={16} className="motion-safe:transition-transform motion-safe:group-hover:-translate-x-0.5" />
            </span>
            Voltar ao início
          </Link>
                </div>
            </header>
            <main id="conteudo-legal" className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-14">{children}</main>
            <SiteFooter />
        </div>
    );
}
