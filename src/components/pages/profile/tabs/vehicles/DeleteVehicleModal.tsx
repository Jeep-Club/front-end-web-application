'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AlertTriangle, X, Trash2, LoaderCircle } from "lucide-react";
import { Button, ButtonIcon } from "@/components/common/button";
import { useModal } from "@/providers/ModalProvider";
import { deleteVehicleMemberAction } from "@/actions/vehicles/delete-member";

interface DeleteVehicleModalProps {
    vehicleId: number;
    vehicleLabel: string;
}

export function DeleteVehicleModal({ vehicleId, vehicleLabel }: DeleteVehicleModalProps) {
    const { setClose } = useModal();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: () => deleteVehicleMemberAction(vehicleId),
        onSuccess: () => {
            toast.success("Veículo excluído com sucesso!");
            queryClient.invalidateQueries({ queryKey: ["vehicles", "list-member"] });
            setClose();
        },
        onError: (error) => toast.error(error.message || "Erro ao excluir veículo."),
    });

    return (
        <div
            className={`
                relative w-full max-w-110
                flex flex-col gap-6
                p-6 md:p-8
                bg-j-blue-800 rounded-2xl
                shadow-[-1px_16px_23px_1px_rgba(0,0,0,0.35)]
                text-j-white
            `}
        >
            <ButtonIcon
                onClick={setClose}
                disabled={mutation.isPending}
                className="absolute top-4 right-4 text-j-transparent-white hover:text-j-yellow-300"
            >
                <X size={22} />
            </ButtonIcon>

            <div className="flex flex-col items-center gap-3 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                    <AlertTriangle size={28} />
                </span>
                <h2 className="text-xl md:text-2xl font-extrabold text-j-white">Excluir veículo?</h2>
                <p className="text-sm text-j-transparent-white">
                    Tem certeza que deseja excluir <span className="font-bold text-j-white">{vehicleLabel}</span>?
                    Essa ação não pode ser desfeita.
                </p>
            </div>

            <div className="flex gap-3">
                <Button
                    type="button"
                    onClick={setClose}
                    disabled={mutation.isPending}
                    className="flex-1 bg-transparent border-2 border-j-transparent-white text-j-white hover:bg-j-transparent-white/10 hover:text-j-white"
                >
                    Cancelar
                </Button>
                <Button
                    type="button"
                    onClick={() => mutation.mutate()}
                    disabled={mutation.isPending}
                    className="flex-1 bg-red-500 text-white hover:bg-red-600 hover:text-white"
                >
                    {mutation.isPending ? (
                        <>Excluindo<LoaderCircle size={15} strokeWidth={3} className="animate-spin" /></>
                    ) : (
                        <>Excluir<Trash2 size={15} strokeWidth={3} /></>
                    )}
                </Button>
            </div>
        </div>
    );
}

export default DeleteVehicleModal;
