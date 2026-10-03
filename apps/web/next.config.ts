import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Le formulaire de candidature envoie un CV de 5 242 880 octets au plus,
      // avec ses champs et l'habillage multipart. Une Server Action refuse par
      // défaut un corps de plus de 1 Mo. La marge laisse un fichier à peine
      // trop gros atteindre l'API, qui reste l'autorité sur la limite de 5 Mo.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
