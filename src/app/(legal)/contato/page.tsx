import type { Metadata } from "next";
import LegalContact from "@/components/common/legal-contact";

export const metadata: Metadata = { title: "Contato e privacidade | Jeep Clube Tamoios", description: "Atendimento, identificação do responsável pelo site e orientações para solicitações sobre seus dados pessoais." };

export default function ContactPage() {
    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <p className="text-xs font-bold uppercase tracking-widest text-j-blue-700">Jeep Clube Tamoios · Atendimento</p>
            <h1 className="text-3xl font-extrabold text-j-blue-800">Contato e privacidade</h1>
            <p className="leading-7 text-j-gray-600">Use os canais abaixo para dúvidas sobre o site, problemas de acesso, correções de cadastro, encerramento da conta ou exercício de direitos sobre dados pessoais.</p>
            <LegalContact />
            <section className="space-y-3 text-sm leading-7 text-j-gray-600">
                <h2 className="text-xl font-bold text-j-blue-800">Como fazer uma solicitação</h2>
                <p>Informe seu nome, um meio de resposta e o que deseja solicitar. Quando possível, utilize o e-mail associado à conta. Podemos pedir uma confirmação de identidade proporcional ao pedido para evitar acesso indevido aos seus dados.</p>
                <p>Não envie senhas, tokens de acesso, documentos completos ou informações médicas no primeiro contato. Se alguma informação adicional for indispensável, a administração deverá orientar um meio seguro de envio.</p>
                <p>Ao selecionar um endereço de e-mail, seu aplicativo de e-mail será aberto; o envio depende de você. Este site não disponibiliza formulário de atendimento nem protocolo automático nesta página.</p>
            </section>
        </div>
    );
}
