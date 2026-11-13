import Link from "next/link";
import { ArrowRight, Star, type LucideIcon } from "lucide-react";
import { useAdminFavorites, useAdminUserId } from "@/hooks/useAdminFavorites";

interface AdminModuleCardProps {
    id?: string;
    favoriteButtonId?: string;
    actionId?: string;
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
    moduleKey: string;
}

export default function AdminModuleCard({
    id,
    favoriteButtonId,
    actionId,
    title,
    description,
    href,
    icon: Icon,
    moduleKey,
}: AdminModuleCardProps) {
    const userId = useAdminUserId();
    const { favorites, toggleFavorite } = useAdminFavorites(userId);
    const isFavorite = favorites.includes(moduleKey);
    return (
        <article
            id={id}
            className="
                group flex min-h-[330px] flex-col
                rounded-xl border border-j-gray-300
                bg-j-white p-5 shadow-sm
                transition-[background-color,border-color,box-shadow,transform,translate,scale] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
                hover:-translate-y-1 hover:scale-[1.015]
                hover:border-j-yellow-300
                hover:shadow-lg
                motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100
            "
        >
            <div className="relative">
                <button
                    id={favoriteButtonId}
                    type="button"
                    onClick={() => toggleFavorite(moduleKey)}
                    aria-label={
                        isFavorite
                            ? `Remover ${title} dos favoritos`
                            : `Adicionar ${title} aos favoritos`
                    }
                    aria-pressed={isFavorite}
                    title={
                        isFavorite
                            ? "Remover dos favoritos"
                            : "Adicionar aos favoritos"
                    }
                    className="absolute right-2 top-2 z-10 cursor-pointer rounded-full p-2 text-j-blue-800 transition-[background-color,transform] duration-200 ease-out hover:scale-110 hover:bg-j-yellow-300/30 active:scale-95 motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
                >
                    <Star
                        size={21}
                        className={
                            isFavorite
                                ? "fill-j-yellow-300 text-j-blue-800"
                                : "text-j-gray-500"
                        }
                    />
                </button>
                <div
                    className="
                        flex h-28 items-center justify-center
                        rounded-xl border border-j-yellow-300/50
                        bg-j-yellow-100/20
                        transition-[background-color,border-color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
                        group-hover:border-j-yellow-300/80 group-hover:bg-j-yellow-100/40
                    "
                >
                    <Icon
                        size={48}
                        strokeWidth={1.8}
                        className="
                            text-j-blue-800
                            transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
                            group-hover:scale-110
                            motion-reduce:transition-none motion-reduce:group-hover:scale-100
                        "
                    />
                </div>
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
                    id={actionId}
                    href={href}
                    onClick={() => {
                        if (typeof window !== "undefined") {
                            window.dispatchEvent(new CustomEvent('tour:destroy-and-diverge'));
                        }
                    }}
                    className="
                        group/link mt-auto flex w-full items-center
                        justify-center gap-2 rounded-lg
                        bg-j-yellow-300 px-4 py-3
                        text-sm font-black uppercase
                        tracking-wide text-j-blue-800
                        transition-[background-color,box-shadow,transform,translate,scale] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
                        hover:-translate-y-0.5 hover:bg-j-yellow-200 hover:shadow-md
                        active:translate-y-0 active:scale-[0.98]
                        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-yellow-300
                        motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100
                    "
                >
                    Gerenciar

                    <ArrowRight
                        size={17}
                        strokeWidth={3}
                        className="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/link:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover/link:translate-x-0"
                    />
                </Link>
            </div>
        </article>
    );
}
