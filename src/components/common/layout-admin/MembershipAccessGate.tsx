"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/common/button";
import { getMembershipAccessAction } from "@/server/actions/membership/access";
import logoutAction from "@/server/actions/auth/logout";
import { useModal } from "@/providers/ModalProvider";
import { canAccessMembershipPage, PAYMENT_HISTORY_PATH, type MembershipAccess } from "@/utils/membership/access";

interface Props {
    initialAccess: MembershipAccess;
    initialPath: string;
    children: ReactNode;
    paymentHistory: ReactNode;
}

export function MembershipAccessGate({ initialAccess, initialPath, children, paymentHistory }: Props) {
    const pathname = usePathname();
    const router = useRouter();
    const { setClose } = useModal();
    const previousAccess = useRef(initialAccess);
    const access = useQuery({
        queryKey: ["membership", "access", pathname],
        queryFn: getMembershipAccessAction,
        initialData: pathname === initialPath ? initialAccess : undefined,
        // Recheck on navigation and focus, including when a previously visited route is cached.
        staleTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
        refetchInterval: 60_000,
        retry: false,
    });
    const logout = useMutation({
        mutationFn: logoutAction,
        onSuccess: () => { window.location.assign(new URL("/login", window.location.origin)); },
    });
    const state = access.data ?? "unavailable";
    const canVisit = canAccessMembershipPage(state, pathname);

    useEffect(() => {
        if (access.data && !access.isFetching && !canVisit) router.replace(PAYMENT_HISTORY_PATH);
    }, [access.data, access.isFetching, canVisit, router]);

    useEffect(() => {
        if (access.data && previousAccess.current === "allowed" && state !== "allowed") setClose();
        if (access.data) previousAccess.current = state;
    }, [access.data, state, setClose]);

    if (access.isPending || !canVisit || (!access.isFetchedAfterMount && pathname !== PAYMENT_HISTORY_PATH)) return <main className="flex min-h-dvh items-center justify-center bg-background p-6 text-primary"><p role="status">Verificando acesso…</p></main>;
    if (state === "allowed") return children;

    return <main className="min-h-dvh bg-background text-primary">
        <header className="border-b border-input-border bg-background-secondary p-4 sm:p-6">
            <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div role="status">
                    <h1 className="text-lg font-bold">{state === "payment-required" ? "Regularize sua membritude" : "Não foi possível verificar sua membritude"}</h1>
                    <p className="mt-1 text-sm">{state === "payment-required" ? "O acesso às demais páginas está bloqueado por uma pendência na cobrança de referência. A gestão de débitos continua disponível." : "Tente verificar novamente. A gestão de débitos continua disponível enquanto o serviço se recupera."}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                    <Button type="button" disabled={access.isFetching} onClick={() => void access.refetch()} className="min-h-10 px-4">{access.isFetching ? "Verificando…" : "Verificar acesso novamente"}</Button>
                    <Button type="button" disabled={logout.isPending} onClick={() => logout.mutate()} className="min-h-10 px-4">{logout.isPending ? "Saindo…" : "Sair"}</Button>
                </div>
            </div>
        </header>
        {paymentHistory}
    </main>;
}
