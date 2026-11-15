/** @type {import('tailwindcss').Config} */
// BILLION SHACK — style « fanzine photocopié » : papier, encre noire, UNE couleur vive (orange).
// Pas de dégradé, pas de halo : des aplats, des traits noirs, du grain de photocopieuse.
// (Les noms des couleurs sont gardés pour ne rien casser : « night » = l'encre des sections noires.)
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        fog: '#E8E4D9',      // papier un peu plus foncé (héros)
        bone: '#F3F0E8',     // papier
        tile: '#E6E2D6',     // fond des photos produit
        ink: '#111111',      // encre
        night: '#111111',    // sections noires (encre pleine)
        night2: '#1C1B19',   // noir un peu plus doux (bandeaux)
        mut: '#5C5850',      // texte secondaire sur papier
        mutd: '#ABA698',     // texte secondaire sur noir
        tape: '#E9DDB4',     // scotch de masquage
        accent: {
          DEFAULT: '#FF5B14', // orange — la seule couleur vive
          dark: '#B33A00',    // petit texte orange sur papier (lisible)
          light: '#FF7A3D',   // petit texte orange sur noir
        },
      },
      fontFamily: {
        display: ['"Big Shoulders Display"', 'Impact', 'sans-serif'],
        body: ['"Courier Prime"', '"Courier New"', 'monospace'],
      },
    },
  },
  plugins: [],
};
