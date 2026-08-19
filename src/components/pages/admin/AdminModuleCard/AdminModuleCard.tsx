import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

interface AdminModuleCardProps {
    id?: string;
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
}

export default function AdminModuleCard({
    id,
    title,
    description,
    href,
    icon: Icon,
}: AdminModuleCardProps) {
    return (
        <article
            id={id}
            className="
                group flex min-h-[330px] flex-col
                rounded-xl border border-j-gray-300
                bg-j-white p-5 shadow-sm
                transition-all duration-200
                hover:-translate-y-1
                hover:border-j-yellow-300
                hover:shadow-md
            "
        >
            <div
                className="
                    flex h-28 items-center justify-center
                    rounded-xl border border-j-yellow-300/50
                    bg-j-yellow-100/20
                "
            >
                <Icon
                    size={48}
                    strokeWidth={1.8}
                    className="
                        text-j-blue-800
                        transition-transform duration-200
                        group-hover:scale-110
                    "
                />
            </div>

            <div className="flex flex-1 flex-col pt-6">
                <h2 className="text-xl font-bold text-j-blue-800">
                    {title}
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-j-gray-600">
                    {description}
                </p>

                <div className="my-5 h-px bg-j-gray-200" />

                <Link
                    href={href}
                    onClick={() => {
                        if (typeof window !== "undefined") {
                            sessionStorage.setItem('force_branch_tour', 'true');
                            window.dispatchEvent(new CustomEvent('tour:destroy-and-diverge'));
                        }
                    }}
                    className="
                        mt-auto flex w-full items-center
                        justify-center gap-2 rounded-lg
                        bg-j-yellow-300 px-4 py-3
                        text-sm font-black uppercase
                        tracking-wide text-j-blue-800
                        transition-all
                        hover:bg-j-yellow-200
                        active:scale-[0.98]
                    "
                >
                    Gerenciar

                    <ArrowRight
                        size={17}
                        strokeWidth={3}
                    />
                </Link>
            </div>
        </article>
    );
}