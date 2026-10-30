"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Code2, UserRound } from "lucide-react";
import developers from "../../../../public/desenvolvedores/equipe.json";
import styles from "./TeamSection.module.css";

interface Developer {
  id: string;
  nome: string;
  cargo: string;
  foto: string;
}

function tiltCard(event: PointerEvent<HTMLLIElement>) {
  if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const card = event.currentTarget;
  const bounds = card.getBoundingClientRect();
  card.style.setProperty("--tilt-x", `${-((event.clientY - bounds.top) / bounds.height - 0.5) * 12}deg`);
  card.style.setProperty("--tilt-y", `${((event.clientX - bounds.left) / bounds.width - 0.5) * 16}deg`);
}

function DeveloperCard({ developer, index }: { developer: Developer; index: number }) {
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  const photo = developer.foto.trim();
  const showPhoto = photo !== "" && failedPhoto !== photo;

  return (
    <li className={styles.item} aria-label={`${index + 1} de ${developers.length}`} onPointerMove={tiltCard} onPointerLeave={(event) => {
      event.currentTarget.style.removeProperty("--tilt-x");
      event.currentTarget.style.removeProperty("--tilt-y");
    }}>
      <article className={styles.card}>
      <div className={styles.portrait}>
        {showPhoto ? (
          <Image
            src={`/desenvolvedores/${photo}`}
            alt={`Foto de ${developer.nome}`}
            width={480}
            height={640}
            unoptimized
            className={styles.photo}
            onError={() => setFailedPhoto(photo)}
          />
        ) : (
          <div className={styles.placeholder} aria-hidden="true">
            <UserRound size={100} strokeWidth={0.8} />
            <span>Equipe Tamoios</span>
          </div>
        )}
        <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
        <span className={styles.badge}><Code2 size={14} aria-hidden="true" /> Equipe técnica</span>
      </div>
      <div className={styles.details}>
        <span className={styles.accent} aria-hidden="true" />
        <h2>{developer.nome}</h2>
        <p>{developer.cargo}</p>
      </div>
      </article>
    </li>
  );
}

export default function TeamSection() {
  const trackRef = useRef<HTMLUListElement>(null);
  const gesture = useRef<{ x: number; y: number; horizontal: boolean } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);
  const [metrics, setMetrics] = useState({ step: 0, cardWidth: 0, width: 0, maxOffset: 0 });
  const maxIndex = metrics.step ? Math.ceil(metrics.maxOffset / metrics.step) : 0;
  const index = Math.min(activeIndex, maxIndex);
  const offset = Math.min(index * metrics.step, metrics.maxOffset);
  const translatedOffset = Math.max(0, Math.min(offset - dragDistance, metrics.maxOffset));
  const first = metrics.step ? Math.max(1, Math.ceil((offset - metrics.cardWidth / 2) / metrics.step) + 1) : 1;
  const last = metrics.step ? Math.min(developers.length, Math.floor((offset + metrics.width - metrics.cardWidth / 2) / metrics.step) + 1) : 1;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    function measure() {
      if (!track) return;
      const card = track.children[0] as HTMLElement | undefined;
      if (!card) return;
      const cardWidth = card.getBoundingClientRect().width;
      const gap = parseFloat(window.getComputedStyle(track).columnGap) || 0;
      const step = cardWidth + gap;
      const width = track.clientWidth;
      setMetrics({ step, cardWidth, width, maxOffset: Math.max(0, developers.length * step - gap - width) });
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  function move(direction: number) {
    setActiveIndex((current) => Math.max(0, Math.min(Math.min(current, maxIndex) + direction, maxIndex)));
  }

  const finishGesture = useCallback((clientX: number) => {
    const start = gesture.current;
    if (!start) return;
    const distance = clientX - start.x;
    if (start.horizontal && Math.abs(distance) > 30 && metrics.step) {
      const target = Math.round((offset - distance) / metrics.step);
      setActiveIndex(Math.max(0, Math.min(target === index ? index + (distance < 0 ? 1 : -1) : target, maxIndex)));
    }
    gesture.current = null;
    setDragDistance(0);
  }, [index, maxIndex, metrics.step, offset]);

  useEffect(() => {
    const finish = (event: globalThis.PointerEvent) => finishGesture(event.clientX);
    const cancel = () => { gesture.current = null; setDragDistance(0); };
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", cancel);
    window.addEventListener("blur", cancel);
    return () => {
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", cancel);
      window.removeEventListener("blur", cancel);
    };
  }, [finishGesture]);

  return (
    <section id="equipe" aria-labelledby="equipe-titulo" aria-roledescription="carrossel" className={styles.section}>
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-6 max-w-2xl text-center md:mb-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-yellow-400">Quem faz acontecer</p>
          <h1 id="equipe-titulo" className="text-3xl font-bold tracking-tight text-white md:text-4xl">Equipe técnica</h1>
          <p className="mt-4 text-sm leading-relaxed text-gray-300 md:text-base">Conheça a equipe por trás da experiência digital do Jeep Clube Tamoios.</p>
        </div>
        <div className={styles.carousel}>
          <button type="button" onClick={() => move(-1)} disabled={index === 0} className={`${styles.arrow} ${styles.previous}`} aria-label="Ver integrante anterior" aria-controls="cartas-equipe">
            <ArrowLeft size={23} aria-hidden="true" />
          </button>
          <div
            className={styles.viewport}
            onPointerDown={(event) => {
              if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
              gesture.current = { x: event.clientX, y: event.clientY, horizontal: false };
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              const start = gesture.current;
              if (!start) return;
              const dx = event.clientX - start.x;
              const dy = event.clientY - start.y;
              if (!start.horizontal && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) start.horizontal = true;
              if (start.horizontal) setDragDistance(dx);
            }}
            onPointerUp={(event) => finishGesture(event.clientX)}
            onPointerCancel={() => { gesture.current = null; setDragDistance(0); }}
            onLostPointerCapture={() => { gesture.current = null; setDragDistance(0); }}
            onDragStart={(event) => event.preventDefault()}
          >
            <ul
              ref={trackRef}
              id="cartas-equipe"
              className={[styles.track, dragDistance !== 0 ? styles.dragging : ""].join(" ")}
              style={{ transform: "translate3d(" + -translatedOffset + "px, 0, 0)" }}
              tabIndex={0}
              aria-label="Equipe técnica. Use as setas do teclado, arraste ou deslize para navegar."
              onKeyDown={(event) => {
                if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                  event.preventDefault();
                  move(event.key === "ArrowRight" ? 1 : -1);
                }
                if (event.key === "Home" || event.key === "End") {
                  event.preventDefault();
                  setActiveIndex(event.key === "Home" ? 0 : maxIndex);
                }
              }}
            >
              {developers.map((developer, index) => <DeveloperCard key={developer.id} developer={developer} index={index} />)}
            </ul>
          </div>
          <button type="button" onClick={() => move(1)} disabled={index === maxIndex} className={`${styles.arrow} ${styles.next}`} aria-label="Ver próximo integrante" aria-controls="cartas-equipe">
            <ArrowRight size={23} aria-hidden="true" />
          </button>
          <p className={styles.status} aria-live="polite" aria-atomic="true">
            <span className="sr-only">Integrantes </span>
            <span className="text-yellow-400">{String(first).padStart(2, "0")} — {String(last).padStart(2, "0")}</span>
            <span className="mx-2 text-white/30">/</span>{developers.length}
          </p>
        </div>
      </div>
    </section>
  );
}
