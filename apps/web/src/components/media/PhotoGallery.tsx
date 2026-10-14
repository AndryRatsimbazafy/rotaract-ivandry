"use client";

import Image from "next/image";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import styles from "./PhotoGallery.module.css";

/** Une photographie telle que la galerie l'affiche, textes déjà résolus. */
export interface GalleryPhoto {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
  /** Crédit déjà mis en forme (« Photo : Rova R. »). */
  credit?: string;
  /** `"fr"` quand le texte est affiché en français sur une page anglaise. */
  altLang?: "fr";
  captionLang?: "fr";
}

export interface GalleryLabels {
  dialog: string;
  previous: string;
  next: string;
  close: string;
  /** Gabarit : {n} et {total} sont remplacés. */
  announce: string;
}

type Open = (index: number, opener: HTMLElement) => void;

const GalleryContext = createContext<Open | null>(null);

function fill(template: string, n: number, total: number): string {
  return template.replace("{n}", String(n)).replace("{total}", String(total));
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Galerie plein écran (DESIGN.md, section 9). Le dialogue natif retient le
 * focus et rend le fond inerte ; la piste est un défilement accroché, donc le
 * balayage est celui du système. Le retour du navigateur ferme la galerie.
 */
export function PhotoGallery({
  photos,
  labels,
  children,
}: {
  photos: GalleryPhoto[];
  labels: GalleryLabels;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  // Vrai tant qu'une entrée d'historique a été ajoutée à l'ouverture.
  const pushedRef = useRef(false);
  const [index, setIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const total = photos.length;

  const scrollTo = useCallback((target: number, smooth: boolean) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({
      left: target * track.clientWidth,
      behavior: smooth && !prefersReducedMotion() ? "smooth" : "instant",
    });
  }, []);

  const open = useCallback<Open>(
    (target, opener) => {
      const dialog = dialogRef.current;
      if (!dialog || dialog.open) return;
      openerRef.current = opener;
      setIndex(target);
      setIsOpen(true);
      dialog.showModal();
      history.pushState({ gallery: true }, "");
      pushedRef.current = true;
      // La piste a sa largeur une fois le dialogue affiché.
      requestAnimationFrame(() => scrollTo(target, false));
    },
    [scrollTo],
  );

  // Retour du navigateur : ferme la galerie sans quitter la page.
  useEffect(() => {
    const onPopState = () => {
      if (!dialogRef.current?.open) return;
      pushedRef.current = false;
      dialogRef.current.close();
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Position courante : la diapositive la plus visible de la piste.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || !isOpen) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIndex(Number((entry.target as HTMLElement).dataset.index));
          }
        }
      },
      { root: track, threshold: 0.6 },
    );
    track.querySelectorAll("[data-index]").forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, [isOpen]);

  // Échap, « Fermer » ou retour du navigateur : le focus revient à la photographie.
  const onClose = () => {
    setIsOpen(false);
    openerRef.current?.focus();
    if (pushedRef.current) {
      pushedRef.current = false;
      history.back();
    }
  };

  const go = (step: number) => {
    const target = Math.min(total - 1, Math.max(0, index + step));
    if (target !== index) scrollTo(target, true);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    }
  };

  const several = total > 1;

  return (
    <GalleryContext.Provider value={open}>
      {children}
      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-label={labels.dialog}
        onClose={onClose}
        onKeyDown={onKeyDown}
      >
        <div className={styles.bar}>
          {several ? (
            <p className={styles.position} aria-hidden="true">
              {index + 1} / {total}
            </p>
          ) : (
            <span />
          )}
          <button
            type="button"
            className={styles.close}
            onClick={() => dialogRef.current?.close()}
          >
            {labels.close}
          </button>
        </div>

        <ul ref={trackRef} className={styles.track}>
          {photos.map((photo, slide) => (
            <li
              key={`${photo.src}-${slide}`}
              className={styles.slide}
              data-index={slide}
              aria-hidden={slide === index ? undefined : true}
            >
              <div className={styles.media}>
                {isOpen ? (
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    lang={photo.altLang}
                    width={photo.width}
                    height={photo.height}
                    sizes="100vw"
                    loading={Math.abs(slide - index) <= 1 ? "eager" : "lazy"}
                    className={styles.image}
                  />
                ) : null}
              </div>
              {photo.caption || photo.credit ? (
                <p className={styles.caption}>
                  {photo.caption ? <span lang={photo.captionLang}>{photo.caption}</span> : null}
                  {photo.credit ? `${photo.caption ? " " : ""}${photo.credit}` : null}
                </p>
              ) : null}
            </li>
          ))}
        </ul>

        {several ? (
          <>
            <button
              type="button"
              className={`${styles.step} ${styles.previous}`}
              aria-label={labels.previous}
              disabled={index === 0}
              onClick={() => go(-1)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.arrow}>
                <path d="M15 5 8 12l7 7" />
              </svg>
            </button>
            <button
              type="button"
              className={`${styles.step} ${styles.next}`}
              aria-label={labels.next}
              disabled={index === total - 1}
              onClick={() => go(1)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.arrow}>
                <path d="m9 5 7 7-7 7" />
              </svg>
            </button>
          </>
        ) : null}

        <p className={styles.hidden} aria-live="polite">
          {isOpen && several ? fill(labels.announce, index + 1, total) : ""}
        </p>
      </dialog>
    </GalleryContext.Provider>
  );
}

/**
 * Bouton qui couvre une photographie de la page et l'ouvre dans la galerie.
 * Il se place dans le cadre de la photographie (`PhotoFrame`, `children`).
 */
export function GalleryTrigger({ index, label }: { index: number; label: string }) {
  const open = useContext(GalleryContext);
  if (!open) return null;
  return (
    <button
      type="button"
      className={styles.trigger}
      aria-label={label}
      aria-haspopup="dialog"
      onClick={(event) => open(index, event.currentTarget)}
    />
  );
}
