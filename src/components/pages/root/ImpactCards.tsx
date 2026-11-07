"use client";

import { FaGift } from "react-icons/fa";
import { MdGroups, MdVolunteerActivism } from "react-icons/md";
import useLoopingCarousel from "@/hooks/useLoopingCarousel";
import styles from "./ExperiencesCarousel.module.css";

const initiatives = [
  { Icon: MdGroups, title: "Apoio em Calamidades", text: "Logística e transporte de mantimentos em áreas isoladas por chuvas no Litoral Norte." },
  { Icon: FaGift, title: "Dia das Crianças", text: "Tradicional caravana de entrega de brinquedos e cestas básicas para comunidades." },
  { Icon: MdVolunteerActivism, title: "Doações Regulares", text: "Apoio contínuo a instituições locais de assistência social e proteção ambiental." },
];

const slides = [...initiatives, ...initiatives, ...initiatives];

function CardContent({ item }: { item: typeof initiatives[number] }) {
  const { Icon, title, text } = item;
  return (
    <>
      <div className="w-14 h-14 rounded-2xl bg-yellow-400/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        <Icon size={Icon === FaGift ? 24 : 26} className="text-yellow-400" aria-hidden="true" />
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-sm text-white/60 leading-relaxed">{text}</p>
    </>
  );
}

export default function ImpactCards() {
  const carousel = useLoopingCarousel(initiatives.length, true);

  return (
    <>
      <div className="hidden md:grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {initiatives.map((item) => (
          <div key={item.title} className="bg-white/5 rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-all group">
            <CardContent item={item} />
          </div>
        ))}
      </div>

      <div className={`md:hidden ${styles.impact}`} role="region" aria-roledescription="carrossel" aria-label="Impacto social" {...carousel.regionProps}>
        <div
          className={styles.viewport}
          aria-label="Arraste para ver outras iniciativas. Use também as setas do teclado e espaço para pausar ou retomar."
          {...carousel.viewportProps}
        >
          <div className={styles.track} {...carousel.trackProps}>
            {slides.map((item, index) => (
              <article
                key={`${item.title}-${index}`}
                className={styles.card}
                data-active={index === carousel.position}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index % initiatives.length + 1} de ${initiatives.length}`}
                aria-hidden={index !== carousel.position}
                inert={index !== carousel.position}
              >
                <CardContent item={item} />
              </article>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
