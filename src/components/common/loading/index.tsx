export default function Loading() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-slate-300"></div>
            <div className="ml-4">
                <p className="text-2xl font-bold text-gray-300 animate-bounce">Carregando...</p>
            </div>
        </div>
    );
}