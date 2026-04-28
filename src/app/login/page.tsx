import Login from "@/components/pages/login";

export default async function Page() {
    return (
        <div className="flex flex-col items-center justify-center h-dvh">
            <h1 className="text-4xl font-bold mb-4">Bem-vindo ao JeepClub Tamoios!</h1>
            <p className="text-lg text-gray-600 mb-8">Explore trilhas, compartilhe experiências e celebre a cultura dos jipes conosco.</p>
            <Login />
        </div>
    )
}