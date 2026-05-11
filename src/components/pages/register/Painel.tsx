import { Logo } from '@/components/common/logo';

export function Painel() {
    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between px-5 py-4 bg-[var(--blue-300)]">
                <Logo />
                <div className="text-right">
                    <p className="text-[10px] tracking-[0.15em] text-[var(--yellow-100)] uppercase">
                        Desde 09/09/1999
                    </p>
                    <p className="text-sm font-black text-[var(--white)] uppercase">
                        Jeep Club Tamoios
                    </p>
                </div>
            </div>

            {/* Left Side — desktop */}
            <div className="hidden lg:flex w-[45%] relative flex-col justify-between overflow-hidden">
                <div className="absolute inset-0 bg-[url('/images/hero-jeep.jpg')] bg-cover bg-center" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
                <div className="relative z-10 p-8">
                    <Logo className="w-16 h-16" />
                </div>
                <div className="relative z-10 p-8 pb-10">
                    <p className="text-xs tracking-[0.2em] text-[var(--yellow-100)] uppercase mb-1">
                        Desde 09/09/1999
                    </p>
                    <h2 className="text-4xl font-black text-[var(--white)] uppercase leading-tight">
                        Jeep Club<br />Tamoios
                    </h2>
                    <p className="text-sm text-[var(--transparent-white)] mt-2">
                        Jeep Club Tamoios Caraguatatuba
                    </p>
                </div>
            </div>
        </>
    );
}