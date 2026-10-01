import { SectionLabel } from "@/components/ui/SectionLabel";
import { fourWayTest } from "@/content/join";
import styles from "./FourWayTest.module.css";

export function FourWayTest() {
  return (
    <section className={styles.section} aria-labelledby="questions-titre">
      <div className={`container grid ${styles.layout}`}>
        <div className={styles.head}>
          <SectionLabel number={fourWayTest.number}>
            {fourWayTest.label}
          </SectionLabel>
          <h2 id="questions-titre" className={styles.title}>
            {fourWayTest.title}
          </h2>
        </div>

        {/* Les quatre questions, en voix de récit et en grand. */}
        <ol className={styles.questions}>
          {fourWayTest.questions.map((question, index) => (
            <li key={question} className={styles.question}>
              <span className={`meta ${styles.index}`} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className={styles.text}>{question}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
