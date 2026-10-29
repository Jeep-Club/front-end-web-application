'use client';

import { Button } from "@/components/common/button";
import { EditMedicalProfileModal } from "@/components/pages/profile/tabs/medical/EditMedicalProfileModal";
import { IncludeVehicleModal } from "@/components/pages/profile/tabs/vehicles/IncludeVehicleModal";
import { useModal } from "@/providers/ModalProvider";
import { completeFirstAccessOnboardingAction } from "@/server/actions/auth/complete-first-access-onboarding";
import { getMedicalProfileAction } from "@/server/actions/profile/medical-profile";
import { listVehiclesMemberAction } from "@/server/actions/vehicles/list-member";
import { useMutation,useQuery } from "@tanstack/react-query";
import { CarFront,Check,HeartPulse,LoaderCircle,RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function FirstAccessOnboarding() {
    const router = useRouter();
    const { setContent, setOpen } = useModal();

    const vehicles = useQuery({
        queryKey: ["vehicles", "list-member", 0],
        queryFn: () => listVehiclesMemberAction({ page: 0, size: 1 }),
        retry: false,
    });
    const medical = useQuery({
        queryKey: ["medical-profile", "me"],
        queryFn: getMedicalProfileAction,
        retry: false,
    });

    const hasVehicle = (vehicles.data?.content.length ?? 0) > 0;
    const hasMedical = Boolean(medical.data);
    const isLoading = vehicles.isLoading || medical.isLoading;
    const hasError = vehicles.isError || medical.isError;

    const openVehicleForm = () => {
        setContent(<IncludeVehicleModal />);
        setOpen();
    };
    const openMedicalForm = () => {
        setContent(<EditMedicalProfileModal medicalProfile={medical.data ?? null} />);
        setOpen();
    };

    const completion = useMutation({
        mutationFn: completeFirstAccessOnboardingAction,
        onSuccess: () => {
            toast.success("Cadastro inicial concluído. Bem-vindo ao sistema!");
            router.refresh();
        },
    });
    const isCompleting = completion.isPending;
    const finish = () => completion.mutate();

    return (
        <main className="flex min-h-dvh items-center justify-center bg-j-gray-100 p-4">
            <section className="w-full max-w-2xl rounded-2xl border border-j-gray-200 bg-j-white p-5 shadow-lg sm:p-8">
                <p className="text-sm font-bold uppercase tracking-wide text-j-yellow-600">Cadastro inicial</p>
                <h1 className="mt-2 text-2xl font-extrabold text-j-blue-800">Vamos preparar sua conta</h1>
                <p className="mt-2 text-sm leading-6 text-j-gray-600">Para acessar o sistema, conclua estas duas etapas. Seus dados ficam vinculados ao seu cadastro.</p>

                {hasError ? (
                    <div className="mt-6 rounded-xl border border-j-red-100 bg-j-red-50 p-4">
                        <p className="text-sm text-j-red-700">Não foi possível verificar seu cadastro. Tente carregar novamente.</p>
                        <Button type="button" onClick={() => { void vehicles.refetch(); void medical.refetch(); }} className="mt-3 gap-2"><RefreshCw size={16} /> Tentar novamente</Button>
                    </div>
                ) : isLoading ? (
                    <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-j-gray-500"><LoaderCircle size={20} className="animate-spin" /> Verificando seu cadastro...</div>
                ) : (
                    <div className="mt-6 grid gap-3">
                        <OnboardingStep done={hasVehicle} title="Cadastrar seu veículo" description="Inclua pelo menos um veículo no seu perfil." icon={<CarFront size={22} />} onClick={openVehicleForm} />
                        <OnboardingStep done={hasMedical} title="Preencher dados de saúde" description="Informe seu perfil médico e contato de emergência." icon={<HeartPulse size={22} />} onClick={openMedicalForm} />
                    </div>
                )}

                <Button type="button" onClick={finish} disabled={isLoading || hasError || !hasVehicle || !hasMedical || isCompleting} className="mt-6 min-h-12 w-full gap-2">
                    {isCompleting ? <><LoaderCircle size={18} className="animate-spin" /> Finalizando...</> : "Concluir e acessar o sistema"}
                </Button>
                <p className="mt-3 text-center text-xs text-j-gray-500">As duas etapas são obrigatórias para liberar o acesso.</p>
            </section>
        </main>
    );
}

function OnboardingStep({ done, title, description, icon, onClick }: { done: boolean; title: string; description: string; icon: React.ReactNode; onClick: () => void }) {
    return (
        <div className="flex flex-col gap-3 rounded-xl border border-j-gray-200 p-4 sm:flex-row sm:items-center">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-j-blue-50 text-j-blue-800">{icon}</span>
            <div className="min-w-0 flex-1">
                <p className="font-bold text-j-blue-800">{title}</p>
                <p className="mt-1 text-sm text-j-gray-500">{description}</p>
            </div>
            {done ? (
                <span className="inline-flex items-center gap-1 self-start rounded-full bg-j-green-100 px-3 py-1 text-sm font-bold text-j-green-700 sm:self-auto"><Check size={16} /> Concluído</span>
            ) : (
                <Button type="button" onClick={onClick} className="min-h-10 shrink-0 px-4">Preencher</Button>
            )}
        </div>
    );
}
