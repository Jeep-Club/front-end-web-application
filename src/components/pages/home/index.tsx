'use client';

import { refreshAction } from "@/actions/refresh";
import { Form } from "@/components/common/form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Input } from "@/components/common/input";
import z from "zod";

export default function Home() {
    const mutation = useMutation({ 
        mutationFn: refreshAction,
        onSuccess: (message) => toast.success(message),
        onError: (error) => toast.error('Erro ao fazer refresh')
    });

    const handleSubmit = async (data: any) => {
        console.log('Formulário enviado', data);
    }

    const formSchema = z.object({
        cpf: z.string(),
        nome: z.string().min(2, 'O nome deve conter pelo menos 2 caracteres'),
    })

    return (
        <>
            <button onClick={async() => mutation.mutateAsync()}>
                Clique aqui para testar a página Home
            </button>
            <Form
                onSubmit={handleSubmit}
                schema={formSchema}
                className="flex flex-col gap-4"
            >
                <Input label="CPF" name="cpf" type="text" value="123.456.789-00"/>
                <Input label="Nome" name="nome" type="text"/>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                    Enviar
                </button>
            </Form>
        </>
    )
}