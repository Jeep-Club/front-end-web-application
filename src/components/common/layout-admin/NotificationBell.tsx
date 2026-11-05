"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BellRing } from "lucide-react";

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        function handlePointerDown(event: PointerEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsOpen(false);
                triggerRef.current?.focus();
            }
        }

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    return (
        <div ref={containerRef} className="relative hidden md:block">
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label="Notificações"
                aria-expanded={isOpen}
                aria-controls="notifications-popover"
                title="Notificações"
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md p-2 text-j-white transition-colors hover:bg-j-blue-700 hover:text-j-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-yellow-300"
            >
                <BellRing size={20} aria-hidden="true" />
            </button>

            <section
                id="notifications-popover"
                aria-labelledby="notifications-popover-title"
                hidden={!isOpen}
                className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-j-gray-200 bg-j-white p-4 shadow-lg"
            >
                <h2 id="notifications-popover-title" className="text-sm font-bold text-j-gray-700">
                    Notificações
                </h2>
                <p className="mt-2 text-sm text-j-gray-500">Nenhuma notificação por enquanto.</p>
                <div className="mt-3 flex justify-end border-t border-j-gray-200 pt-2">
                    <Link
                        href="/notificacoes"
                        onClick={() => setIsOpen(false)}
                        className="cursor-pointer rounded-sm text-sm font-bold text-j-blue-800 hover:text-j-blue-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-blue-800"
                    >
                        Ver todos
                    </Link>
                </div>
            </section>
        </div>
    );
}

export default NotificationBell;
