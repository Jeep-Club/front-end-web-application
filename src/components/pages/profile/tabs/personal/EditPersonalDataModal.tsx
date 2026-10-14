"use client";

import { useState } from "react";

import {
    CalendarDays,
    Camera,
    Save,
    ShieldCheck,
    UserRound,
    UserRoundPen,
    X,
} from "lucide-react";
import toast from "react-hot-toast";
import { updatePersonalDataAction } from "@/actions/profile/update-personal-data";
import { uploadImageAction } from "@/actions/media/upload-image";
import { updateProfilePhotoAction } from "@/actions/profile/update-photo";
import { getUserProfileAction } from "@/actions/profile/get";

import {
    Button,
    ButtonIcon,
} from "@/components/common/button";
import { ReadOnlyField } from "@/components/common/ReadOnlyField";
import { Form } from "@/components/common/form";
import { InputFile } from "@/components/common/input/file";
import { InputRegister } from "@/components/common/input/input-register";
import { useModal } from "@/providers/ModalProvider";
import {
    editPersonalDataFormSchema,
    type EditPersonalDataFormData,
} from "@/schemas/profile/edit-personal-data";

interface EditPersonalDataModalProps {
    personalData: GetUserProfileResponse;
    onSave: (
        personalData: GetUserProfileResponse,
    ) => void;
}

const statusLabels: Record<
    GetUserProfileResponse["status"],
    string
> = {
    ACTIVE: "Ativo",
    DISABLED: "Desativado",
    LOCKED: "Bloqueado",
    CHANGE_PASSWORD_REQUIRED:
        "Alteração de senha obrigatória",
    PENDING_FIRST_ACCESS:
        "Primeiro acesso pendente",
};

function formatCpf(value: string) {
    const digits =
        value.replace(/\D/g, "");

    if (digits.length !== 11) {
        return value;
    }

    return digits.replace(
        /(\d{3})(\d{3})(\d{3})(\d{2})/,
        "$1.$2.$3-$4",
    );
}

