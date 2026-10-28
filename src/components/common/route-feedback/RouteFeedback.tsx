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
  description,
  illustrationCaption,
  actions,
  children,
}: RouteFeedbackProps) {

  return (
    <main className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-j-blue-950 text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,var(--blue-700),transparent_65%)] opacity-40" />

      <header className="relative mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8 sm:py-7 lg:px-12">
        <Link prefetch={false} href="/" aria-label="Jeep Clube Tamoios — página inicial" className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-j-yellow-300">
          <Image src="/images/jeepclube-emblema.png" alt="" width={64} height={60} className="h-12 w-auto shrink-0 sm:h-15" />
          <span className="text-sm font-black uppercase leading-tight tracking-wide sm:text-base">
            Jeep Clube<br /><span className="text-j-yellow-300">Tamoios</span>
          </span>
        </Link>
        <span className="hidden items-center gap-2 text-xs font-medium text-white/65 sm:inline-flex">
          <Compass size={16} aria-hidden="true" />
          A aventura continua
        </span>
      </header>

      <div className="relative mx-auto flex w-full max-w-7xl flex-1 items-center px-5 py-6 sm:px-8 sm:py-10 lg:px-12">
        <div className="grid w-full min-w-0 items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <section aria-labelledby="route-feedback-title" className="min-w-0">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-j-yellow-300/25 bg-j-yellow-300/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.15em] text-j-yellow-300 sm:text-xs">
              <StatusIcon size={16} aria-hidden="true" className="shrink-0" />
              {statusLabel}
            </div>

            <p aria-hidden="true" className="select-none text-[clamp(5.5rem,18vw,10rem)] font-black leading-none tracking-tighter text-j-yellow-300">
              {marker}
            </p>
            <h1 id="route-feedback-title" className="mt-4 max-w-lg text-3xl font-black leading-tight tracking-tight sm:text-4xl xl:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/75 sm:text-base">
              {description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {actions}
            </div>

            <div className="mt-7 max-w-md border-l-2 border-j-yellow-300/50 pl-4 text-xs leading-6 text-white/60">
              {children}
            </div>
          </section>

          <aside aria-label="Nossa aventura continua" className="relative isolate aspect-square overflow-hidden rounded-3xl border border-white/15 bg-j-blue-900 shadow-2xl shadow-black/20 sm:aspect-[5/4] lg:aspect-[4/5]">
            <Image src="/images/hero-jeep.jpg" alt="Jeep azul do clube em uma trilha de terra" fill priority sizes="(min-width: 1280px) 536px, (min-width: 1024px) 45vw, (min-width: 640px) calc(100vw - 64px), calc(100vw - 40px)" className="object-cover object-[center_60%]" />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-j-blue-950 via-j-blue-950/10 to-j-blue-950/30" />
            <div aria-hidden="true" className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/20 bg-j-blue-950/70 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm sm:left-7 sm:top-7">
              <GiJeep size={18} className="text-j-yellow-300" /> Espírito off-road
            </div>
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <Compass size={32} aria-hidden="true" className="mb-3 text-j-yellow-300 sm:mb-4 sm:size-10" />
              <p className="max-w-xs text-xl font-black leading-tight text-white sm:text-3xl">
                {illustrationCaption}
              </p>
              <p className="mt-3 text-xs leading-5 text-white/75 sm:text-sm">A gente encontra o caminho de volta juntos.</p>
            </div>
          </aside>
        </div>
      </div>

      <footer className="relative mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-5 pb-6 pt-5 text-center text-[11px] leading-5 text-white/50 sm:flex-row sm:px-8 sm:pb-7 sm:text-left lg:px-12">
        <span>Jeep Clube Tamoios · Desde 1999</span>
        <span>Onde o asfalto termina, a vida começa.</span>
      </footer>
    </main>
  );
}
