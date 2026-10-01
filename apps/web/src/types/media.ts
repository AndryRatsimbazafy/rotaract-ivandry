export interface Photo {
  src: string;
  width: number;
  height: number;
  /** Texte alternatif : décrit ce que l'image montre. */
  alt: string;
  /** Légende affichée sous l'image, distincte du texte alternatif. */
  caption?: string;
  credit?: string;
}
