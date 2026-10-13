import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // En développement, Next.js journalise par défaut l'adresse de chaque
  // requête et les arguments de chaque Server Action. Ils peuvent porter des
  // données personnelles (terme de recherche, saisie d'un formulaire) : rien
  // de cela n'est écrit dans le terminal.
  logging: {
    serverFunctions: false,
    incomingRequests: false,
  },
  experimental: {
    serverActions: {
      // Une image est réduite dans le navigateur avant l'envoi ; quand ce
      // n'est pas possible, l'original part tel quel, jusqu'à 5 242 880
      // octets, avec ses champs et l'habillage multipart. Une Server Action
      // refuse par défaut un corps de plus de 1 Mo. L'API reste l'autorité
      // sur la limite de 5 Mo.
      bodySizeLimit: "6mb",
    },
  },
  images: {
    // Images du site, servies par le stockage : seules leurs adresses
    // publiques sont autorisées.
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