export function EditPersonalDataModal({
    personalData,
    onSave,
}: EditPersonalDataModalProps) {
    const { setClose } = useModal();
    const [isSaving, setIsSaving] = useState(false);

    const handleRemovePhoto = async () => {
        setIsSaving(true);
        try {
            await updateProfilePhotoAction(null);
            onSave(await getUserProfileAction());
            toast.success("Foto de perfil removida.");
            setClose();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Não foi possível remover a foto.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSubmit = async (
        data: EditPersonalDataFormData,
    ) => {
        try {
            const selectedPhoto =
                data.profilePhoto?.[0];

            if (selectedPhoto && selectedPhoto.size > 5 * 1024 * 1024) {
                toast.error("A foto excede o limite de 5 MiB. Escolha uma imagem menor e tente novamente.");
                return;
            }

            if (selectedPhoto && !["image/jpeg", "image/png", "image/webp"].includes(selectedPhoto.type)) {
                toast.error("Formato não aceito. Envie uma foto JPEG, PNG ou WebP.");
                return;
            }

            setIsSaving(true);
            await updatePersonalDataAction({
                name: data.name.trim(),
                birthDate: data.birthDate || null,
                email: data.email.trim(),
                rg: data.rg.trim() || null,
                phoneNumber: data.phoneNumber.replace(/\D/g, "") || null,
            });

            if (selectedPhoto) {
                const uploadForm = new FormData();
                uploadForm.set("file", selectedPhoto);
                const storageKey = await uploadImageAction(uploadForm);
                await updateProfilePhotoAction(storageKey);
            }

            const savedPersonalData = await getUserProfileAction();
            onSave(savedPersonalData);

            toast.success(
                "Dados atualizados com sucesso!",
            );

            setClose();
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Erro ao atualizar os dados";

            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="relative flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-y-auto overflow-x-hidden rounded-3xl bg-j-white shadow-2xl">
            <ButtonIcon
                type="button"
                onClick={setClose}
                disabled={isSaving}
                title="Fechar"
                className="absolute right-4 top-4 z-10 rounded-full bg-j-gray-100 p-2 text-j-gray-600 hover:bg-j-gray-200 hover:text-j-blue-800 md:right-6 md:top-6"
            >
                <X size={22} />
            </ButtonIcon>

            <header className="border-b border-j-gray-200 px-5 pb-5 pr-16 pt-6 md:px-8 md:pb-6 md:pr-20 md:pt-8">
                <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-j-yellow-300 text-j-blue-800 shadow-sm">
                        <UserRoundPen
                            size={20}
                        />
                    </span>

                    <div>
                        <h2 className="text-xl font-extrabold text-j-blue-800 md:text-2xl">
                            Editar dados pessoais
                        </h2>

                        <p className="mt-1 max-w-lg text-xs leading-relaxed text-j-gray-500 md:text-sm">
                            Atualize suas informações e
                            sua foto de perfil.
                        </p>
                    </div>
                </div>
            </header>

            <div className="mx-5 mt-5 grid gap-3 rounded-2xl border border-j-gray-200 bg-j-gray-100 p-4 sm:grid-cols-2 md:mx-8 md:mt-6">
                <ReadOnlyField
                    label="CPF"
                    value={formatCpf(
                        personalData.cpf,
                    )}
                    icon={ShieldCheck}
                    variant="summary"
                />

                <ReadOnlyField
                    label="Status"
                    value={
                        statusLabels[
                            personalData.status
                        ]
                    }
                    icon={ShieldCheck}
                    variant="summary"
                />

                
            </div>

            <Form<EditPersonalDataFormData>
                schema={
                    editPersonalDataFormSchema
                }
                formOptions={{
                    defaultValues: {
                        name:
                            personalData.name,
                        birthDate:
                            personalData.birthDate ??
                            "",
                        email:
                            personalData.email,
                        rg:
                            personalData.rg ??
                            "",
                        phoneNumber:
                            personalData.phoneNumber ??
                            "",
                        profilePhoto:
                            undefined,
                    },
                }}
                onSubmit={handleSubmit}
                onError={(errors) => {
                    console.error(
                        "Erros do formulário:",
                        errors,
                    );
                }}
                className="items-stretch gap-5 px-5 pt-5 md:px-8 md:pt-6"
            >
                <section className="grid gap-4 rounded-2xl border border-j-gray-200 bg-j-gray-100/60 p-4 md:grid-cols-[minmax(0,1fr)_minmax(240px,0.9fr)] md:items-center md:p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-j-white bg-j-gray-200 shadow-md ring-2 ring-j-gray-200">
                            {personalData.profilePhotoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={
                                        personalData.profilePhotoUrl
                                    }
                                    alt={
                                        personalData.name
                                    }
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <UserRound
                                    size={38}
                                    className="text-j-gray-400"
                                />
                            )}
                        </div>

                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <Camera
                                    size={17}
                                    className="text-j-gray-500"
                                />

                                <h3 className="text-sm font-extrabold text-j-blue-800">
                                    Foto de perfil
                                </h3>
                            </div>

                            <p className="mt-1 text-xs leading-relaxed text-j-gray-500">
                                {personalData.profilePhotoUrl
                                    ? "Escolha outra imagem para substituir a foto atual."
                                    : "Você está utilizando a imagem padrão de usuário."}
                            </p>
                        </div>
                    </div>

                    <InputFile.Image
                        name="profilePhoto"
                        label="Selecionar nova foto"
                        maxFiles={1}
                        cropShape="circle"
                        className="[&_label]:font-bold [&_label]:text-j-gray-700 [&_p]:!text-j-gray-500 [&_svg]:text-j-gray-400 [&>div]:bg-j-white [&>div]:py-4"
                    />
                    {personalData.profilePhotoUrl && (
                        <button
                            type="button"
                            onClick={handleRemovePhoto}
                            disabled={isSaving}
                            className="text-left text-xs font-semibold text-j-red-500 hover:text-j-red-700 disabled:opacity-50"
                        >
                            Remover foto atual
                        </button>
                    )}
                </section>

                <div className="flex items-center gap-2 border-b border-j-gray-200 pb-3">
                    <CalendarDays size={17} className="text-j-gray-500" />
                    <h3 className="text-sm font-extrabold text-j-blue-800">
                        Informações pessoais
                    </h3>
                </div>

                <InputRegister
                    label="Nome completo"
                    name="name"
                    placeholder="Nome completo"
                    required
                    labelClassName="text-j-gray-700"
                    className="border-j-gray-200 bg-j-gray-100 px-4 py-3 text-j-gray-700 placeholder:text-j-gray-400 focus:bg-j-white"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                    <InputRegister
                        type="date"
                        label="Data de nascimento"
                        name="birthDate"
                        labelClassName="text-j-gray-700"
                        className="border-j-gray-200 bg-j-gray-100 px-4 py-3 text-j-gray-700 focus:bg-j-white"
                    />

                    <InputRegister
                        label="RG"
                        name="rg"
                        placeholder="00.000.000-0"
                        labelClassName="text-j-gray-700"
                        className="border-j-gray-200 bg-j-gray-100 px-4 py-3 text-j-gray-700 placeholder:text-j-gray-400 focus:bg-j-white"
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <InputRegister
                        type="email"
                        label="E-mail"
                        name="email"
                        placeholder="nome@email.com"
                        required
                        labelClassName="text-j-gray-700"
                        className="border-j-gray-200 bg-j-gray-100 px-4 py-3 text-j-gray-700 placeholder:text-j-gray-400 focus:bg-j-white"
                    />

                    <InputRegister
                        type="tel"
                        label="Telefone"
                        name="phoneNumber"
                        placeholder="(12) 99999-9999"
                        labelClassName="text-j-gray-700"
                        className="border-j-gray-200 bg-j-gray-100 px-4 py-3 text-j-gray-700 placeholder:text-j-gray-400 focus:bg-j-white"
                    />
                </div>

                <div className="-mx-5 mt-1 flex flex-col-reverse gap-3 border-t border-j-gray-200 bg-j-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-end md:-mx-8 md:px-8">
                    <Button
                        type="button"
                        onClick={setClose}
                        className="border-2 border-j-gray-200 bg-j-white px-5 text-j-gray-600 hover:border-j-gray-300 hover:bg-j-gray-100 hover:text-j-gray-700"
                    >
                        Cancelar
                    </Button>

                    <Button
                        type="submit"
                        disabled={isSaving}
                        className="gap-2 px-6"
                    >
                        <Save size={16} />
                        {isSaving ? "Salvando..." : "Salvar alterações"}
                    </Button>
                </div>
            </Form>
        </div>
    );
}

export default EditPersonalDataModal;
