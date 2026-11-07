"use client";

import useLoopingCarousel from "@/hooks/useLoopingCarousel";
import Image from "next/image";
import { FaUsers } from "react-icons/fa";
import { MdOutlineExplore } from "react-icons/md";
import styles from "./ExperiencesCarousel.module.css";

const experiences = [
  {
    title: "Expedições & Trilhas",
    description: "Trilhas icônicas do Litoral Norte. De passeios leves a desafios técnicos extremos em meio à Mata Atlântica.",
    image: "/images/jeep_vermelho.jpeg",
    alt: "Jeep vermelho em uma trilha junto ao rio",
    Icon: MdOutlineExplore,
  },
  {
    title: "Eventos & Encontros",
    description: "Muito mais que carros — celebramos a amizade com encontros gastronômicos e workshops técnicos.",
    image: "/images/mato.jpeg",
    alt: "Caravana de jipes em um campo cercado por montanhas",
    Icon: FaUsers,
  },
];

// Cópias nas extremidades permitem continuar o movimento sem voltar a faixa.
const slides = [...experiences, ...experiences, ...experiences];

export default function ExperiencesCarousel() {
  const carousel = useLoopingCarousel(experiences.length);
  const { position } = carousel;

  return (
    <div
      role="region"
      aria-roledescription="carrossel"
      aria-label="Nossas experiências"
      {...carousel.regionProps}
    >
      <div
        id="experiencias-slides"
        className={styles.viewport}
        aria-label="Arraste para navegar. Use as setas do teclado e espaço para pausar ou retomar."
        {...carousel.viewportProps}
      >
        <div className={styles.track} {...carousel.trackProps}>
        {slides.map(({ title, description, image, alt, Icon }, index) => (
          <article
            key={`${title}-${index}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index % experiences.length + 1} de ${experiences.length}`}
            aria-hidden={index !== position}
            inert={index !== position}
            className={styles.card}
            data-active={index === position}
          >
            <Image src={image} alt={alt} fill sizes="(max-width: 767px) 74vw, (max-width: 800px) 80vw, 640px" className="pointer-events-none object-cover" draggable={false} />
            <div className={styles.shade} />
            <span className={styles.number} aria-hidden="true">{String(index % experiences.length + 1).padStart(2, "0")}</span>
            <div className={styles.content}>
              <div className={styles.title}>
                <Icon size={24} className="shrink-0 text-yellow-400" aria-hidden="true" />
                <h3 className="text-xl font-bold md:text-2xl">{title}</h3>
              </div>
              <p className={styles.description}>{description}</p>
            </div>
          </article>
        ))}
        </div>
      </div>

    </div>
  );
}
