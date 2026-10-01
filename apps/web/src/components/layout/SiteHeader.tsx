import Image from "next/image";
import Link from "next/link";
import { routes } from "@/config/routes";
import { site } from "@/config/site";
import { currentRotaryYear } from "@/data/members";
import { MobileMenu } from "./MobileMenu";
import { SiteNav } from "./SiteNav";
import styles from "./SiteHeader.module.css";

const dateline = [site.location, `Année Rotary ${currentRotaryYear}`];

export function SiteHeader() {
  return (
    <>
      {/* La « une » du journal : lieu et année, au-dessus de l'en-tête. */}
      <div className={styles.dateline}>
        <p className={`container label ${styles.datelineInner}`}>
          {dateline.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </p>
      </div>
      <header className={styles.header}>
        <div className={`container ${styles.inner}`}>
          <Link href={routes.home} className={styles.brand}>
            <Image
              src={site.logo.src}
              width={site.logo.width}
              height={site.logo.height}
              alt={site.name}
              sizes="160px"
              priority
              className={styles.logo}
            />
          </Link>
          <div className={styles.desktopNav}>
            <SiteNav label="Navigation principale" variant="header" />
          </div>
          <MobileMenu dateline={dateline} />
        </div>
      </header>
    </>
  );
}
