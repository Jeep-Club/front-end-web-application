"use client";

import { useEffect, useId, useRef, useState } from "react";
import toast from "react-hot-toast";
import { CardExportActions, type CardExportRequest } from "@/components/common/card-export/CardExportActions";
import { captureCardElement, exportCardAsPng } from "@/utils/card-export/exportCard";
import { buildAndSaveMembershipCardPdf } from "@/utils/card-export/buildMembershipCardPdf";
import { maskCPF, maskDate, maskPhoneNumber } from "@/utils/masks";

interface MembershipCardProps {
    profilePhotoUrl?: string | null;
    fullName?: string | null;
    cpf?: string | null;
    birthDate?: string | null;
    memberSince?: string | null;
    phoneNumber?: string | null;
    roleLabel?: string | null;
    registrationNumber?: string | null;
    bloodType?: string | null;
    exportFileName?: string;
}

type CardSide = "front" | "back";
const NAVY = "#0c1f4c";
const GOLD = "#fed01b";
const MUTED = "#758099";
const value = (text?: string | null) => text?.trim() || "Não informado";

function registration(value?: string | null) {
    const digits = value?.replace(/\D/g, "");
    if (!digits) return value || "-";
    const padded = digits.padStart(5, "0");
    return `${padded.slice(0, -1)}-${padded.slice(-1)}`;
}

/** Embed the same image bytes in every face, including exported SVG captures. */
function useCardImage(source?: string | null) {
    const [image, setImage] = useState<{ source?: string | null; data?: string; error?: boolean }>({});
    useEffect(() => {
        if (!source) return;
        const controller = new AbortController();
        fetch(source, { signal: controller.signal }).then((response) => {
            if (!response.ok) throw new Error("Imagem indisponível");
            return response.blob();
        }).then((blob) => new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        })).then((data) => {
            if (!controller.signal.aborted) setImage({ source, data });
        }).catch(() => {
            if (!controller.signal.aborted) setImage({ source, error: true });
        });
        return () => controller.abort();
    }, [source]);
    return { data: image.source === source ? image.data : undefined, ready: !source || image.source === source, error: image.source === source && image.error };
}

function Field({ x, y, label, text, width = 262 }: { x: number; y: number; label: string; text?: string | null; width?: number }) {
    const displayed = value(text);
    return <g>
        <text x={x} y={y} fill={MUTED} fontSize="12" fontWeight="700" letterSpacing="1.5">{label.toUpperCase()}</text>
        <text x={x} y={y + 31} fill={NAVY} fontSize={displayed.length > 23 ? 20 : 25} fontWeight="700">{displayed}</text>
        <line x1={x} y1={y + 48} x2={x + width} y2={y + 48} stroke={NAVY} strokeWidth="2.5" strokeLinecap="round" />
    </g>;
}

function nameLines(name: string, length: number) {
    const lines: string[] = [];
    for (const word of name.split(/\s+/)) {
        const last = lines.length - 1;
        if (last >= 0 && lines[last].length + word.length + 1 <= length) lines[last] += ` ${word}`;
        else if (word.length <= length) lines.push(word);
        else for (let start = 0; start < word.length; start += length) lines.push(word.slice(start, start + length));
    }
    return lines;
}

