import Image from "next/image";
import { site } from "@/config/site";
import { rotaryYearLabel } from "@/content/common";
import { getCurrentRotaryYear } from "@/data/rotary-years";
import { SiteNav } from "./SiteNav";
import { SocialLinks } from "./SocialLinks";
import styles from "./SiteFooter.module.css";

export async function SiteFooter() {
  const currentYear = await getCurrentRotaryYear();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        {/* La signature du club, sur fond transparent. */}
        <p className={styles.brand}>
          <Image
            src={site.logo.src}
            width={site.logo.width}
            height={site.logo.height}
            alt={site.name}
            sizes="220px"
            className={styles.logo}
          />
        </p>
        <SiteNav label="Navigation du pied de page" variant="footer" />
        <div>
          <p className={`label ${styles.dateline}`}>
            <span>{site.location}</span>
            <span>
              {rotaryYearLabel} {currentYear}
            </span>
          </p>
          <div className={styles.social}>
            <SocialLinks />
          </div>
        </div>
      </div>
      {/* Le nom du club, en très grand, coupé par le bas de la page. */}
      <p className={styles.wordmark} aria-hidden="true">
        {site.name}
      </p>
    </footer>
  );
}
