'use client';



import { useRouter } from "next/navigation";
import { useMutation } from '@tanstack/react-query';
import loginAction from '@/actions/login';
import toast from "react-hot-toast";

export default function Login() {
    const router = useRouter();

    const mutation = useMutation({ 
        mutationFn: loginAction, 
        onSuccess: () => {router.push("/home"); toast.success('Login realizado com sucesso!');}, 
        onError: (error) => toast.error(error.message || 'Erro ao realizar login. Verifique suas credenciais e tente novamente.') 
    });

    const isLoading = mutation.isPending;

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const cpf = formData.get('cpf')?.toString() || '';
        const password = formData.get('password')?.toString() || '';
        if(!cpf || !password) {
            toast.error('Por favor, preencha todos os campos.');
            return;
        }
        mutation.mutateAsync({ cpf, password });
    }

    return (
        <div className="flex flex-col items-center justify-center gap-5 p-5 bg-zinc-50 font-sans border border-zinc-200 rounded-2xl dark:bg-black">
            <h1>Login</h1>
            <form className="flex flex-col items-center justify-center gap-5" onSubmit={handleSubmit}>
                <input required type="text" name="cpf" placeholder="CPF" className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-50" />
                <input required type="password" name="password" placeholder="Password" className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-50" />
                <span className="text-sm text-zinc-400 hover:underline hover:text-zinc-200 self-end hover:cursor-pointer"
                    onClick={() => router.push('/forgot-password')}
                >Esqueci minha senha</span>
                <button 
                type="submit" 
                className="button w-full"
                disabled={isLoading}
                >
                    {isLoading ? 'Entrando...' : 'Entrar'}
                </button>
            </form>
            <p className="text-sm text-zinc-400">Não tem uma conta? <span className="text-zinc-200 hover:underline hover:cursor-pointer" onClick={() => router.push('/register')}>Registrar</span></p>
        </div>
    );
}