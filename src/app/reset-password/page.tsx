import FormResetPassword from "@/components/pages/reset-password/form";

// Definimos o tipo indicando que searchParams agora é uma Promise
type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// 1. Adicionamos o 'async' aqui na função
export default async function ResetPasswordPage({ searchParams }: Props) {

    // 2. Fazemos o 'await' para desempacotar a Promise antes de usar
    const resolvedParams = await searchParams;

    // 3. Agora sim podemos pegar o token em segurança
    const token = resolvedParams.token as string;

    // Proteção básica: se o usuário acessar a tela sem um token na URL
    if (!token) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center p-4">
                <div className="text-white text-center">
                    <h2 className="text-xl font-bold text-red-500 mb-2">Link Inválido</h2>
                    <p>Nenhum token de recuperação foi encontrado na URL.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <FormResetPassword token={token} />
            </div>
        </main>
    );
}