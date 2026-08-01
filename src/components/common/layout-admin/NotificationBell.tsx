'use client';

import { useEffect, useRef, useState } from "react";
import { BellRing } from "lucide-react";

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

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
                className="flex items-center justify-center cursor-pointer text-j-white transition-colors hover:text-j-yellow-300"
            >
                <BellRing size={20} />
            </button>

            {isOpen && (
                <div
                    role="menu"
                    className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-j-gray-200 bg-j-white p-4 shadow-lg"
                >
                    <p className="text-sm font-bold text-j-gray-600">Notificações</p>
                    {/* TODO: listar notificacoes reais quando existirem */}
                    <p className="mt-2 text-sm text-j-gray-400">Nenhuma notificação por enquanto.</p>
                </div>
            )}
        </div>
    );
}

export default NotificationBell;
