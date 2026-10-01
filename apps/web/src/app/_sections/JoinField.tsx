import Link from "next/link";
import { PhotoFrame } from "@/components/media/PhotoFrame";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { mainNavigation, routes } from "@/config/routes";
import { joinField } from "@/content/home";
import styles from "./JoinField.module.css";

// Un libellé par intention : le même que dans la navigation.
const joinLabel =
  mainNavigation.find((item) => item.href === routes.join)?.label ?? "";

export function JoinField() {
  return (
    <section
      id="rejoindre"
      className={styles.field}
      aria-labelledby="rejoindre-titre"
    >
      <div className={`container grid ${styles.layout}`}>
        <div className={styles.photo}>
          <PhotoFrame
            brief={joinField.photoBrief}
            format="4:5"
            sizes="(min-width: 1024px) 30vw, 60vw"
            className={styles.frame}
          />
        </div>

        <div className={styles.head}>
          <SectionLabel number={joinField.number}>{joinLabel}</SectionLabel>
          <h2 id="rejoindre-titre" className={styles.title}>
            {joinField.title}
          </h2>
        </div>

        <p className={styles.text}>{joinField.text}</p>

        {/* L'appel : une ligne de texte en grand, pas un bouton. */}
        <Link href={routes.join} className={styles.action}>
          <span>{joinLabel}</span>
          <svg
            className={styles.arrow}
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M3 10h14M11.5 4.5 17 10l-5.5 5.5" />
          </svg>
        </Link>

        <div className={styles.path}>
          <p className="label">{joinField.pathLabel}</p>
          <ol className={styles.steps}>
            {joinField.path.map((step, index) => (
              <li key={step} className={styles.step}>
                <span className="meta" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
