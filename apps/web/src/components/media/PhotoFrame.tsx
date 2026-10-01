import Image from "next/image";
import { photoPendingLabel } from "@/content/home";
import type { Photo } from "@/types/media";
import styles from "./PhotoFrame.module.css";

interface PhotoFrameProps {
  photo?: Photo;
  /** Décrit la photographie attendue, affiché tant qu'elle n'est pas fournie. */
  brief: string;
  /** Format attendu, par exemple « 4:5 ». */
  format: string;
  /** Largeurs d'affichage, pour servir un fichier à la bonne taille. */
  sizes: string;
  priority?: boolean;
  /** Fond du gabarit sans photographie : brume, blanc (sur le fond de page) ou encre. */
  tone?: "light" | "paper" | "dark";
  /** Petit cadre : sans photographie, seuls l'aplat et les repères restent. */
  compact?: boolean;
  /** Voile uni, pour une photographie qui porte un titre. */
  veiled?: boolean;
  /** Fixe le ratio du cadre. */
  className?: string;
}

/**
 * Cadre d'une photographie. Sans photographie, il affiche un gabarit de mise
 * en page (repères de cadrage, format attendu) : jamais une image de remplacement.
 */
export function PhotoFrame({
  photo,
  brief,
  format,
  sizes,
  priority,
  tone = "light",
  compact,
  veiled,
  className,
}: PhotoFrameProps) {
  const frameClass = className ? `${styles.frame} ${className}` : styles.frame;

  if (!photo) {
    return (
      <div
        className={`${frameClass} ${styles.template} ${styles[tone]}`}
        aria-hidden={compact ? "true" : undefined}
      >
        {compact ? null : (
          <>
            <p className={styles.brief}>
              <span className="label">{photoPendingLabel}</span>
              <span>{brief}</span>
            </p>
            <span className={styles.format} aria-hidden="true">
              {format}
            </span>
          </>
        )}
      </div>
    );
  }

  return (
    <figure className={styles.figure}>
      <div className={veiled ? `${frameClass} ${styles.veiled}` : frameClass}>
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes={sizes}
          priority={priority}
          className={styles.image}
          style={photo.focus ? { objectPosition: photo.focus } : undefined}
        />
      </div>
      {photo.caption ? (
        <figcaption className={styles.caption}>
          {photo.caption}
          {photo.credit ? ` Photo : ${photo.credit}.` : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
