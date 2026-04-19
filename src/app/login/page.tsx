export default async function Page() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl font-bold mb-4">Bem-vindo ao JeepClub Tamoios!</h1>
            <p className="text-lg text-gray-600 mb-8">Explore trilhas, compartilhe experiências e celebre a cultura dos jipes conosco.</p>
            <a href="/auth/login" className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">Entrar</a>
        </div>
    )
}