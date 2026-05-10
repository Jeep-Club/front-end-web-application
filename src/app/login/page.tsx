import Login from "@/components/pages/login";
import TireBrand from "@/components/pages/login/tire-brand-pattener";

export default async function Page() {
    return (
        <div className="w-full flex flex-col items-center md:justify-center justify-end min-h-dvh bg-j-blue-500 md:p-5 pt-5 pl-5 pr-5">
            {/* <h1 className="text-4xl font-bold mb-4">Bem-vindo ao JeepClub Tamoios!</h1>
            <p className="text-lg text-gray-600 mb-8">Explore trilhas, compartilhe experiências e celebre a cultura dos jipes conosco.</p> */}
            <Login />
            <div className="fixed top-0 left-0 bottom-0 right-0 overflow-hidden flex items-center">
                <div className="flex items-center md:w-[200%] w-500 h-full">
                    <TireBrand className="fill-j-transparent-black md:rotate-30 rotate-60 m-auto relative md:-left-80 -left-150 md:top-60 md:h-full top-0 transition-all duration-300"/>
                </div>
            </div>
        </div>
    )
}