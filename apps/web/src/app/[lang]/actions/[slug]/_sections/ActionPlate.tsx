import { PhotoFrame } from "@/components/media/PhotoFrame";
import { GalleryTrigger } from "@/components/media/PhotoGallery";
import type { Photo } from "@/types/media";
import styles from "./ActionPlate.module.css";
import { getContent } from "@/content";

// Motif de la planche : une grande, puis deux plus petites décalées.
const SLOTS = [
  { name: styles.wide, format: "3:2", sizes: "(min-width: 1024px) 66vw, 100vw" },
  { name: styles.tall, format: "4:5", sizes: "(min-width: 1024px) 34vw, 70vw" },
  { name: styles.offset, format: "3:2", sizes: "(min-width: 1024px) 42vw, 86vw" },
];

/**
 * La planche (DESIGN.md, section 10) : les photographies qui suivent la
 * principale, de formats et de hauteurs différents, jamais en vignettes égales.
 */
export async function ActionPlate({ photos }: { photos: Photo[] }) {
  const content = await getContent();
  const { actionPage } = content.actions;
  if (photos.length === 0) return null;

  return (
    <section className={styles.plate} aria-labelledby="action-planche">
      <div className="container">
        <h2 id="action-planche" className={`label ${styles.title}`}>
          {actionPage.plateTitle}
        </h2>
        <ul className={`grid ${styles.photos}`}>
          {photos.map((photo, index) => {
            const slot = SLOTS[index % SLOTS.length];
            return (
              <li key={`${photo.src}-${index}`} className={slot.name}>
                <PhotoFrame
                  photo={photo}
                  brief=""
                  format={slot.format}
                  sizes={slot.sizes}
                  className={styles[`frame${slot.format.replace(":", "x")}`]}
                >
                  {/* La planche suit la photographie principale : rang + 1 dans la galerie. */}
                  <GalleryTrigger
                    index={index + 1}
                    label={content.common.chrome.gallery.open(photo.alt)}
                  />
                </PhotoFrame>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
