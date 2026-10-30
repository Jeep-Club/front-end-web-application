import Link from "next/link";
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
                    <Link href="/" className="text-sm underline-offset-4 hover:underline">Voltar ao início</Link>
                </div>
            </header>
            <main id="conteudo-legal" className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-14">{children}</main>
            <SiteFooter />
        </div>
    );
}
