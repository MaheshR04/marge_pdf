/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4fbff",
          100: "#ddf3ff",
          200: "#b6e8ff",
          300: "#78d5ff",
          400: "#32bbff",
          500: "#099bff",
          600: "#0079d1",
          700: "#0461a8",
          800: "#0a4f88",
          900: "#104371"
        }
      },
      boxShadow: {
        soft: "0 20px 40px rgba(7, 37, 66, 0.12)"
      },
      backgroundImage: {
        "mesh-light":
          "radial-gradient(circle at 0% 0%, rgba(50, 187, 255, 0.30), transparent 35%), radial-gradient(circle at 100% 100%, rgba(16, 67, 113, 0.25), transparent 40%), linear-gradient(145deg, #f7fcff 10%, #ecf5ff 45%, #fdfefe 100%)"
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "fade-up": "fadeUp 700ms ease-out both"
      }
    }
  },
  plugins: []
};
