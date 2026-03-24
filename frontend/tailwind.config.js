/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dota: {
          bg: '#11151a',
          panel: '#1b2229',
          border: '#2c353e',
          radiant: '#639e44',
          dire: '#b53e34',
          gold: '#dfad41',
          goldhover: '#f5c662',
          text: '#bcc5ce',
          muted: '#7e8a96',
          dark: '#0a0d10'
        }
      },
      boxShadow: {
        'dota': '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        'glow': '0 0 15px rgba(223, 173, 65, 0.3)',
      }
    },
  },
  plugins: [],
}
