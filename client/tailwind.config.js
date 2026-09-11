/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slate: {
          850: '#172033',
        },
        poke: {
          bg: '#0f172a',
          card: '#1e293b',
          cardHover: '#334155',
          border: '#334155',
          text: '#f8fafc',
          muted: '#94a3b8',
          accent: '#3b82f6',
          shiny: '#f59e0b',
          caught: '#10b981',
          uncaught: '#64748b'
        },
        type: {
          normal: '#A8A77A',
          fire: '#EE8130',
          water: '#6390F0',
          electric: '#F7D02C',
          grass: '#7AC74C',
          ice: '#96D9D6',
          fighting: '#C22E28',
          poison: '#A33EA1',
          ground: '#E2BF65',
          flying: '#A98FF3',
          psychic: '#F95587',
          bug: '#A6B91A',
          rock: '#B6A136',
          ghost: '#735797',
          dragon: '#6F35FC',
          steel: '#B7B7CE',
          dark: '#705746',
          fairy: '#D685AD',
        }
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-short': 'bounce 0.5s ease-in-out 1',
      }
    },
  },
  plugins: [],
}
