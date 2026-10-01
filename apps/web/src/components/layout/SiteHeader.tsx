import Image from "next/image";
import Link from "next/link";
import { routes } from "@/config/routes";
import { site } from "@/config/site";
import { rotaryYearLabel } from "@/content/common";
import { currentRotaryYear } from "@/lib/rotary-year";
import { MobileMenu } from "./MobileMenu";
import { SiteNav } from "./SiteNav";
import { SocialLinks } from "./SocialLinks";
import styles from "./SiteHeader.module.css";

const dateline = [site.location, `${rotaryYearLabel} ${currentRotaryYear}`];

export function SiteHeader() {
  return (
    <>
      {/* La « une » du journal : lieu et année, au-dessus de l'en-tête. */}
      <div className={styles.dateline}>
        <div className={styles.datelineInner}>
          <p className={`label ${styles.datelineText}`}>
            {dateline.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </p>
          <SocialLinks />
        </div>
      </div>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link href={routes.home} className={styles.brand}>
            <Image
              src={site.logo.src}
              width={site.logo.width}
              height={site.logo.height}
              alt={site.name}
              sizes="180px"
              priority
              className={styles.logo}
            />
          </Link>
          <div className={styles.desktopNav}>
            <SiteNav label="Navigation principale" variant="header" />
          </div>
          <MobileMenu dateline={dateline} social={<SocialLinks />} />
        </div>
      </header>
    </>
  );
}
