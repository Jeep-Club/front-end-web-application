import Link from "next/link";

export function FinancialSectionNav({ label, active, links }: {
    label: string;
    active?: string;
    links: { key: string; label: string; href: string }[];
}) {
    if (!links.length) return null;

    return (
        <nav aria-label={label} className="flex w-full gap-1 rounded-xl border border-input-border bg-j-white p-1">
            {links.map((link) => (
                <Link
                    key={link.key}
                    href={link.href}
                    scroll={false}
                    aria-current={active === link.key ? "page" : undefined}
                    className={`flex min-h-11 min-w-0 flex-1 items-center justify-center rounded-lg px-1 py-2 text-center text-xs font-bold transition-colors [overflow-wrap:anywhere] motion-reduce:transition-none sm:px-3 sm:text-sm ${active === link.key ? "bg-j-blue-800 text-j-yellow-300" : "text-primary hover:bg-background-secondary"}`}
                >
                    {link.label}
                </Link>
            ))}
        </nav>
    );
}
