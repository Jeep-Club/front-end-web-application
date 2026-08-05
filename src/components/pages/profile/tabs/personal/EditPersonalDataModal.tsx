"use client";

import type { ElementType } from "react";
import {
    CalendarDays,
    Camera,
    ShieldCheck,
    UserRound,
    UserRoundPen,
    X,
} from "lucide-react";
import toast from "react-hot-toast";

import {
    Button,
    ButtonIcon,
} from "@/components/common/button";
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

function fileToBase64(
    file: File,
): Promise<string> {
    return new Promise(
        (resolve, reject) => {
            const reader =
                new FileReader();

            reader.onload = () => {
                if (
                    typeof reader.result !==
                    "string"
                ) {
                    reject(
                        new Error(
                            "Não foi possível processar a imagem",
                        ),
                    );

                    return;
                }

                resolve(reader.result);
            };

            reader.onerror = () => {
                reject(
                    new Error(
                        "Erro ao carregar imagem",
                    ),
                );
            };

            reader.readAsDataURL(file);
        },
    );
}

function formatDate(
    value: string | null,
) {
    if (!value) {
        return "Não informado";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Não informado";
    }

    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            dateStyle: "short",
            ...(value.includes("T")
                ? {
                      timeStyle:
                          "short" as const,
                  }
                : {}),
        },
    ).format(date);
}

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

    const handleSubmit = async (
        data: EditPersonalDataFormData,
    ) => {
        try {
            const selectedPhoto =
                data.profilePhoto?.[0];

            const profilePhotoUrl =
                selectedPhoto
                    ? await fileToBase64(
                          selectedPhoto,
                      )
                    : personalData.profilePhotoUrl;

            onSave({
                ...personalData,
                name: data.name.trim(),
                birthDate:
                    data.birthDate || null,
                email: data.email.trim(),
                rg:
                    data.rg.trim() ||
                    null,
                phoneNumber:
                    data.phoneNumber.trim() ||
                    null,
                profilePhotoUrl,
            });

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
        }
    };

    return (
        <div className="relative flex max-h-[90dvh] w-full max-w-2xl flex-col gap-5 overflow-y-auto overflow-x-hidden rounded-2xl bg-j-blue-800 p-5 text-j-white shadow-[-1px_16px_23px_1px_rgba(0,0,0,0.35)] md:p-8">
            <ButtonIcon
                type="button"
                onClick={setClose}
                title="Fechar"
                className="absolute right-3 top-3 text-j-transparent-white hover:text-j-yellow-300 md:right-4 md:top-4"
            >
                <X size={22} />
            </ButtonIcon>

            <header className="flex flex-col gap-2 pr-10">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-j-blue-700 text-j-yellow-300">
                    <UserRoundPen
                        size={20}
                    />
                </span>

                <h2 className="text-xl font-extrabold text-j-white md:text-2xl">
                    Editar dados pessoais
                </h2>

                <p className="text-xs text-j-transparent-white md:text-sm">
                    Atualize suas informações e
                    sua foto de perfil.
                </p>
            </header>

            <div className="grid gap-3 rounded-xl bg-j-blue-700/60 p-4 sm:grid-cols-2">
                <ReadOnlyItem
                    label="CPF"
                    value={formatCpf(
                        personalData.cpf,
                    )}
                    icon={ShieldCheck}
                />

                <ReadOnlyItem
                    label="Status"
                    value={
                        statusLabels[
                            personalData.status
                        ]
                    }
                    icon={ShieldCheck}
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
                className="items-stretch gap-4"
            >
                <section className="flex flex-col gap-4 rounded-xl bg-j-blue-700/40 p-4">
                    <div className="flex items-center gap-4">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-j-yellow-300 bg-j-blue-700">
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
                                    className="text-j-transparent-white"
                                />
                            )}
                        </div>

                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <Camera
                                    size={17}
                                    className="text-j-yellow-300"
                                />

                                <h3 className="text-sm font-bold text-j-white">
                                    Foto de perfil
                                </h3>
                            </div>

                            <p className="mt-1 text-xs text-j-transparent-white">
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
                    />
                </section>

                <InputRegister
                    label="Nome completo"
                    name="name"
                    placeholder="Nome completo"
                    required
                />

                <div className="grid gap-4 sm:grid-cols-2">
                    <InputRegister
                        type="date"
                        label="Data de nascimento"
                        name="birthDate"
                    />

                    <InputRegister
                        label="RG"
                        name="rg"
                        placeholder="00.000.000-0"
                    />
                </div>

                <InputRegister
                    type="email"
                    label="E-mail"
                    name="email"
                    placeholder="nome@email.com"
                    required
                />

                <InputRegister
                    type="tel"
                    label="Telefone"
                    name="phoneNumber"
                    placeholder="(12) 99999-9999"
                />

                <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <Button
                        type="button"
                        onClick={setClose}
                        className="border-2 border-j-transparent-white bg-transparent text-j-white hover:bg-j-white/10 hover:text-j-white"
                    >
                        Cancelar
                    </Button>

                    <Button type="submit">
                        Salvar alterações
                    </Button>
                </div>
            </Form>
        </div>
    );
}

interface ReadOnlyItemProps {
    label: string;
    value: string;
    icon: ElementType;
}

function ReadOnlyItem({
    label,
    value,
    icon: Icon,
}: ReadOnlyItemProps) {
    return (
        <div className="flex items-center gap-3">
            <Icon
                size={17}
                className="shrink-0 text-j-yellow-300"
            />

            <div className="min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-wide text-j-transparent-white">
                    {label}
                </span>

                <span className="block truncate text-sm font-semibold text-j-white">
                    {value}
                </span>
            </div>
        </div>
    );
}

export default EditPersonalDataModal;