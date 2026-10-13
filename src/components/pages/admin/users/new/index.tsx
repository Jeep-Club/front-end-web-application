'use client';

import { useRouter } from "next/navigation";
import { useMutation } from '@tanstack/react-query';
import toast from "react-hot-toast";
import { ArrowRight, Check, Copy, LoaderCircle, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { UserWorkspace } from "../UserWorkspace";

import { Form } from "@/components/common/form";
import { Button } from "@/components/common/button";
import { InputRegister } from "@/components/common/input/input-register";
import InputEmail from "@/components/common/input/input-email";
import InputCPF from "@/components/common/input/input-cpf";
import InputDate from "@/components/common/input/input-date";
import InputPhoneNumber from "@/components/common/input/input-phonenumber";
import { adminCreateUserFormSchema } from "@/schemas/admin/create-user";
import { createFirstAccessUserAction } from "@/actions/admin/users/create-first-access";

const fieldStyle = {
    labelClassName: "text-j-gray-600 [&>span]:text-j-red-500",
    className: "min-w-0 h-12 border rounded-xl border-j-gray-300 bg-j-white font-normal text-j-gray-700 placeholder:text-j-gray-400 focus:border-j-yellow-400 focus:outline-j-yellow-400 aria-[invalid=true]:border-j-red-500",
};

export function NewAdminUserPage() {
    const router = useRouter();
    const [selected, setSelected] = useState("personal");
    const [createdUser, setCreatedUser] = useState<AdminCreateUserResponse | null>(null);
    const [copied, setCopied] = useState(false);
    const mutation = useMutation({
        mutationFn: createFirstAccessUserAction,
        onSuccess: (result) => {
            setCreatedUser(result);
            toast.success(result.activationMethod === "TEMPORARY_PASSWORD"
                ? "Usuário cadastrado com sucesso!"
                : "Cadastro criado. Confira o status do convite.");
        },
        onError: (error) => {
            toast.error(error.message || 'Erro ao cadastrar usuÃ¡rio. Verifique os dados e tente novamente.');
        },
    });

    const isLoading = mutation.isPending;
    const handleSubmit = (data: AdminCreateUserForm) => {
        if (!isLoading) mutation.mutate(data);
    };

    if (createdUser?.activationMethod === "TEMPORARY_PASSWORD") {
        return (
            <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
                <div className="rounded-2xl border border-j-gray-200 bg-j-white p-5 shadow-sm sm:p-8">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-j-green-100 text-j-green-700"><Check size={24} /></div>
                    <h1 className="text-2xl font-extrabold text-j-blue-800">UsuÃ¡rio criado</h1>
                    <p className="mt-2 text-sm leading-6 text-j-gray-600">Entregue a senha provisÃ³ria ao usuÃ¡rio por um canal seguro. No primeiro login, ele precisarÃ¡ criar uma senha permanente.</p>
                    <div className="mt-6 rounded-xl border border-j-yellow-300 bg-j-yellow-50 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-j-gray-600">Senha provisÃ³ria Â· usuÃ¡rio #{createdUser.userId}</p>
                        <p className="mt-2 break-all font-mono text-lg font-bold text-j-blue-800">{createdUser.temporaryPassword}</p>
                    </div>
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                        <Button type="button" onClick={async () => {
                            await navigator.clipboard.writeText(createdUser.temporaryPassword);
                            setCopied(true);
                        }} className="min-h-11 flex-1 gap-2">
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                            {copied ? "Senha copiada" : "Copiar senha provisória"}
                        </Button>
                        <Button type="button" onClick={() => router.push("/admin/users")} className="min-h-11 flex-1 bg-j-gray-100 text-j-gray-700 hover:bg-j-gray-200 hover:text-j-gray-800">Voltar aos usuÃ¡rios</Button>
                    </div>
                    <p className="mt-4 text-xs text-j-gray-500">Por seguranÃ§a, esta senha serÃ¡ exibida somente agora.</p>
                </div>
            </div>
        );
    }

    if (createdUser?.activationMethod === "EMAIL_INVITATION") {
        const invitationLabel = createdUser.invitationStatus === "SENT"
            ? "Enviado pelo serviço de e-mail"
            : createdUser.invitationStatus === "DELIVERY_FAILED"
                ? "Falha ao enviar o convite"
                : "Envio pendente";

        return (
            <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
                <div className="rounded-2xl border border-j-gray-200 bg-j-white p-5 shadow-sm sm:p-8">
                    <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${createdUser.invitationStatus === "DELIVERY_FAILED" ? "bg-j-red-100 text-j-red-600" : "bg-j-green-100 text-j-green-700"}`}>
                        {createdUser.invitationStatus === "DELIVERY_FAILED" ? <Mail size={23} /> : <Check size={24} />}
                    </div>
                    <h1 className="text-2xl font-extrabold text-j-blue-800">Cadastro criado</h1>
                    <p className="mt-2 text-sm leading-6 text-j-gray-600">O usuÃ¡rio receberÃ¡ um link para definir a prÃ³pria senha. O status abaixo informa o resultado do envio pelo serviÃ§o de e-mail.</p>
                    <div className="mt-6 rounded-xl border border-j-gray-200 bg-j-gray-50 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-j-gray-500">Status do convite</p>
                        <p className={`mt-2 font-bold ${createdUser.invitationStatus === "DELIVERY_FAILED" ? "text-j-red-600" : "text-j-blue-800"}`}>{invitationLabel}</p>
                        <p className="mt-1 text-xs text-j-gray-500">UsuÃ¡rio #{createdUser.userId}</p>
                    </div>
                    {createdUser.invitationStatus === "DELIVERY_FAILED" && (
                        <p role="status" className="mt-3 text-sm text-j-red-600">O usuÃ¡rio foi criado, mas o convite nÃ£o foi entregue. VocÃª poderÃ¡ consultar e reenviar o convite nos detalhes do usuÃ¡rio.</p>
                    )}
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                        <Button type="button" onClick={() => router.push(`/admin/users/${createdUser.userId}?invitation=1`)} className="min-h-11 flex-1 gap-2">
                            Gerenciar convite <ArrowRight size={16} />
                        </Button>
                        <Button type="button" onClick={() => router.push("/admin/users")} className="min-h-11 flex-1 bg-j-gray-100 text-j-gray-700 hover:bg-j-gray-200 hover:text-j-gray-800">Voltar aos usuÃ¡rios</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <UserWorkspace
            title="Novo usuÃ¡rio"
            description="Preencha os dados para criar a conta."
            options={[
                { key: "personal", label: "Dados pessoais", description: "IdentificaÃ§Ã£o e contato", icon: UserRound },
                { key: "access", label: "Acesso", description: "Como ativarÃ¡ a conta", icon: LockKeyhole },
            ]}
            selected={selected}
            onSelect={setSelected}
            onBack={() => router.push("/admin/users")}
            disabled={isLoading}
        >
                <Form<AdminCreateUserForm>
                    schema={adminCreateUserFormSchema}
                    onSubmit={handleSubmit}
                    formOptions={{ shouldFocusError: false }}
                    onError={(errors) => {
                        const firstField = Object.keys(errors)[0];
                        setSelected(firstField === "activationMethod" ? "access" : "personal");
                        requestAnimationFrame(() => {
                            document.getElementsByName(firstField)[0]?.focus();
                        });
                        toast.error("Confira os campos destacados antes de continuar.");
                    }}
                    className="items-stretch gap-0"
                >
                    <fieldset disabled={isLoading} className="flex min-w-0 flex-col gap-4 p-4 sm:p-6 [&_input+svg]:text-j-gray-400 [&_input~button]:text-j-gray-400">
                        <p className="text-sm text-j-gray-500"><span className="font-bold text-j-red-500">*</span> Campos obrigatÃ³rios</p>

                        <CreateUserFields selected={selected} />
                    </fieldset>

                    <footer className="flex items-center gap-3 border-t border-j-gray-200 px-4 py-4 sm:justify-end sm:px-6">
                        <Button
                            type="button"
                            disabled={isLoading}
                            onClick={() => router.push("/admin/users")}
                            className="min-h-12 rounded-xl bg-transparent px-3 text-j-gray-500 hover:bg-j-gray-100 hover:text-j-gray-700"
                        >Cancelar</Button>
                        <Button type="submit" disabled={isLoading} aria-busy={isLoading} className={selected === "access" ? "min-h-12 flex-1 gap-2 rounded-xl px-4 sm:flex-none sm:px-6" : "hidden"}>
                            {isLoading ? <>Criando… <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /></> : <>Criar usuário <ArrowRight size={18} aria-hidden="true" /></>}
                        </Button>
                        {selected === "personal" && (
                            <Button type="button" disabled={isLoading} onClick={() => setSelected("access")} className="min-h-12 flex-1 gap-2 rounded-xl px-4 sm:flex-none sm:px-6">
                                Continuar <ArrowRight size={18} aria-hidden="true" />
                            </Button>
                        )}
                    </footer>
                </Form>
        </UserWorkspace>
    );
}

function CreateUserFields({ selected }: { selected: string }) {
    const { control, register, formState: { errors } } = useFormContext<AdminCreateUserForm>();
    const activationMethod = useWatch({ control, name: "activationMethod" });
    const inviteByEmail = activationMethod === "EMAIL_INVITATION";

    return (
        <>
            <section hidden={selected !== "personal"} aria-labelledby="personal-data-title">
                <h2 id="personal-data-title" className="sr-only">Dados pessoais</h2>
                <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                    <div className="min-w-0 sm:col-span-2">
                        <InputRegister {...fieldStyle} name="name" label="Nome completo" placeholder="Digite o nome completo" autoComplete="name" required />
                    </div>
                    <InputCPF {...fieldStyle} name="cpf" label="CPF" autoComplete="off" required />
                    <InputDate {...fieldStyle} name="birthDate" label="Data de nascimento" autoComplete="bday" />
                    <InputRegister {...fieldStyle} name="rg" label="RG" placeholder="Opcional" autoComplete="off" />
                    <InputPhoneNumber {...fieldStyle} name="phoneNumber" label="Telefone" placeholder="(00) 00000-0000 · opcional" autoComplete="tel-national" />
                    <div className="sm:col-span-2">
                        <InputEmail {...fieldStyle} name="email" label="E-mail" placeholder="nome@exemplo.com" autoComplete="email" required={inviteByEmail} />
                        <p className="mt-1 text-xs text-j-gray-500">
                            {inviteByEmail ? "Obrigatório para enviar o convite de ativação." : "Opcional para cadastro com senha provisória."}
                        </p>
                    </div>
                </div>
            </section>

            <section hidden={selected !== "access"} aria-labelledby="access-data-title">
                <h2 id="access-data-title" className="sr-only">Ativação da conta</h2>
                <label htmlFor="activationMethod" className="mb-2 block text-sm font-bold text-j-gray-700">
                    Como o usuário vai ativar a conta <span className="text-j-red-500">*</span>
                </label>
                <select
                    id="activationMethod"
                    {...register("activationMethod")}
                    className="h-12 w-full rounded-xl border border-j-gray-300 bg-j-white px-3 text-sm text-j-gray-700 focus:border-j-blue-500 focus:outline-none"
                    aria-invalid={Boolean(errors.activationMethod)}
                    aria-describedby={errors.activationMethod ? "activation-method-error" : undefined}
                >
                    <option value="">Selecione uma forma de ativação</option>
                    <option value="TEMPORARY_PASSWORD">Senha provisória</option>
                    <option value="EMAIL_INVITATION">Convite por e-mail</option>
                </select>
                {errors.activationMethod?.message && (
                    <p id="activation-method-error" role="alert" className="mt-1 text-sm text-j-red-600">{errors.activationMethod.message}</p>
                )}

                {activationMethod === "TEMPORARY_PASSWORD" && (
                    <div className="mt-4 rounded-xl border border-j-blue-100 bg-j-blue-50 p-4">
                        <h3 className="font-bold text-j-blue-800">Senha provisória</h3>
                        <p className="mt-1 text-sm leading-6 text-j-gray-600">O backend gera uma senha que será exibida uma única vez após o cadastro. No primeiro login, o usuário precisará criar uma senha permanente.</p>
                    </div>
                )}
                {activationMethod === "EMAIL_INVITATION" && (
                    <div className="mt-4 rounded-xl border border-j-blue-100 bg-j-blue-50 p-4">
                        <h3 className="font-bold text-j-blue-800">Convite de ativação</h3>
                        <p className="mt-1 text-sm leading-6 text-j-gray-600">O usuário receberá um link para definir a senha. Confira o e-mail informado nos dados pessoais antes de criar a conta.</p>
                    </div>
                )}
            </section>
        </>
    );
}
