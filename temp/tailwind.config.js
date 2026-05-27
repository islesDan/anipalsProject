/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        meadow: '#61c277',
        pond: '#43b7d8',
        berry: '#f16a93',
        sun: '#ffd166',
        soil: '#9b6a43',
        cream: '#fff7df',
        ink: '#2d334a',
      },
      boxShadow: {
        pixel: '0 6px 0 rgba(45, 51, 74, 0.16)',
        soft: '0 18px 50px rgba(45, 51, 74, 0.12)',
      },
      fontFamily: {
        game: ['Trebuchet MS', 'Verdana', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
