export default async function Page() {
    return (
        <div className="flex flex-col items-center justify-center h-screen px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Cadastro - JeepClub Tamoios</h1>
            <p className="text-lg text-gray-600 mb-8">
                Crie sua conta para explorar trilhas, compartilhar experiências e celebrar a cultura dos jipes conosco.
            </p>
            
            <a 
                href="/auth/register" 
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
                Criar minha conta
            </a>

            <p className="mt-6 text-sm text-gray-500">
                Já tem uma conta? <a href="/auth/login" className="text-blue-600 hover:underline">Entre aqui</a>
            </p>
        </div>
    )
}