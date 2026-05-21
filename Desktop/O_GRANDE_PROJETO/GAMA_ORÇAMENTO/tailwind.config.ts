import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    /^p-/,
    /^px-/,
    /^py-/,
    /^m-/,
    /^mx-/,
    /^my-/,
    /^gap-/,
    /^grid-cols-/,
    /^grid-rows-/,
    /^flex-/,
    /^justify-/,
    /^items-/,
  ],
  theme: {
    extend: {
      colors: {
        gama: {
          primary: "var(--color-primary)",
          "primary-dim": "var(--color-primary-dim)",
          "primary-glow": "var(--color-primary-glow)",
          bg: "var(--color-bg)",
          surface: "var(--color-surface)",
          "surface-2": "var(--color-surface-2)",
          "surface-3": "var(--color-surface-3)",
          border: "var(--color-border)",
          "border-green": "var(--color-border-green)",
          text: "var(--color-text)",
          "text-secondary": "var(--color-text-secondary)",
          "text-muted": "var(--color-text-muted)",
          success: "var(--color-success)",
          warning: "var(--color-warning)",
          error: "var(--color-error)",
          info: "var(--color-info)",
        },
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "Poppins", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      backgroundColor: {
        "token-bg": "var(--color-bg)",
        "token-surface": "var(--color-surface)",
        "token-surface-2": "var(--color-surface-2)",
        "token-surface-3": "var(--color-surface-3)",
      },
      textColor: {
        "token-primary": "var(--color-primary)",
        "token-text": "var(--color-text)",
        "token-secondary": "var(--color-text-secondary)",
        "token-muted": "var(--color-text-muted)",
      },
      borderColor: {
        "token-border": "var(--color-border)",
        "token-border-green": "var(--color-border-green)",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          from: { opacity: "0", transform: "translateY(-20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.92)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        pulseGreen: {
          "0%, 100%": { boxShadow: "0 0 20px var(--color-primary-dim)" },
          "50%": { boxShadow: "0 0 40px var(--color-primary-glow)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        gamaGlow: {
          "0%, 100%": { boxShadow: "0 0 16px var(--color-primary-dim)" },
          "50%": { boxShadow: "0 0 36px var(--color-primary-glow)" },
        },
        spin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        volumetricPulse: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fadeUp 600ms cubic-bezier(0.16,1,0.3,1) both",
        "fade-up-slow": "fadeUp 1000ms cubic-bezier(0.16,1,0.3,1) both",
        "fade-up-fast": "fadeUp 300ms cubic-bezier(0.16,1,0.3,1) both",
        "slide-down": "slideDown 400ms ease-out",
        "slide-up": "slideUp 400ms ease-out",
        "fade-in": "fadeIn 300ms ease-out",
        "scale-in": "scaleIn 200ms ease-out",
        "pulse-green": "pulseGreen 2s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
        "gama-glow": "gamaGlow 2s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
        "volumetric-pulse": "volumetricPulse 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
