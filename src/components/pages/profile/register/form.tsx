'use client';

import { Button } from "@/components/common/button";
import { Form } from "@/components/common/form";
import { InputCPF,InputDate,InputEmail,InputFile,InputPassword,InputPhoneNumber,InputRegister } from "@/components/common/input/import";
import { Select } from "@/components/common/select/";
import Link from "next/link";
import { Textarea } from "@/components/common/textarea/";
import { registerRequestSchema } from "@/schemas/auth/register/registerRequest";
import { registerAction } from '@/server/actions/auth/registerAction';
import { useMutation } from '@tanstack/react-query';
import { ArrowRight,LoaderCircle,User } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function FormRegister() {
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: registerAction,
        onSuccess: (data) => {
            console.log(data);
            router.push("/feed");
            toast.success('Registro realizado com sucesso!');
        },
    });

    const isLoading = mutation.isPending;

    const handleSubmit = async (registerRequest: RegisterRequest) => {
        mutation.mutateAsync(registerRequest);
    }

    return (
        <div className="w-full flex flex-col items-center justify-center gap-5 p-5">
            <Form<RegisterRequest>
                schema={registerRequestSchema}
                onSubmit={handleSubmit}
                onError={(errors) => console.log(errors)}
            >
                <InputRegister name="name" label="Nome Completo" placeholder="Nome e sobrenome" type="text" required className="pl-10 pr-10"><User className="absolute left-2.5 text-j-transparent-white"/></InputRegister>
                <InputEmail required/>
                <InputDate name="birthDate" required/>
                <InputCPF required/>
                <InputPhoneNumber required/>
                <InputPassword required name="password" stepErrors/>
                <InputFile name="test1" multiple maxFiles={2} isFallback label="Arquivos"/>
                <InputFile.Image name="test2" label="Foto de perfil"/>
                <InputFile.Image2 name="test3" label="Foto de perfil"/>
                <Textarea label="Textarea" name="test4"/>
                <Select label="Select exemplo" name="test5" >
                    <option value="none" defaultChecked hidden>Selecione uma fruta</option>
                    <option value="uva">Uva</option>
                    <option value="abacate">Abacate</option>
                    <option value="morango">Morango</option>
                </Select>
                <p className="text-left text-xs leading-6 text-j-gray-600">
                    Os dados de identificação e contato são utilizados para criar e administrar sua conta.
                    Consulte os <Link href="/termos-de-uso" target="_blank" rel="noopener noreferrer" className="text-j-blue-700 underline underline-offset-4">Termos de Uso (abre em nova aba)</Link> e a <Link href="/politica-de-privacidade" target="_blank" rel="noopener noreferrer" className="text-j-blue-700 underline underline-offset-4">Política de Privacidade</Link>.
                </p>
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-4"
                >
                    {isLoading ? <>Registrando<LoaderCircle size={15} strokeWidth={3} className="animate-spin"/></> : <>Registrar<ArrowRight size={15} strokeWidth={3}/></>}
                </Button>
            </Form>
        </div>
    );
}
