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
        dark: {
          bg: '#0B0F19',
          card: '#161D30',
          border: '#232D45',
          text: '#F3F4F6',
          muted: '#9CA3AF'
        },
        primary: {
          DEFAULT: '#3B82F6',
          dark: '#1D4ED8',
          light: '#60A5FA'
        },
        accent: {
          cyan: '#06B6D4',
          violet: '#8B5CF6',
          green: '#10B981',
          red: '#EF4444',
          amber: '#F59E0B'
        }
      }
    },
  },
  plugins: [],
}
