import { SectionLabel } from "@/components/ui/SectionLabel";
import { ApplicationForm } from "./ApplicationForm";
import styles from "./JoinApplication.module.css";
import { getContent } from "@/content";
import { currentLang } from "@/lib/current-lang";

export async function JoinApplication() {
  const content = await getContent();
  const { joinApplication } = content.join;
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
          <ApplicationForm text={joinApplication} lang={await currentLang()} />
        </div>
      </div>
    </section>
  );
}
