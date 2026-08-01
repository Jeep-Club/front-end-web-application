import ForgotPassword from "@/components/pages/forgot-password";
import TireBrand from "@/components/common/patterns/tire-brand-pattener";

export default function ForgotPasswordPage() {
    return (
        <div className="w-full flex flex-col items-center justify-center min-h-dvh bg-j-blue-500 p-5">
            <ForgotPassword />
            <div className="fixed top-0 left-0 bottom-0 right-0 overflow-hidden flex items-center">
                <div className="flex items-center md:w-[200%] w-500 h-full">
                    <TireBrand className="fill-j-transparent-black md:rotate-30 rotate-60 m-auto relative md:-left-80 -left-150 md:top-60 md:h-full top-0 transition-all duration-300"/>
                </div>
            </div>
        </div>
    );
}