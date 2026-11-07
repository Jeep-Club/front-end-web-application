import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Compass, type LucideIcon } from "lucide-react";
import { GiJeep } from "react-icons/gi";

type RouteFeedbackProps = {
  icon: LucideIcon;
  statusLabel: string;
  marker: string;
  title: string;
  mobileTitle?: string;
  description: string;
  illustrationCaption: string;
  actions: ReactNode;
  children: ReactNode;
};

export default function RouteFeedback({
  icon: StatusIcon,
  statusLabel,
  marker,
  title,
  mobileTitle,
  description,
  illustrationCaption,
  actions,
  children,
}: RouteFeedbackProps) {

  return (
    <main className="relative isolate flex h-dvh min-h-dvh flex-col overflow-hidden bg-j-blue-950 text-white sm:h-auto">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,var(--blue-700),transparent_65%)] opacity-40" />

      <header className="relative mx-auto flex w-full max-w-7xl shrink-0 items-center justify-between gap-4 px-4 py-2 sm:px-8 sm:py-7 lg:px-12">
        <Link prefetch={false} href="/" aria-label="Jeep Clube Tamoios — página inicial" className="flex min-w-0 items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-j-yellow-300 sm:gap-3">
          <Image src="/images/jeepclube-emblema.png" alt="" width={64} height={60} className="h-9 w-auto shrink-0 sm:h-12" />
          <span className="text-xs font-black uppercase leading-tight tracking-wide sm:text-base">
            Jeep Clube<br /><span className="text-j-yellow-300">Tamoios</span>
          </span>
        </Link>
        <span className="hidden items-center gap-2 text-xs font-medium text-white/65 sm:inline-flex">
          <Compass size={16} aria-hidden="true" />
          A aventura continua
        </span>
      </header>

      <div className="relative mx-auto flex min-h-0 w-full max-w-7xl flex-1 items-center px-4 py-2 sm:px-8 sm:py-10 lg:px-12">
        <div className="grid h-full min-h-0 w-full min-w-0 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] items-center gap-3 sm:h-auto sm:gap-10 lg:grid-cols-2 lg:grid-rows-1 lg:gap-14">
          <section aria-labelledby="route-feedback-title" className="min-w-0">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-j-yellow-300/25 bg-j-yellow-300/10 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-j-yellow-300 sm:mb-5 sm:px-3 sm:py-2 sm:text-xs sm:tracking-[0.15em]">
              <StatusIcon size={16} aria-hidden="true" className="shrink-0" />
              {statusLabel}
            </div>

            <p aria-hidden="true" className="hidden select-none text-[clamp(5.5rem,18vw,10rem)] font-black leading-none tracking-tighter text-j-yellow-300 sm:block">
              {marker}
            </p>
            <h1 id="route-feedback-title" className="mt-0 max-w-lg text-xl font-black leading-tight tracking-tight sm:mt-4 sm:text-4xl xl:text-5xl">
              {mobileTitle ? <><span className="sm:hidden">{mobileTitle}</span><span className="hidden sm:inline">{title}</span></> : title}
            </h1>
            <p className="mt-2 max-w-md text-xs leading-5 text-white/75 sm:mt-5 sm:text-base sm:leading-7">
              {description}
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-8 sm:flex sm:flex-row sm:flex-wrap sm:gap-3">
              {actions}
            </div>

            <div className="mt-3 max-w-md border-l-2 border-j-yellow-300/50 pl-3 text-[10px] leading-4 text-white/60 sm:mt-7 sm:pl-4 sm:text-xs sm:leading-6">
              {children}
            </div>
          </section>

          <aside aria-label="Nossa aventura continua" className="relative isolate aspect-[16/9] min-h-0 overflow-hidden rounded-2xl border border-white/15 bg-j-blue-900 shadow-2xl shadow-black/20 sm:aspect-[5/4] sm:rounded-3xl lg:aspect-[4/5]">
            <Image src="/images/hero-jeep.jpg" alt="Jeep azul do clube em uma trilha de terra" fill priority sizes="(min-width: 1280px) 536px, (min-width: 1024px) 45vw, (min-width: 640px) calc(100vw - 64px), calc(100vw - 40px)" className="object-cover object-[center_60%]" />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-j-blue-950 via-j-blue-950/10 to-j-blue-950/30" />
            <div aria-hidden="true" className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-white/20 bg-j-blue-950/70 px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-widest text-white backdrop-blur-sm sm:left-7 sm:top-7 sm:px-3 sm:py-2 sm:text-[10px]">
              <GiJeep size={16} className="text-j-yellow-300 sm:size-[18px]" /> Espírito off-road
            </div>
            <div className="absolute inset-x-0 bottom-0 p-3 sm:p-8">
              <Compass size={24} aria-hidden="true" className="mb-1.5 text-j-yellow-300 sm:mb-4 sm:size-10" />
              <p className="max-w-xs text-base font-black leading-tight text-white sm:text-3xl">
                {illustrationCaption}
              </p>
              <p className="mt-1 text-[10px] leading-4 text-white/75 sm:mt-3 sm:text-sm sm:leading-5">A gente encontra o caminho de volta juntos.</p>
            </div>
          </aside>
        </div>
      </div>

      <footer className="relative mx-auto hidden w-full max-w-7xl flex-col items-center justify-between gap-2 px-5 pb-6 pt-5 text-center text-[11px] leading-5 text-white/50 sm:flex sm:flex-row sm:px-8 sm:pb-7 sm:text-left lg:px-12">
        <span>Jeep Clube Tamoios · Desde 1999</span>
        <span>Onde o asfalto termina, a vida começa.</span>
      </footer>
    </main>
  );
}
