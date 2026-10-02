"use client";

import type { ReactNode } from "react";
import { ArrowLeft, type LucideIcon } from "lucide-react";
import { twMerge } from "tailwind-merge";

export interface UserWorkspaceOption {
    key: string;
    label: string;
    description: string;
    icon: LucideIcon;
}

interface UserWorkspaceProps {
    title: string;
    description: string;
    options: UserWorkspaceOption[];
    selected: string;
    onSelect: (key: string) => void;
    onBack: () => void;
    disabled?: boolean;
    summary?: ReactNode;
    children: ReactNode;
}

export function UserWorkspace({ title, description, options, selected, onSelect, onBack, disabled, summary, children }: UserWorkspaceProps) {
    const active = options.find((option) => option.key === selected) ?? options[0];

    return (
        <div className="w-full min-w-0 px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
            <button type="button" disabled={disabled} onClick={onBack} className="mb-1 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg pr-3 text-sm font-semibold text-j-blue-800 focus-visible:outline-2 focus-visible:outline-j-blue-800 disabled:opacity-50">
                <ArrowLeft size={18} aria-hidden="true" /> Usuários
            </button>
            <header className="mb-4">
                <h1 className="text-2xl font-extrabold tracking-tight text-j-blue-800">{title}</h1>
                <p className="mt-1 text-sm text-j-gray-500">{description}</p>
            </header>
            <div className="overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white shadow-sm">
                {summary}
                <nav aria-label="Informações do usuário" className="flex gap-1 border-b border-j-gray-200 p-2">
                    {options.map((option) => {
                        const Icon = option.icon;
                        const isActive = selected === option.key;
                        return (
                            <button key={option.key} type="button" disabled={disabled} aria-current={isActive ? "true" : undefined} aria-controls="user-workspace-content" onClick={() => onSelect(option.key)} className={twMerge("relative flex min-h-12 min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-2 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-blue-800 disabled:cursor-default disabled:opacity-50", isActive ? "bg-j-blue-800 text-j-white after:absolute after:bottom-1 after:h-0.5 after:w-5 after:rounded-full after:bg-j-yellow-300" : "text-j-gray-500 hover:bg-j-gray-100 hover:text-j-blue-800")}>
                                <Icon size={16} className="hidden shrink-0 sm:block" aria-hidden="true" />
                                {option.label}
                            </button>
                        );
                    })}
                </nav>
                <section id="user-workspace-content" aria-label={active.label} className="min-w-0">
                    {children}
                </section>
            </div>
        </div>
    );
}
