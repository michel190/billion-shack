/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Site 100 % statique (dossier « out ») : rien ne tourne côté serveur une fois en ligne.
  output: 'export',
  // `next dev` ne crée pas de fichier AGENTS.md dans le projet
  agentRules: false,
};

module.exports = nextConfig;
