import { site } from "@/config/site";
import { getNewsBySlug } from "@/data/news";
import { SHARE_CONTENT_TYPE, SHARE_SIZE, shareAlt } from "@/lib/share-image";
import { isLang } from "@/lib/locale";
import { contentShareImage, langOrNotFound } from "@/lib/share-page";

type Props = { params: Promise<{ lang: string; slug: string }> };

// Image de partage d'une actualité : son titre dans la langue de l'adresse et
// sa photographie principale (015). Actualité non publiée : 404.
export async function generateImageMetadata({ params }: { params: { lang?: string; slug?: string } | Promise<{ lang?: string; slug?: string }> }) {
  const { lang, slug } = await params;
  const item = slug && lang && isLang(lang) ? await getNewsBySlug(slug, lang) : null;
  // Pas de 404 ici (Next.js l'appelle aussi pour lister les images) : l'image s'en charge.
  return [{ id: "partage", alt: item ? shareAlt(item.title) : site.name, size: SHARE_SIZE, contentType: SHARE_CONTENT_TYPE }];
}

export default async function Image({ params }: Props) {
  const { lang: value, slug } = await params;
  const lang = langOrNotFound(value);
  return contentShareImage(await getNewsBySlug(slug, lang), lang);
}

// Composée à chaque demande, comme la page (les lectures de l'API restent en
// cache environ 60 secondes) : un 404 ne reste jamais en cache.
export const dynamic = "force-dynamic";