/** One SVG layout shared by the responsive preview and both export formats. */
function CardFace({ side, data, logo, photo }: { side: CardSide; data: MembershipCardProps; logo?: string; photo?: string }) {
    const id = useId().replace(/:/g, "");
    const name = value(data.fullName);
    const longName = name.length > 68;
    const lines = nameLines(name, longName ? 42 : 32);
    const compactName = lines.length >= 3;
    const nameBaseline = lines.length >= 4 ? 190 : 202;
    const nameLineHeight = compactName ? 20 : 31;
    const nameUnderline = nameBaseline + (lines.length - 1) * nameLineHeight + 18;
    const firstFieldY = nameUnderline + (compactName ? 26 : 34);
    const secondFieldY = firstFieldY + 86;
    return <div data-card-side={side} className="aspect-[856/540] w-full overflow-hidden bg-white shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 856 540" className="block h-full w-full" role="img" aria-label={`${side === "front" ? "Frente" : "Verso"} da carteirinha de ${name}`} fontFamily="Arial, Helvetica, sans-serif">
            <defs><clipPath id={`${id}-frame`}><rect width="856" height="540" /></clipPath><clipPath id={`${id}-photo`}><rect x="36" y="151" width="160" height="260" rx="12" /></clipPath></defs>
            <g clipPath={`url(#${id}-frame)`}>
                <rect width="856" height="540" fill={side === "front" ? "#ffffff" : NAVY} />
                {side === "front" ? <>
                    <rect width="856" height="112" fill={NAVY} />
                    <rect y="112" width="856" height="5" fill={GOLD} />
                    <circle cx="73" cy="56" r="46" fill={NAVY} stroke={GOLD} strokeWidth="3" />
                    {logo && <image href={logo} x="29" y="12" width="88" height="88" />}
                    <text x="140" y="43" fill={GOLD} fontSize="14" letterSpacing="3" fontWeight="700">JEEP CLUBE TAMOIOS</text>
                    <text x="140" y="80" fill="#ffffff" fontSize="28" fontWeight="700">CARTEIRA DE ASSOCIADO</text>
                    <rect x="36" y="151" width="160" height="260" rx="12" fill="#edf1f7" stroke={NAVY} strokeWidth="3" />
                    {photo ? <image href={photo} x="36" y="151" width="160" height="260" preserveAspectRatio="xMidYMid slice" clipPath={`url(#${id}-photo)`} /> : <g fill="none" stroke="#a5b3cb" strokeWidth="8"><circle cx="116" cy="253" r="30" /><path d="M65 337c0-60 102-60 102 0" strokeLinecap="round" /></g>}
                    <text x="230" y="170" fill={MUTED} fontSize="12" fontWeight="700" letterSpacing="1.5">NOME DO ASSOCIADO</text>
                    <text x="230" y={nameBaseline} fill={NAVY} fontSize={compactName ? 20 : longName ? 25 : 31} fontWeight="700">{lines.map((line, index) => <tspan key={index} x="230" dy={index === 0 ? 0 : nameLineHeight}>{line}</tspan>)}</text>
                    <line x1="230" y1={nameUnderline} x2="820" y2={nameUnderline} stroke={NAVY} strokeWidth="3" strokeLinecap="round" />
                    <Field x={230} y={firstFieldY} label="CPF" text={data.cpf ? maskCPF(data.cpf) : null} />
                    <Field x={558} y={firstFieldY} label="Nascimento" text={maskDate(data.birthDate, { includeTime: false })} />
                    <Field x={230} y={secondFieldY} label="Telefone" text={data.phoneNumber ? maskPhoneNumber(data.phoneNumber) : null} />
                    <Field x={558} y={secondFieldY} label="Categoria" text={data.roleLabel || "Associado"} />
                    <line x1="36" y1="435" x2="196" y2="435" stroke={GOLD} strokeWidth="6" />
                    <text x="36" y="455" fill={MUTED} fontSize="11" letterSpacing="1.5" fontWeight="700">MATRÍCULA</text>
                    <text x="36" y="481" fill={NAVY} fontSize="24" fontWeight="700">{registration(data.registrationNumber)}</text>
                    <g>
                        <rect x="558" y="435" width="262" height="61" rx="10" fill="#fff5f5" stroke="#dc2626" strokeWidth="2.5" />
                        <text x="689" y="455" textAnchor="middle" fill="#b91c1c" fontSize="10" fontWeight="700" letterSpacing="1.2">TIPO SANGUÍNEO</text>
                        <text x="689" y="481" textAnchor="middle" fill={NAVY} fontSize={data.bloodType ? 25 : 16} fontWeight="700">{value(data.bloodType)}</text>
                    </g>
                    <rect y="506" width="856" height="34" fill={NAVY} />
                    <text x="428" y="528" fill="#ffffff" fontSize="11" textAnchor="middle" letterSpacing="2">USO PESSOAL E INTRANSFERÍVEL</text>
                </> : <>
                    <circle cx="80" cy="76" r="51" fill={NAVY} stroke={GOLD} strokeWidth="3" />
                    {logo && <image href={logo} x="32" y="28" width="96" height="96" />}
                    <text x="154" y="66" fill="#ffffff" fontSize="29" fontWeight="700">JEEP CLUBE TAMOIOS</text>
                    <text x="154" y="96" fill={GOLD} fontSize="13" letterSpacing="2">OFF-ROAD · AMIZADE · AVENTURA</text>
                    <rect x="32" y="148" width="792" height="294" rx="18" fill="#ffffff" />
                    <rect x="407" y="174" width="42" height="4" fill={GOLD} />
                    <text x="428" y="211" textAnchor="middle" fill={NAVY} fontSize="20" fontWeight="700">Informações do associado</text>
                    <text x="428" y="254" textAnchor="middle" fill={MUTED} fontSize="12" fontWeight="700" letterSpacing="1.5">MEMBRO DESDE</text>
                    <text x="428" y="286" textAnchor="middle" fill={NAVY} fontSize="27" fontWeight="700">{value(maskDate(data.memberSince, { includeTime: false }))}</text>
                    <line x1="298" y1="304" x2="558" y2="304" stroke={NAVY} strokeWidth="2.5" strokeLinecap="round" />
                    <text x="428" y="353" textAnchor="middle" fill={NAVY} fontSize="16">Esta carteira é de uso exclusivo do associado identificado na frente.</text>
                    <text x="428" y="387" textAnchor="middle" fill={MUTED} fontSize="15">Documento de uso pessoal e intransferível.</text>
                    <text x="32" y="490" fill="#ffffff" fontSize="16">Caraguatatuba · São Paulo</text>
                    <text x="824" y="490" fill={GOLD} textAnchor="end" fontSize="13" letterSpacing="2">DESDE 09/09/1999</text>
                    <rect y="532" width="856" height="8" fill={GOLD} />
                </>}
            </g>
        </svg>
    </div>;
}

