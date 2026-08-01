'use client';

import FormLogin from "./form";
import { Logo } from "@/components/common/logo";
import { useModal } from "@/providers/ModalProvider";
import { JoinClubModal } from "./JoinClubModal";


export default function Login() {
    const { setContent, setOpen } = useModal();

    const handleOpenJoinClub = () => {
        setContent(<JoinClubModal />);
        setOpen();
    };

    return (
        <div className={
            `
            z-10 flex flex-col relative items-center justify-between 
            w-full max-w-150 h-full
            `
        }>
            <Logo
                className="w-40 h-40 md:w-40 md:h-40 z-10 relative top-16"
            />
            <div
                className={
                    `
                    flex md:flex-col flex-col-reverse
                    relative
                    w-full gap-10 items-center justify-between
                    p-5 pt-20 pb-20 bg-j-blue-800 md:rounded-2xl rounded-t-2xl
                    shadow-[-1px_16px_23px_1px_rgba(0,0,0,0.35)]
                    `
                }
            >
                <div className="w-full flex flex-col items-center justify-center">
                    <p className="text-j-white text-[10px] text-center md:mt-0 my-3"
                    >&copy; 2026 JEEP CLUBE TAMOIOS • OFF-ROAD</p>
                    <div className="flex">
                        <h1 className="text-3xl font-extrabold text-j-white">LOGIN</h1>
                    </div>
                </div>
                <div className="w-full flex flex-col items-center justify-between md:h-full">
                    <FormLogin />
                    <p className="text-sm text-j-transparent-white">Quer fazer parte do clube? <button type="button" onClick={handleOpenJoinClub} className="text-j-gray-200 hover:text-j-yellow-300 hover:underline transition-colors duration-300 hover:cursor-pointer">Conheça o caminho</button></p>
                </div>
            </div>
        </div>
    );
}