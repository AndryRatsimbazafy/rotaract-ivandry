import { SectionLabel } from "@/components/ui/SectionLabel";
import { joinApplication } from "@/content/join";
import { ApplicationForm } from "./ApplicationForm";
import styles from "./JoinApplication.module.css";

export function JoinApplication() {
  return (
    <section
      id="candidature"
      className={styles.sheet}
      aria-labelledby="candidature-titre"
    >
      <div className={`container grid ${styles.layout}`}>
        <div className={styles.head}>
          <SectionLabel number={joinApplication.number}>
            {joinApplication.label}
          </SectionLabel>
          <h2 id="candidature-titre" className={styles.title}>
            {joinApplication.title}
          </h2>
        </div>
        <div className={styles.form}>
          <ApplicationForm />
        </div>
      </div>
    </section>
  );
}
