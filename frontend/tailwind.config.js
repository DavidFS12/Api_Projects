/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#000051",   // azul oscuro
        secondary: "#2DAAE0", // azul brillante
        background: #F5F7FA,
        surface:#FFFFFF,
        border: #E1E4EB,
        textprimary: #111827,
        textsecundary: #16A34A,
        success: #16A34A,
        Error: #EF4444,
      },
    },
  },
  plugins: [],
}
