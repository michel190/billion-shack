/** @type {import('tailwindcss').Config} */
// BILLION SHACK — le bleu nuit du logo, des neutres froids + UNE couleur d'accent :
// le magenta du sac (règle du skill premium-design).
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        fog: '#E9E8EE',      // gris froid clair
        bone: '#F6F5F8',     // blanc cassé
        tile: '#ECEBF0',     // fond des vignettes produit
        ink: '#0F0D1A',      // texte
        night: '#0C081F',    // bleu nuit du logo (sections sombres)
        night2: '#161230',
        mut: '#625E74',      // gris sur fond clair
        mutd: '#A39FBF',     // gris sur fond sombre
        accent: {
          DEFAULT: '#E3297D', // magenta du sac — la seule couleur d'accent
          dark: '#B81E63',    // petit texte sur fond clair
          light: '#F25C9F',   // petit texte sur fond sombre
        },
      },
      fontFamily: {
        display: ['"Archivo Variable"', 'Arial Black', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        body: ['"Inter Variable"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
