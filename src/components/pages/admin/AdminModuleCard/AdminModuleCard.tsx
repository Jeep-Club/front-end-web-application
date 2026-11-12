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
                transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-200
                hover:-translate-y-1
                hover:border-j-yellow-300
                hover:shadow-md
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
                    className="absolute right-2 top-2 z-10 cursor-pointer rounded-full p-2 text-j-blue-800 transition-colors hover:bg-j-yellow-300/30"
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
                        mt-auto flex w-full items-center
                        justify-center gap-2 rounded-lg
                        bg-j-yellow-300 px-4 py-3
                        text-sm font-black uppercase
                        tracking-wide text-j-blue-800
                        transition-[background-color,border-color,color,box-shadow,opacity,transform]
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
