/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#2563eb", // primary
        accent: "#10b981", // accent
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
}
