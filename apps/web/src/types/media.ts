export interface Photo {
  src: string;
  width: number;
  height: number;
  /** Texte alternatif : décrit ce que l'image montre. */
  alt: string;
  /** Légende affichée sous l'image, distincte du texte alternatif. */
  caption?: string;
  credit?: string;
  /** Point d'intérêt gardé au recadrage, en syntaxe CSS (« 50% 30% »). */
  focus?: string;
}
