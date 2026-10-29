'use client';

import { Button } from "@/components/common/button";
import { Form } from "@/components/common/form";
import InputPassword from "@/components/common/input/input-password";
import { firstAccessPasswordSchema,type FirstAccessPasswordForm } from "@/schemas/auth/first-access-password";
import { completeFirstAccessPasswordAction } from "@/server/actions/auth/complete-first-access-password";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight,LoaderCircle,LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function PasswordForm() {
    const router = useRouter();
    const mutation = useMutation({
        mutationFn: completeFirstAccessPasswordAction,
        onSuccess: () => {
            toast.success("Senha criada. Agora vamos completar seu cadastro.");
            router.replace("/feed");
            router.refresh();
        },

    });

    return (
        <Form<FirstAccessPasswordForm>
            schema={firstAccessPasswordSchema}
            onSubmit={(data) => mutation.mutate(data)}
            onError={() => toast.error("Confira os campos e confirme se as senhas são iguais.")}
            className="w-full"
        >
            <div className="flex flex-col gap-4">
                <InputPassword
                    name="password"
                    label="Nova senha"
                    labelClassName="text-j-gray-700"
                    className="h-12 rounded-xl border-j-gray-300 bg-j-white text-j-gray-700 placeholder:text-j-gray-400 focus:border-j-yellow-400 focus:outline-j-yellow-400"
                    autoComplete="new-password"
                    required
                />
                <InputPassword
                    name="confirmPassword"
                    label="Confirmar senha"
                    labelClassName="text-j-gray-700"
                    className="h-12 rounded-xl border-j-gray-300 bg-j-white text-j-gray-700 placeholder:text-j-gray-400 focus:border-j-yellow-400 focus:outline-j-yellow-400"
                    autoComplete="new-password"
                    required
                />
                <p className="text-xs leading-5 text-j-gray-500">Use pelo menos 8 caracteres, com letras maiúsculas e minúsculas, um número e um caractere especial.</p>
                <Button type="submit" disabled={mutation.isPending} className="mt-2 min-h-12 w-full gap-2">
                    {mutation.isPending ? <><LoaderCircle size={18} className="animate-spin" /> Salvando senha...</> : <>Criar senha e continuar <ArrowRight size={18} /></>}
                </Button>
            </div>
        </Form>
    );
}

export default function FirstAccessPasswordPage() {
    return (
        <main className="flex min-h-dvh items-center justify-center bg-j-gray-100 p-4">
            <section className="w-full max-w-lg rounded-2xl border border-j-gray-200 bg-j-white p-5 shadow-lg sm:p-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-j-blue-800 text-j-yellow-300"><LockKeyhole size={23} /></div>
                <p className="text-sm font-bold uppercase tracking-wide text-j-yellow-600">Primeiro acesso</p>
                <h1 className="mt-2 text-2xl font-extrabold text-j-blue-800">Crie sua senha</h1>
                <p className="mb-6 mt-2 text-sm leading-6 text-j-gray-600">Antes de acessar o sistema, escolha e confirme uma senha pessoal.</p>
                <PasswordForm />
            </section>
        </main>
    );
}
