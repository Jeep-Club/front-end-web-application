"use client";

import { useEffect, useState, useTransition } from "react";
import { KeyRound, LoaderCircle, X } from "lucide-react";

import { Button, ButtonIcon } from "@/components/common/button";
import { Input } from "@/components/common/input";
import {
    adminMemberRegistrationFormSchema,
    type UpdateAdminMemberRegistrationInput,
} from "@/schemas/membership/memberRegistry";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { useModal } from "@/providers/ModalProvider";
import { useModalFocusRestoration } from "./useModalFocusRestoration";

interface UserMembershipNumberModalProps {
    user: AdminUser;
    onLoad: (userId: number) => Promise<AdminMemberRegistration | null>;
    onSave: (input: UpdateAdminMemberRegistrationInput) => Promise<AdminMemberRegistration>;
    onSuccess: () => void;
}

export function UserMembershipNumberModal({ user, onLoad, onSave, onSuccess }: UserMembershipNumberModalProps) {
    useModalFocusRestoration();
    const { setClose } = useModal();
    const [, startLoadTransition] = useTransition();
    const [registration, setRegistration] = useState<AdminMemberRegistration | null>(null);
    const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
    const [loadError, setLoadError] = useState("");
    const [loadAttempt, setLoadAttempt] = useState(0);
    const [membershipNumber, setMembershipNumber] = useState("");
    const [reason, setReason] = useState("");
    const [membershipNumberError, setMembershipNumberError] = useState("");
    const [reasonError, setReasonError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        let active = true;
        startLoadTransition(() => {
            void onLoad(user.id)
                .then((currentRegistration) => {
                    if (!active) return;
                    setRegistration(currentRegistration);
                    setMembershipNumber(currentRegistration?.membershipNumber ?? "");
                    setLoadState("ready");
                })
                .catch((error: unknown) => {
                    if (!active) return;
                    setLoadError(extractApiErrorMessage(error, "Não foi possível consultar a matrícula."));
                    setLoadState("error");
                });
            });

        return () => {
            active = false;
        };
    }, [loadAttempt, onLoad, startLoadTransition, user.id]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setMembershipNumberError("");
        setReasonError("");

        const parsed = adminMemberRegistrationFormSchema.safeParse({ membershipNumber, reason });
        if (!parsed.success) {
            for (const issue of parsed.error.issues) {
                if (issue.path[0] === "membershipNumber") setMembershipNumberError(issue.message);
                if (issue.path[0] === "reason") setReasonError(issue.message);
            }
            return;
        }

        const input: UpdateAdminMemberRegistrationInput = registration
            ? {
                mode: "CORRECT",
                userId: user.id,
                membershipNumber: parsed.data.membershipNumber,
                expectedVersion: registration.version,
                reason: parsed.data.reason,
            }
            : {
                mode: "ASSIGN",
                userId: user.id,
                membershipNumber: parsed.data.membershipNumber,
                reason: parsed.data.reason,
            };

        setIsSaving(true);
        try {
            await onSave(input);
            onSuccess();
            setClose();
        } catch {
            // A falha da mutation já é apresentada pelo feedback global; mantém o formulário aberto.
        } finally {
            setIsSaving(false);
        }
    }

    const isAssignment = loadState === "ready" && registration === null;
    const title = loadState !== "ready" ? "Gerenciar matrícula" : isAssignment ? "Atribuir matrícula" : "Retificar matrícula";

    return (
        <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="membership-number-title"
            className="relative max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-3xl bg-j-white shadow-2xl"
        >
            <ButtonIcon
                type="button"
                onClick={setClose}
                disabled={isSaving}
                aria-label="Fechar edição de matrícula"
                className="absolute right-4 top-4 rounded-full bg-j-gray-100 p-2 text-j-gray-600 hover:bg-j-gray-200 hover:text-j-blue-800"
            >
                <X size={20} aria-hidden="true" />
            </ButtonIcon>

            <header className="border-b border-j-gray-200 px-5 py-5 pr-16 sm:px-7">
                <div className="flex items-start gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-j-blue-800 text-j-yellow-300">
                        <KeyRound size={20} aria-hidden="true" />
                    </span>
                    <div>
                        <h2 id="membership-number-title" className="text-xl font-extrabold text-j-blue-800">{title}</h2>
                        <p className="mt-1 text-sm text-j-gray-600">{user.name}</p>
                    </div>
                </div>
            </header>

            {loadState === "loading" ? (
                <p role="status" className="flex items-center justify-center gap-2 p-8 text-sm text-j-gray-600">
                    <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
                    Consultando matrícula...
                </p>
            ) : loadState === "error" ? (
                <div className="p-6 text-center">
                    <p role="alert" className="text-sm text-red-700">{loadError}</p>
                    <Button
                        type="button"
                        onClick={() => {
                            setLoadError("");
                            setLoadState("loading");
                            setLoadAttempt((attempt) => attempt + 1);
                        }}
                        className="mx-auto mt-4"
                    >
                        Tentar novamente
                    </Button>
                </div>
            ) : (
                <form noValidate onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-4 p-5 sm:p-7">
                    {registration && (
                        <p className="rounded-xl bg-j-gray-100 px-3 py-2 text-sm text-j-gray-700">
                            Matrícula atual: <strong className="text-j-blue-900">{registration.membershipNumber}</strong>
                        </p>
                    )}
                    {isAssignment && (
                        <p className="rounded-xl bg-j-blue-50 px-3 py-2 text-sm leading-relaxed text-j-blue-900">
                            A atribuição exige usuário ativo com o primeiro acesso concluído. O motivo será registrado no histórico.
                        </p>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <Input
                            register={false}
                            name="membershipNumber"
                            label="Matrícula"
                            inputMode="numeric"
                            autoComplete="off"
                            maxLength={64}
                            id="admin-membership-number"
                            required
                            value={membershipNumber}
                            onChange={(event) => setMembershipNumber(event.target.value)}
                            aria-invalid={Boolean(membershipNumberError)}
                            aria-describedby="admin-membership-number-help"
                            error={membershipNumberError}
                        />
                        <p id="admin-membership-number-help" className="text-xs text-j-gray-500">
                            Informe somente números; zeros à esquerda são normalizados.
                        </p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Input
                            register={false}
                            name="reason"
                            label="Motivo da alteração"
                            maxLength={500}
                            id="admin-membership-number-reason"
                            required
                            value={reason}
                            onChange={(event) => setReason(event.target.value)}
                            aria-invalid={Boolean(reasonError)}
                            aria-describedby="admin-membership-number-reason-help"
                            error={reasonError}
                        />
                        <p id="admin-membership-number-reason-help" className="text-xs text-j-gray-500">
                            Esse motivo ficará registrado na auditoria (até 500 caracteres).
                        </p>
                    </div>

                    <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            onClick={setClose}
                            disabled={isSaving}
                            className="border border-j-gray-300 bg-j-white text-j-gray-700 hover:bg-j-gray-100 hover:text-j-gray-900"
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSaving} className="min-w-36">
                            {isSaving && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />}
                            {isSaving ? "Salvando..." : isAssignment ? "Atribuir matrícula" : "Salvar matrícula"}
                        </Button>
                    </div>
                </form>
            )}
        </section>
    );
}
