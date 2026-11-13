import Link from "next/link";
import { twMerge } from "tailwind-merge";

export const legalLinks = [
    { href: "/politica-de-privacidade", label: "Política de Privacidade" },
    { href: "/termos-de-uso", label: "Termos de Uso" },
    { href: "/contato", label: "Contato" },
    { href: "/equipe", label: "Equipe técnica" },
] as const;

export default function LegalLinks({ className }: { className?: string }) {
    return (
        <nav aria-label="Informações legais, contato e equipe" className={twMerge("flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs", className)}>
            {legalLinks.map(({ href, label }) => (
                <Link key={href} href={href} className="legal-link rounded-sm underline-offset-4 transition-colors duration-200 ease-out hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-j-yellow-300 motion-reduce:transition-none">
                    {label}
                </Link>
            ))}
        </nav>
    );
}
