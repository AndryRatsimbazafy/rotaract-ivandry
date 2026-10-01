import type { CSSProperties } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { joinClub } from "@/content/join";
import styles from "./JoinClub.module.css";

export function JoinClub() {
  return (
    <section className={styles.sheet} aria-labelledby="club-titre">
      <div className={`container grid ${styles.layout}`}>
        <div className={styles.head}>
          <SectionLabel number={joinClub.number}>{joinClub.label}</SectionLabel>
          {/* Trois temps, trois lignes, chacune un peu plus loin. */}
          <h2 id="club-titre" className={styles.title}>
            {joinClub.titleLines.map((line, index) => (
              <span
                key={line}
                className={styles.line}
                style={{ "--step": index } as CSSProperties}
              >
                {line}{" "}
              </span>
            ))}
          </h2>
        </div>
        <p className={styles.text}>{joinClub.text}</p>
      </div>
    </section>
  );
}
