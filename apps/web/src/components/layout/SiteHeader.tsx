import Image from "next/image";
import Link from "next/link";
import { routes } from "@/config/routes";
import { site } from "@/config/site";
import { rotaryYearLabel } from "@/content/common";
import { getCurrentRotaryYear } from "@/data/rotary-years";
import { MobileMenu } from "./MobileMenu";
import { SiteNav } from "./SiteNav";
import { SocialLinks } from "./SocialLinks";
import styles from "./SiteHeader.module.css";

export async function SiteHeader() {
  const dateline = [
    site.location,
    `${rotaryYearLabel} ${await getCurrentRotaryYear()}`,
  ];

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
