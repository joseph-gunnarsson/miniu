/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./assets/index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {

    },
  },
  plugins: [require('tailwind-scrollbar'),],
}