export function MembershipCard(props: MembershipCardProps) {
    const [side, setSide] = useState<CardSide>("front");
    const exportFaces = useRef<HTMLDivElement>(null);
    const logo = useCardImage("/images/jeepclube-emblema.png");
    const photo = useCardImage(props.profilePhotoUrl);
    const handleExport = async ({ format, scope }: CardExportRequest) => {
        try {
            if (logo.error) throw new Error("O logotipo não carregou. Atualize a página e tente novamente.");
            if (photo.error) throw new Error("A foto não carregou. Atualize a página e tente novamente.");
            const front = exportFaces.current?.querySelector<HTMLElement>('[data-card-side="front"]');
            const back = exportFaces.current?.querySelector<HTMLElement>('[data-card-side="back"]');
            if (!front || !back) throw new Error("Não foi possível preparar a carteirinha.");
            const frontImage = await captureCardElement(front);
            const backImage = scope === "front-and-back" ? await captureCardElement(back) : undefined;
            const fileName = props.exportFileName || `carteirinha-${props.registrationNumber || "associado"}`;
            if (format === "pdf") await buildAndSaveMembershipCardPdf({ scope, frontImage, backImage, fileName });
            else await exportCardAsPng({ scope, frontImage, backImage, fileName });
            toast.success("Carteirinha exportada com sucesso!");
        } catch (error) { toast.error(error instanceof Error ? error.message : "Erro ao exportar a carteirinha."); }
    };
    return <section className="flex w-full flex-col overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-j-gray-200 px-5 py-4">
            <div><h2 className="text-sm font-extrabold text-j-blue-800">Carteirinha digital</h2><p className="mt-1 text-[11px] text-j-gray-500">85,6 × 53,98 mm · Frente e verso</p></div>
            <div className="grid w-full grid-cols-2 gap-1 rounded-lg bg-j-gray-100 p-1 sm:w-auto" aria-label="Selecionar lado da carteirinha">{(["front", "back"] as const).map((option) => <button key={option} type="button" aria-pressed={side === option} aria-label={`Visualizar ${option === "front" ? "frente" : "verso"}`} onClick={() => setSide(option)} className={`rounded-md px-4 py-2 text-xs font-bold ${side === option ? "bg-j-blue-800 text-white" : "text-j-gray-600"}`}>{option === "front" ? "Frente" : "Verso"}</button>)}</div>
        </header>
        <div className="flex flex-col gap-4 p-4 sm:p-5">
            <div className="mx-auto w-full max-w-[720px]"><CardFace side={side} data={props} logo={logo.data} photo={photo.data} /></div>
            <CardExportActions onExport={handleExport} disabled={!logo.ready || !photo.ready} className="mx-auto w-full max-w-[720px]" />
        </div>
        <div ref={exportFaces} aria-hidden="true" style={{ position: "fixed", left: "-10000px", top: 0, width: 856, pointerEvents: "none" }}><CardFace side="front" data={props} logo={logo.data} photo={photo.data} /><CardFace side="back" data={props} logo={logo.data} photo={photo.data} /></div>
    </section>;
}

export default MembershipCard;
