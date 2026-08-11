'use client';

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { User, Settings, LogOut, LoaderCircle, HelpCircle } from "lucide-react";
import { Avatar } from "@/components/common/avatar";
import logoutAction from "@/actions/auth/logout";
import { TourContext } from "@/components/common/tour/TourContext";
import { useContext } from "react";

interface AvatarMenuProps {
    src: string;
}

export function AvatarMenu({ src }: AvatarMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const tourContext = useContext(TourContext);

    const logoutMutation = useMutation({
        mutationFn: logoutAction,
        onSuccess: () => router.push('/'),
        onError: () => toast.error('Erro ao sair. Tente novamente.'),
    });

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                className="cursor-pointer rounded-full transition-opacity hover:opacity-80"
            >
                <Avatar src={src} />
            </button>

            {isOpen && (
                <div
                    role="menu"
                    className="absolute right-0 top-full mt-2 w-48 flex flex-col gap-1 rounded-lg border border-j-gray-200 bg-j-white p-2 shadow-lg z-50"
                >
                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                            setIsOpen(false);
                            router.push('/profile');
                        }}
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-j-gray-600 transition-colors hover:bg-j-gray-100 cursor-pointer"
                    >
                        <User size={16} />
                        Gerenciar conta
                    </button>

                    {tourContext && (
                        <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                                setIsOpen(false);
                                tourContext.restartTour();
                            }}
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-j-blue-800 hover:bg-j-blue-50 transition-colors cursor-pointer"
                        >
                            <HelpCircle size={16} />
                            Reiniciar tutorial
                        </button>
                    )}

                    {/* TODO: liga pra rota de configuracoes quando ela existir */}
                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-j-gray-600 transition-colors hover:bg-j-gray-100 cursor-pointer"
                    >
                        <Settings size={16} />
                        Configurações
                    </button>

                    <button
                        type="button"
                        role="menuitem"
                        disabled={logoutMutation.isPending}
                        onClick={() => logoutMutation.mutate()}
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold text-j-red-400 transition-colors hover:bg-j-red-100/50 cursor-pointer disabled:opacity-60"
                    >
                        {logoutMutation.isPending ? <LoaderCircle size={16} className="animate-spin" /> : <LogOut size={16} />}
                        Sair
                    </button>
                </div>
            )}
        </div>
    );
}

export default AvatarMenu;
