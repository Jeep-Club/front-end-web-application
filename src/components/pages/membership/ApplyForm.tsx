'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, LoaderCircle, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { Form } from '@/components/common/form';
import { Button } from '@/components/common/button';
import { InputRegister } from '@/components/common/input/input-register';
import InputEmail from '@/components/common/input/input-email';
import InputCPF from '@/components/common/input/input-cpf';
import InputPhoneNumber from '@/components/common/input/input-phonenumber';
import { TextareaRegister } from '@/components/common/textarea/textarea-register';
import { membershipApplicationFormSchema } from '@/schemas/membership/application';
import { submitMembershipApplicationAction } from '@/actions/membership/submit-application';

const fieldStyle = {
    labelClassName: 'text-sm font-semibold text-j-gray-700',
    className: 'h-12 rounded-xl border-j-gray-300 bg-j-white text-j-gray-800 placeholder:text-j-gray-400 focus:border-j-yellow-400 focus:outline-j-yellow-400',
};

export default function ApplyForm() {
    const router = useRouter();
    const [submitted, setSubmitted] = useState<number | null>(null);
    const mutation = useMutation({
        mutationFn: submitMembershipApplicationAction,
        onSuccess: (result) => {
            setSubmitted(result.id);
            toast.success(result.created ? 'Solicitação enviada para análise.' : 'Sua solicitação pendente foi localizada.');
        },
        onError: (error) => toast.error(error.message),
    });

    return (
        <main className="min-h-dvh bg-[#0e0e0e] px-4 py-8 text-j-white sm:px-6">
            <div className="mx-auto w-full max-w-2xl">
                <button type="button" onClick={() => router.push('/')} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-white/75 hover:text-j-yellow-300"><ArrowLeft size={17} /> Voltar para a página inicial</button>
                <section className="overflow-hidden rounded-3xl border border-white/10 bg-j-white text-j-gray-800 shadow-2xl">
                    <header className="bg-j-blue-800 px-5 py-6 text-white sm:px-8">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-j-yellow-300">Jeep Clube Tamoios</p>
                        <h1 className="mt-2 text-2xl font-black sm:text-3xl">Quero ser sócio</h1>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-white/75">Conte um pouco sobre você e deixe seus contatos. A diretoria vai analisar sua solicitação e entrar em contato.</p>
                    </header>
                    {submitted !== null ? (
                        <div className="px-5 py-12 text-center sm:px-8">
                            <CheckCircle2 size={48} className="mx-auto text-green-600" />
                            <h2 className="mt-4 text-xl font-extrabold text-j-blue-800">Solicitação recebida</h2>
                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-j-gray-600">Seu pedido foi encaminhado para análise. Se aprovado, a diretoria enviará as instruções para seu contato.</p>
                            <Button type="button" onClick={() => router.push('/')} className="mx-auto mt-6">Voltar ao início</Button>
                        </div>
                    ) : (
                        <Form<MembershipApplicationForm> schema={membershipApplicationFormSchema} onSubmit={(data) => mutation.mutate(data)} onError={() => toast.error('Revise os campos destacados.')} className="items-stretch gap-5 p-5 sm:p-8">
                            <InputRegister {...fieldStyle} name="name" label="Nome completo" placeholder="Seu nome e sobrenome" autoComplete="name" required />
                            <div className="grid gap-5 sm:grid-cols-2">
                                <InputCPF {...fieldStyle} name="cpf" label="CPF" autoComplete="off" required />
                                <InputPhoneNumber {...fieldStyle} name="phoneNumber" label="Celular com DDD" placeholder="(12) 99999-9999" autoComplete="tel-national" required />
                            </div>
                            <InputEmail {...fieldStyle} name="email" label="E-mail (opcional)" placeholder="voce@exemplo.com" autoComplete="email" />
                            <TextareaRegister name="message" label="Carta de apresentação" placeholder="Fale sobre você, seu interesse pelo clube e o que gostaria de viver com a comunidade..." rows={6} maxLength={2000} required labelClassName="text-sm font-semibold text-j-gray-700" className="min-h-36 rounded-xl border-j-gray-300 bg-j-white text-j-gray-800 placeholder:text-j-gray-400 focus:border-j-yellow-400" />
                            <p className="-mt-3 text-xs leading-5 text-j-gray-500">Seus dados serão usados pela diretoria para avaliar e responder à solicitação.</p>
                            <Button type="submit" disabled={mutation.isPending} aria-busy={mutation.isPending} className="min-h-12 w-full gap-2">{mutation.isPending ? <>Enviando... <LoaderCircle size={18} className="animate-spin" /></> : <>Enviar solicitação <Send size={17} /></>}</Button>
                        </Form>
                    )}
                </section>
            </div>
        </main>
    );
}
