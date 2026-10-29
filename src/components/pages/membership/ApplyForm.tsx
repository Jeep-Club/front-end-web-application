'use client';

import { Button } from "@/components/common/button";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, CheckCircle2, Clock, LoaderCircle, Send } from "lucide-react";
import { Form } from "@/components/common/form";
import { InputRegister } from "@/components/common/input/input-register";
import { TextareaRegister } from "@/components/common/textarea/textarea-register";
import { membershipApplicationFormSchema } from "@/schemas/membership/application";
import { submitMembershipApplicationAction } from "@/server/actions/membership/submit-application";
import { useRouter } from "next/navigation";
import { useState } from "react";

import ClubBackground from '@/components/common/ClubBackground';
import ClubFormHeader from '@/components/common/ClubFormHeader';
import toast from 'react-hot-toast';
import InputCPF from '@/components/common/input/input-cpf';
import InputEmail from '@/components/common/input/input-email';
import InputPhoneNumber from '@/components/common/input/input-phonenumber';

const fieldStyle = {
    labelClassName: 'text-sm font-semibold text-white',
    className: 'h-12 rounded-xl border-transparent bg-[#e8efff] text-[#071741] placeholder:text-slate-500 focus:border-j-yellow-400 focus:outline-j-yellow-400',
};

const statusLabels: Record<MembershipApplicationStatus, string> = {
    PENDING: 'Pendente de análise',
    APPROVED: 'Aprovada',
    REJECTED: 'Recusada',
    COMPLETED: 'Concluída',
};

export default function ApplyForm() {
    const router = useRouter();
    const [submission, setSubmission] = useState<MembershipApplicationSubmission | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: submitMembershipApplicationAction,
        onMutate: () => {
            setSubmitError(null);
        },
        onSuccess: (result) => {
            setSubmitError(null);
            setSubmission(result);
            toast.success(result.created ? 'Solicita??o enviada para an?lise.' : 'Solicita??o pendente j? existente localizada.');
        },
        onError: (error) => {
            const message = error.message || 'Não foi possível enviar sua solicitação. Tente novamente.';
            setSubmitError(message);
            toast.error(message);
        },
    });

    return (
        <main className="relative isolate min-h-dvh bg-[#0e0e0e] px-4 py-8 text-j-gray-800 sm:px-6 sm:py-12">
            <ClubBackground />
            <div className="relative mx-auto w-full max-w-2xl">
                <button type="button" onClick={() => router.push('/')} className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-3 py-2 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-400"><ArrowLeft size={17} aria-hidden="true" /> Voltar para a página inicial</button>
                <section className="overflow-hidden rounded-2xl bg-j-blue-800 text-white shadow-2xl shadow-black/40">
                    <ClubFormHeader title="Seja sócio do Jeep Clube Tamoios" description="Conte um pouco sobre você e deixe seus contatos. A diretoria vai analisar sua solicitação e entrar em contato." />
                    {submission !== null ? (
                        <div className="px-5 py-12 text-center sm:px-8">
                            {submission.created ? (
                                <CheckCircle2 size={48} className="mx-auto text-green-400" />
                            ) : (
                                <Clock size={48} className="mx-auto text-j-yellow-300" />
                            )}
                            <h2 className="mt-4 text-xl font-extrabold text-white">
                                {submission.created ? 'Solicitação recebida' : 'Solicitação pendente já existente'}
                            </h2>
                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/80">
                                {submission.created
                                    ? 'Seu pedido foi encaminhado para análise. Se aprovado, a diretoria enviará as instruções para seu contato.'
                                    : 'Já existe uma solicitação pendente em análise para este CPF. O pedido anterior foi mantido sem alterações nos dados enviados anteriormente.'}
                            </p>
                            <div className="mx-auto mt-5 inline-flex flex-wrap items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white/90">
                                <span>Protocolo #{submission.id}</span>
                                <span aria-hidden="true" className="text-white/40">•</span>
                                <span>Status: {statusLabels[submission.status] ?? submission.status}</span>
                            </div>
                            <div className="mt-6 flex justify-center">
                                <Button type="button" onClick={() => router.push('/')} className="mx-auto">Voltar ao início</Button>
                            </div>
                        </div>
                    ) : (
                        <Form<MembershipApplicationForm> schema={membershipApplicationFormSchema} onSubmit={(data) => mutation.mutate(data)} onError={() => toast.error('Revise os campos destacados.')} className="items-stretch gap-5 p-5 sm:p-8">
                            {submitError && (
                                <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-400/40 bg-red-500/15 px-4 py-3 text-sm text-red-100">
                                    <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-300" aria-hidden="true" />
                                    <span>{submitError}</span>
                                </div>
                            )}
                            <InputRegister {...fieldStyle} name="name" label="Nome completo" placeholder="Seu nome e sobrenome" maxLength={150} autoComplete="name" required />
                            <div className="grid gap-5 sm:grid-cols-2">
                                <InputCPF {...fieldStyle} name="cpf" label="CPF" autoComplete="off" required />
                                <InputPhoneNumber {...fieldStyle} name="phoneNumber" label="Celular com DDD" placeholder="(12) 99999-9999" autoComplete="tel-national" required />
                            </div>
                            <InputEmail {...fieldStyle} name="email" label="E-mail (opcional)" placeholder="voce@exemplo.com" maxLength={180} autoComplete="email" />
                            <TextareaRegister name="message" label="Carta de apresentação" placeholder="Fale sobre você, seu interesse pelo clube e o que gostaria de viver com a comunidade..." rows={6} maxLength={2000} labelClassName="text-sm font-semibold text-white" className="min-h-36 rounded-xl border-transparent bg-[#e8efff] text-[#071741] placeholder:text-slate-500 focus:border-j-yellow-400" />
                            <p className="-mt-3 text-xs leading-5 text-white/75">Seus dados serão usados pela diretoria para avaliar e responder à solicitação.</p>
                            <Button type="submit" disabled={mutation.isPending} aria-busy={mutation.isPending} className="min-h-12 w-full gap-2">{mutation.isPending ? <>Enviando... <LoaderCircle size={18} className="animate-spin" /></> : <>Enviar solicitação <Send size={17} /></>}</Button>
                        </Form>
                    )}
                </section>
            </div>
        </main>
    );
}
