/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#0dcaf0",
        secondary: "#6610f2",
        success: "#20c997",
        warning: "#ffc107",
        dark: "#111",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 6px 32px 0 #0dcaf0cc, 0 1.5px 0 #fff2",
      },
      animation: {
        bounce: "bounce 1.2s infinite alternate cubic-bezier(.5,1.5,.5,1)",
        pop: "popin 0.7s cubic-bezier(.5,1.5,.5,1) both",
        darkbg: "darkbgmove 12s linear infinite alternate",
      },
      keyframes: {
        popin: {
          "0%": { transform: "scale(0.7) rotate(-8deg)", opacity: "0" },
          "80%": { transform: "scale(1.05) rotate(2deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(0)" },
        },
        darkbgmove: {
          "0%": { backgroundPosition: "0% 0%, 100% 100%, 0% 0%" },
          "100%": { backgroundPosition: "20% 40%, 80% 60%, 100% 100%" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};