"use client";

import { Button } from "@/components/common/button";
import { EditPersonalDataModal } from "@/components/pages/profile/tabs/personal/EditPersonalDataModal";
import { IncludeVehicleModal } from "@/components/pages/profile/tabs/vehicles/IncludeVehicleModal";
import { CreateDependentModal } from "@/components/pages/profile/tabs/dependents/CreateDependentModal";
import { IncludeToolModal } from "@/components/pages/profile/tabs/tools/IncludeToolModal";
import { EditMedicalProfileModal } from "@/components/pages/profile/tabs/medical/EditMedicalProfileModal";
import { useModal } from "@/providers/ModalProvider";
import { completeFirstAccessOnboardingAction } from "@/server/actions/auth/complete-first-access-onboarding";
import { listDependentsAction } from "@/server/actions/dependents";
import { getMedicalProfileAction } from "@/server/actions/profile/medical-profile";
import { getUserProfileAction } from "@/server/actions/profile/get";
import { listToolsAction } from "@/server/actions/tools/list";
import { listVehiclesMemberAction } from "@/server/actions/vehicles/list-member";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CarFront, Check, Camera, HeartPulse, LoaderCircle, RefreshCw, Users, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function FirstAccessOnboarding() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { setContent, setOpen } = useModal();

    const profile = useQuery({
        queryKey: ["profile", "me"],
        queryFn: getUserProfileAction,
        retry: false,
    });
    const medical = useQuery({
        queryKey: ["medical-profile", "me"],
        queryFn: getMedicalProfileAction,
        retry: false,
    });
    const vehicles = useQuery({
        queryKey: ["vehicles", "list-member", 0, 1],
        queryFn: () => listVehiclesMemberAction({ page: 0, size: 1 }),
        retry: false,
    });
    const dependents = useQuery({
        queryKey: ["dependents"],
        queryFn: listDependentsAction,
        retry: false,
    });
    const tools = useQuery({
        queryKey: ["tools", "list", 0, 1],
        queryFn: () => listToolsAction({ page: 0, size: 1 }),
        retry: false,
    });

    const hasPhoto = Boolean(profile.data?.profilePhotoUrl);
    const hasMedical = Boolean(medical.data);
    const vehicleCount = vehicles.data?.totalElements ?? 0;
    const dependentCount = dependents.data?.length ?? 0;
    const toolCount = tools.data?.totalElements ?? 0;
    const requiredLoading = profile.isLoading || medical.isLoading;
    const requiredError = profile.isError || medical.isError;
    const requiredComplete = hasPhoto && hasMedical;
    const optionalComplete = vehicleCount > 0 && dependentCount > 0 && toolCount > 0;

    const openPhotoForm = () => {
        if (!profile.data) return;
        setContent(<EditPersonalDataModal
            personalData={profile.data}
            onSave={(updatedProfile) => {
                queryClient.setQueryData(["profile", "me"], updatedProfile);
                void queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
            }}
        />);
        setOpen();
    };
    const openMedicalForm = () => {
        setContent(<EditMedicalProfileModal medicalProfile={medical.data ?? null} />);
        setOpen();
    };
    const openVehicleForm = () => {
        setContent(<IncludeVehicleModal />);
        setOpen();
    };
    const openDependentForm = () => {
        setContent(<CreateDependentModal />);
        setOpen();
    };
    const openToolForm = () => {
        setContent(<IncludeToolModal />);
        setOpen();
    };

    const completion = useMutation({
        mutationFn: completeFirstAccessOnboardingAction,
        onSuccess: () => {
            toast.success("Cadastro inicial concluído. Bem-vindo ao sistema!");
            router.refresh();
        },
    });
    const finish = () => completion.mutate();

    return (
        <main className="flex min-h-dvh items-center justify-center bg-j-gray-100 p-4">
            <section className="my-6 w-full max-w-3xl rounded-2xl border border-j-gray-200 bg-j-white p-5 shadow-lg sm:p-8">
                <p className="text-sm font-bold uppercase tracking-wide text-j-yellow-600">Cadastro inicial</p>
                <h1 className="mt-2 text-2xl font-extrabold text-j-blue-800">Vamos preparar sua conta</h1>
                <p className="mt-2 text-sm leading-6 text-j-gray-600">Adicione uma foto de perfil e preencha seus dados médicos para liberar o acesso. Veículos, dependentes e ferramentas são opcionais e podem ser cadastrados agora ou depois.</p>

                {requiredError ? (
                    <div className="mt-6 rounded-xl border border-j-red-100 bg-j-red-50 p-4">
                        <p className="text-sm text-j-red-700">Não foi possível verificar os dados obrigatórios do cadastro. Tente carregar novamente.</p>
                        <Button type="button" onClick={() => { void profile.refetch(); void medical.refetch(); }} className="mt-3 gap-2"><RefreshCw size={16} /> Tentar novamente</Button>
                    </div>
                ) : requiredLoading ? (
                    <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-j-gray-500"><LoaderCircle size={20} className="animate-spin" /> Verificando seu cadastro...</div>
                ) : (
                    <div className="mt-6 flex flex-col gap-5">
                        <section className="flex flex-col gap-3" aria-labelledby="required-onboarding-title">
                            <div>
                                <h2 id="required-onboarding-title" className="text-sm font-extrabold uppercase tracking-wide text-j-blue-800">Obrigatório</h2>
                                <p className="mt-1 text-xs text-j-gray-500">Esses dados são necessários para concluir o primeiro acesso.</p>
                            </div>
                            <OnboardingStep done={hasPhoto} title="Adicionar foto de perfil" description="Escolha uma foto para identificar sua conta." icon={<Camera size={22} />} actionLabel={hasPhoto ? "Alterar foto" : "Adicionar foto"} onClick={openPhotoForm} />
                            <OnboardingStep done={hasMedical} title="Preencher dados médicos" description="Informe seu perfil médico e contato de emergência." icon={<HeartPulse size={22} />} actionLabel={hasMedical ? "Editar dados" : "Preencher"} onClick={openMedicalForm} />
                        </section>

                        <section className="flex flex-col gap-3" aria-labelledby="optional-onboarding-title">
                            <div>
                                <h2 id="optional-onboarding-title" className="text-sm font-extrabold uppercase tracking-wide text-j-blue-800">Opcionais</h2>
                                <p className="mt-1 text-xs text-j-gray-500">Você pode pular estes cadastros e incluí-los depois no seu perfil.</p>
                            </div>
                            <OnboardingStep optional count={vehicleCount} countLabel={vehicleCount === 1 ? "veículo" : "veículos"} title="Cadastrar veículos" description="Inclua os veículos que você usa nas atividades do clube." icon={<CarFront size={22} />} actionLabel={vehicleCount ? "Adicionar outro" : "Adicionar"} onClick={openVehicleForm} />
                            <OnboardingStep optional count={dependentCount} countLabel={dependentCount === 1 ? "dependente" : "dependentes"} title="Cadastrar dependentes" description="Adicione familiares ou convidados vinculados à sua conta." icon={<Users size={22} />} actionLabel={dependentCount ? "Adicionar outro" : "Adicionar"} onClick={openDependentForm} />
                            <OnboardingStep optional count={toolCount} countLabel={toolCount === 1 ? "ferramenta" : "ferramentas"} title="Cadastrar ferramentas" description="Registre as ferramentas que você disponibiliza para o clube." icon={<Wrench size={22} />} actionLabel={toolCount ? "Adicionar outra" : "Adicionar"} onClick={openToolForm} />
                        </section>

                        <div>
                            <Button type="button" onClick={finish} isLoading={completion.isPending} disabled={!requiredComplete} className="min-h-12 w-full gap-2">
                                {completion.isPending ? <><LoaderCircle size={18} className="animate-spin" /> Finalizando...</> : optionalComplete ? "Concluir e acessar o sistema" : "Pular itens opcionais e acessar o sistema"}
                            </Button>
                            {!requiredComplete && <p className="mt-3 text-center text-xs text-j-gray-500">Conclua os dois itens obrigatórios para liberar o acesso.</p>}
                            {completion.isError && <p role="alert" className="mt-3 text-center text-sm text-j-red-600">{completion.error.message}</p>}
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}

function OnboardingStep({
    done,
    optional = false,
    count,
    countLabel,
    title,
    description,
    icon,
    actionLabel,
    onClick,
}: {
    done?: boolean;
    optional?: boolean;
    count?: number;
    countLabel?: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    actionLabel: string;
    onClick: () => void;
}) {
    return (
        <div className="flex flex-col gap-3 rounded-xl border border-j-gray-200 p-4 sm:flex-row sm:items-center">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-j-blue-50 text-j-blue-800">{icon}</span>
            <div className="min-w-0 flex-1">
                <p className="font-bold text-j-blue-800">{title}</p>
                <p className="mt-1 text-sm text-j-gray-500">{description}</p>
            </div>
            <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                {optional ? (
                    count ? <span className="text-xs font-semibold text-j-gray-500">{count} {countLabel}</span> : <span className="rounded-full bg-j-gray-100 px-2.5 py-1 text-xs font-bold text-j-gray-500">Opcional</span>
                ) : done ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-j-green-100 px-3 py-1 text-sm font-bold text-j-green-700"><Check size={16} /> Concluído</span>
                ) : null}
                <Button type="button" onClick={onClick} className="min-h-10 shrink-0 px-4">{actionLabel}</Button>
            </div>
        </div>
    );
}
