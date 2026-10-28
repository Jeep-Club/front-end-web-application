import { Logo } from '@/components/common/logo';

interface ClubFormHeaderProps {
    title: string;
    description: string;
}

export default function ClubFormHeader({ title, description }: ClubFormHeaderProps) {
    return (
        <header className="flex w-full flex-col items-center px-5 pt-6 pb-4 text-center text-white sm:px-8">
            <Logo className="mb-3 h-24 w-24 shrink-0 sm:h-28 sm:w-28" />
            <h1 className="flex min-h-14 items-center justify-center text-xl leading-7 font-extrabold sm:min-h-8 sm:text-2xl sm:leading-8">{title}</h1>
            <p className="mt-2 min-h-15 max-w-xl text-xs leading-5 text-white/80 sm:min-h-10 sm:text-sm">{description}</p>
        </header>
    );
}
