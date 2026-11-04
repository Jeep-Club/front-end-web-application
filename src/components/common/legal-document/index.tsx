import type { ReactNode } from "react";

export interface LegalSection {
    id: string;
    title: string;
    content: ReactNode;
}

export default function LegalDocument({ title, introduction, sections }: {
    title: string;
    introduction: string;
    sections: LegalSection[];
}) {
    return (
        <>
            <header className="border-b border-j-gray-200 pb-8">
                <p className="text-xs font-bold uppercase tracking-widest text-j-blue-700">Jeep Clube Tamoios · Transparência</p>
                <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-j-blue-800 sm:text-4xl">{title}</h1>
                <p className="mt-4 text-sm text-j-gray-500">Versão 1.0 · Atualizado em <time dateTime="2026-10-28">28 de outubro de 2026</time></p>
                <p className="mt-5 leading-7 text-j-gray-600">{introduction}</p>
            </header>
            <div className="mt-8 grid items-start gap-10 lg:grid-cols-[230px_minmax(0,1fr)]">
                <nav aria-label={`Sumário: ${title}`} className="rounded-2xl bg-j-gray-100 p-5 lg:sticky lg:top-6">
                    <h2 className="text-sm font-bold text-j-blue-800">Nesta página</h2>
                    <ol className="mt-4 space-y-3 text-sm text-j-gray-600">
                        {sections.map(({ id, title }, index) => (
                            <li key={id}><a href={`#${id}`} className="rounded-sm underline-offset-4 hover:text-j-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-j-blue-700">{index + 1}. {title}</a></li>
                        ))}
                    </ol>
                </nav>
                <article className="min-w-0 space-y-9 text-sm leading-7 text-j-gray-600 sm:text-base">
                    {sections.map(({ id, title, content }, index) => (
                        <section id={id} key={id} className="scroll-mt-6 space-y-3 [&_a]:break-words [&_a]:font-medium [&_a]:text-j-blue-700 [&_a]:underline [&_a]:underline-offset-4 [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
                            <h2 className="text-xl font-bold leading-snug text-j-blue-800">{index + 1}. {title}</h2>
                            {content}
                        </section>
                    ))}
                </article>
            </div>
        </>
    );
}
