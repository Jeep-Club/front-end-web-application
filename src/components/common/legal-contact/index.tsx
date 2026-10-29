import Link from "next/link";
import { getLegalContact } from "@/config/legal";

export default function LegalContact() {
    const contact = getLegalContact();

    return (
        <div className="space-y-3 rounded-2xl border border-j-gray-200 bg-j-gray-100 p-5 text-sm leading-7 text-j-gray-600">
            <p><strong>Site:</strong> Jeep Clube Tamoios.</p>
            <p><strong>Responsável pelo tratamento (controlador):</strong> {contact.controllerName || "identificação formal ainda não informada pela administração do clube."}</p>
            {contact.controllerDocument && <p><strong>CNPJ ou identificação:</strong> {contact.controllerDocument}</p>}
            {contact.controllerAddress && <p><strong>Endereço:</strong> {contact.controllerAddress}</p>}
            {contact.privacyEmail ? (
                <p><strong>Privacidade e direitos sobre dados:</strong> <a className="break-all font-medium text-j-blue-700 underline underline-offset-4" href={`mailto:${contact.privacyEmail}`}>{contact.privacyEmail}</a></p>
            ) : (
                <p><strong>Canal de privacidade:</strong> ainda não informado. Enquanto ele não estiver disponível, procure a diretoria pelos canais que você já utiliza com o clube. Esta página não recebe nem envia solicitações.</p>
            )}
            {contact.supportEmail && <p><strong>Atendimento:</strong> <a className="break-all font-medium text-j-blue-700 underline underline-offset-4" href={`mailto:${contact.supportEmail}`}>{contact.supportEmail}</a></p>}
            {(!contact.controllerName || !contact.privacyEmail || !contact.controllerAddress) && (
                <p className="border-t border-j-gray-300 pt-3">As informações de identificação e contato desta página ainda estão incompletas. Consulte a administração antes de enviar novos dados pessoais, especialmente informações de saúde ou de menores de idade.</p>
            )}
            <p>Veja como exercer seus direitos na <Link href="/politica-de-privacidade#direitos" className="font-medium text-j-blue-700 underline underline-offset-4">Política de Privacidade</Link>.</p>
        </div>
    );
}
