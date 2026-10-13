import Image from "next/image";
import Link from "@/components/ui/LocalLink";
import { routes } from "@/config/routes";
import { site } from "@/config/site";
import { getCurrentRotaryYear } from "@/data/rotary-years";
import { LanguageSwitch } from "./LanguageSwitch";
import { MobileMenu } from "./MobileMenu";
import { SiteNav } from "./SiteNav";
import { SocialLinks } from "./SocialLinks";
import styles from "./SiteHeader.module.css";
import { getContent } from "@/content";
import { currentLang } from "@/lib/current-lang";
import { localize } from "@/lib/locale";

export async function SiteHeader() {
  const content = await getContent();
  const { rotaryYearLabel, chrome } = content.common;
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
          <div className={styles.datelineTools}>
            <LanguageSwitch labels={chrome.languages} />
            <SocialLinks />
          </div>
        </div>
      </div>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link href={localize(routes.home, await currentLang())} className={styles.brand}>
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
            <SiteNav label={chrome.mainNavLabel} variant="header" />
          </div>
          <MobileMenu
            dateline={dateline}
            social={<SocialLinks />}
            languages={<LanguageSwitch labels={chrome.languages} onField />}
            navigation={chrome.navigation}
            labels={{ ...chrome.menu, mainNav: chrome.mainNavLabel }}
          />
        </div>
      </header>
    </>
  );
}
