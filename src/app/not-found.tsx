import Link from "next/link";

export default function NotFound() {
    return (
        <div className="w-full h-screen flex flex-col items-center justify-center gap-8">
            <h1 className="text-4xl font-bold">404 - Página Não Encontrada</h1>
            <Link href="/" className="button">Voltar para o Início</Link>
        </div>
    );
}