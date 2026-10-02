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
};

export default nextConfig;
