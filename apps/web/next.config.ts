import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Le formulaire de candidature envoie un CV de 4 194 304 octets au plus,
      // avec ses champs et l'habillage multipart. Une Server Action refuse par
      // défaut un corps de plus de 1 Mo. La marge laisse un fichier à peine
      // trop gros atteindre l'API, qui reste l'autorité sur la limite de 4 Mo,
      // tout en restant sous les 4,5 Mo du corps d'une fonction Vercel.
      bodySizeLimit: "4.5mb",
    },
  },
  images: {
    // Portraits et photographies, servis par le stockage : seules leurs
    // adresses publiques sont autorisées.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/*/image/upload/**",
      },
    ],
  },
};

export default nextConfig;
