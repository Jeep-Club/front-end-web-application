'use client';

import { Users, Plus } from "lucide-react";
import { Button } from "@/components/common/button";
import { useModal } from "@/providers/ModalProvider";
import { IncludeDependentModal } from "./IncludeDependentModal";

export function DependentsTabContent() {
    const { setContent, setOpen } = useModal();

    const handleOpenInclude = () => {
        setContent(<IncludeDependentModal />);
        setOpen();
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-j-gray-700">Meus dependentes</h3>
                <Button onClick={handleOpenInclude}>
                    <Plus size={16} />
                    <span className="hidden sm:inline">Incluir Dependente</span>
                    <span className="sm:hidden">Incluir</span>
                </Button>
            </div>

            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-j-gray-200 py-10 text-center">
                <Users size={28} className="text-j-gray-300" />
                <p className="text-sm text-j-gray-400">
                    A listagem dos seus dependentes cadastrados vai aparecer aqui em breve.
                </p>
            </div>
        </div>
    );
}

export default DependentsTabContent;
