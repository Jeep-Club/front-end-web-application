'use client';

import { refreshAction } from "@/actions/refresh";
import { Form } from "@/components/common/form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Input } from "@/components/common/input";
import z from "zod";
import { useState } from "react";
import { Select } from "@/components/common/select";
import { Textarea } from "@/components/common/textarea";
import logoutAction from "@/actions/logout";

interface FormData {
    cpf: string;
    nome: string;
    opcao: string;
    legenda: string;
}

export default function Home() {
    const mutation = useMutation({ 
        mutationFn: logoutAction,
        onSuccess: () => toast.success('Logout realizado com sucesso'),
        onError: (error) => toast.error('Erro ao fazer logout')
    });

    const handleSubmit = async (data: any) => {
        console.log('Formulário enviado', data);
        console.log('Valor do CPF no estado:', cpf);
        console.log('Valor da Legenda no estado:', legenda);
    }

    const handleError = (errors: any) => {
        console.log('Erros de validação', errors);
    }

    const formSchema: z.ZodType<FormData> = z.object({
        cpf: z.string(),
        nome: z.string().min(2, 'O nome deve conter pelo menos 2 caracteres'),
        opcao: z.string().nonempty('Selecione uma opção'),
        legenda: z.string(),
    })

    const [cpf, setCpf] = useState('123.456.789-00');
    const [legenda, setLegenda] = useState('Legenda inicial');
    return (
        <>
            <button onClick={async() => mutation.mutateAsync()}>
                Clique aqui para testar a página Home
            </button>
            <Form<FormData>
                onSubmit={handleSubmit}
                onError={handleError}
                schema={formSchema}
                className="flex flex-col gap-4"
            >
                <Input label="CPF" name="cpf" type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} />
                <Input label="Nome" name="nome" type="text" />
                <Select label="Opção" name="opcao" value="opcao1">
                    <option value="">Selecione uma opção</option>
                    <option value="opcao1">Opção 1</option>
                    <option value="opcao2">Opção 2</option>
                </Select>
                <Textarea label="Legenda" name="legenda" value={legenda} onChange={setLegenda} />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                    Enviar
                </button>
            </Form>
        </>
    )
}