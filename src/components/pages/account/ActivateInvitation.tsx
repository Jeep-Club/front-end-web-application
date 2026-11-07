'use client';

import { Button } from '@/components/common/button';
import { Form } from '@/components/common/form';
import InputPassword from '@/components/common/input/input-password';
import { accountActivationSchema,type AccountActivationForm } from '@/schemas/auth/account-activation';
import { activateAccountWithInvitationAction,validateAccountActivationInvitationAction } from '@/server/actions/auth/activate-account-invitation';
import { useMutation } from '@tanstack/react-query';
import { ArrowRight,CheckCircle2,LoaderCircle,LockKeyhole,MailWarning } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect,useState } from 'react';
import toast from 'react-hot-toast';

export default function ActivateInvitation({ token }: { token: string }) {
    const router = useRouter();
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const validation = useMutation({
        mutationFn: validateAccountActivationInvitationAction,
        onSuccess: () => setIsValid(true),
        onError: () => setIsValid(false),
    });
    const activation = useMutation({
        mutationFn: (form: AccountActivationForm) => activateAccountWithInvitationAction({ token, newPassword: form.password }),
        onSuccess: () => {
            toast.success('Conta ativada. Entre com sua nova senha.');
            router.replace('/login');
        },

    });

    useEffect(() => {
        // Keep the invitation secret out of the address bar and browser history.
        window.history.replaceState(null, '', '/account/activate');
        if (token) validation.mutate(token);
        else setIsValid(false);
        // Only validate once for the token delivered by the server page.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <main className="flex min-h-dvh items-center justify-center bg-j-gray-100 p-4">
            <section className="w-full max-w-lg rounded-2xl border border-j-gray-200 bg-j-white p-5 shadow-lg sm:p-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-j-blue-800 text-j-yellow-300">
                    {isValid === false ? <MailWarning size={23} /> : isValid ? <CheckCircle2 size={23} /> : <LockKeyhole size={23} />}
                </div>
                <p className="text-sm font-bold uppercase tracking-wide text-j-yellow-600">Ativação da conta</p>
                <h1 className="mt-2 text-2xl font-extrabold text-j-blue-800">{isValid === false ? 'Convite indisponível' : 'Crie sua senha'}</h1>
                {isValid === null && <p role="status" className="mt-4 flex items-center gap-2 text-sm text-j-gray-600"><LoaderCircle size={18} className="animate-spin" /> Validando seu convite...</p>}
                {isValid === false && <div className="mt-4 space-y-4"><p className="text-sm leading-6 text-j-gray-600">{validation.error instanceof Error ? validation.error.message : 'Este link é inválido ou expirou. Peça ao administrador para enviar um novo convite.'}</p><Button type="button" onClick={() => router.replace('/login')} className="w-full">Ir para o login</Button></div>}
                {isValid && <>
                    <p className="mb-6 mt-2 text-sm leading-6 text-j-gray-600">Escolha e confirme uma senha para ativar sua conta. Depois, entre usando seu CPF e a senha criada.</p>
                    <Form<AccountActivationForm> schema={accountActivationSchema} onSubmit={(form) => activation.mutate(form)} onError={() => toast.error('Confira os campos e confirme se as senhas são iguais.')} className="w-full">
                        <div className="flex w-full flex-col gap-4">
                            <InputPassword name="password" label="Nova senha" labelClassName="text-j-gray-700" className="h-12 rounded-xl border-j-gray-300 bg-j-white text-j-gray-700" autoComplete="new-password" required />
                            <InputPassword name="confirmPassword" label="Confirmar senha" labelClassName="text-j-gray-700" className="h-12 rounded-xl border-j-gray-300 bg-j-white text-j-gray-700" autoComplete="new-password" required />
                            <p className="text-xs text-j-gray-500">Use de 8 a 72 caracteres.</p>
                            <Button type="submit" disabled={activation.isPending} className="mt-2 min-h-12 w-full gap-2">{activation.isPending ? <>Ativando... <LoaderCircle size={18} className="animate-spin" /></> : <>Ativar conta <ArrowRight size={18} /></>}</Button>
                        </div>
                    </Form>
                </>}
            </section>
        </main>
    );
}
