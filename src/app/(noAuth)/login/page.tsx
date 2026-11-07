import Login from "@/components/pages/login";
import ClubBackground from "@/components/common/ClubBackground";

export default async function Page() {
    return (
        <div className="relative isolate flex min-h-dvh w-full flex-col items-center bg-[#0e0e0e] px-4 py-8 sm:px-6 sm:py-12">
            <ClubBackground />
            <Login />
        </div>
    )
}
