'use client';

import { refreshAction } from "@/actions/refresh";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

export default function Home() {
    const mutation = useMutation({ 
        mutationFn: refreshAction,
        onSuccess: (message) => toast.success(message),
        onError: (error) => toast.error('Erro ao fazer refresh')
    });

    return (
        <>
            <button onClick={async() => mutation.mutateAsync()}>
                Clique aqui para testar a página Home
            </button>
        </>
    )
}