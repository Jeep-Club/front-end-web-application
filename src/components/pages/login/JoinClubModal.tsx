'use client';

import { useRouter } from "next/navigation";
import { User, FileText, ClipboardCheck, X } from "lucide-react";
import { Button } from "@/components/common/button";
import { ButtonIcon } from "@/components/common/button";
import { useModal } from "@/providers/ModalProvider";

const steps = [
    {
        icon: User,
        title: "Seus dados",
        description: "Informe seu nome, CPF e telefone para a diretoria entrar em contato.",
    },
    {
        icon: FileText,
        title: "Carta de apresentação",
        description: "Conte sua história e por que deseja fazer parte do Jeep Clube Tamoios.",
    },
    {
        icon: ClipboardCheck,
        title: "Análise da diretoria",
        description: "A diretoria avalia o pedido e entra em contato com você.",
    },
];

export function JoinClubModal() {
    const router = useRouter();
    const { setClose } = useModal();

    const handleStart = () => {
        setClose();
        router.push("/membership/apply");
    };

    return (
        <div
            className={`
                relative w-full
                flex flex-col gap-4 md:gap-6
                p-4 md:p-8 max-h-[90dvh] overflow-y-auto overflow-x-hidden
                bg-j-blue-800 rounded-2xl
                shadow-[-1px_16px_23px_1px_rgba(0,0,0,0.35)]
                text-j-white
            `}
        >
            <ButtonIcon
                onClick={setClose}
                className="absolute top-3 right-3 md:top-4 md:right-4 text-j-transparent-white hover:text-j-yellow-300"
            >
                <X className="w-5 h-5 md:w-[22px] md:h-[22px]" />
            </ButtonIcon>

            <div className="flex flex-col gap-2 pr-6 md:pr-8">
                <h2 className="text-base md:text-2xl font-extrabold text-j-white">Quer fazer parte do clube?</h2>
                <p className="text-xs md:text-sm text-j-transparent-white">
                    Para se tornar sócio do Jeep Clube Tamoios, você envia uma solicitação de associação com as informações abaixo:
                </p>
            </div>

            <ul className="flex flex-col gap-3 md:gap-4">
                {steps.map(({ icon: Icon, title, description }) => (
                    <li key={title} className="flex gap-3 items-start">
                        <span className="shrink-0 flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-j-blue-700 text-j-yellow-300">
                            <Icon className="w-4 h-4 md:w-5 md:h-5" />
                        </span>
                        <div className="flex flex-col">
                            <p className="font-bold text-j-white text-xs md:text-sm">{title}</p>
                            <p className="text-xs md:text-sm text-j-transparent-white">{description}</p>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="flex gap-3 items-start p-3 rounded-lg bg-j-blue-900/60">
                <ClipboardCheck className="w-4 h-4 md:w-5 md:h-5 shrink-0 mt-0.5 text-j-yellow-300" />
                <p className="text-xs md:text-sm text-j-transparent-white">
                    Nossa diretoria analisa cada solicitação com atenção. Se o seu pedido for aprovado, entraremos em contato para efetivar sua inscrição no clube.
                </p>
            </div>

            <div className="flex md:flex-row flex-col gap-3 mt-2">
                <Button onClick={handleStart} className="w-full">
                    Iniciar solicitação
                </Button>
                <Button
                    onClick={setClose}
                    className="w-full bg-transparent border-2 border-j-transparent-white text-j-white hover:bg-j-transparent-white/10 hover:text-j-white"
                >
                    Agora não
                </Button>
            </div>
        </div>
    );
}

export default JoinClubModal;
