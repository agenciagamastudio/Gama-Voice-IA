import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* Quadricolor CMYK Primaries */
        'qc-cyan': '#03A1E1',
        'qc-magenta': '#FF0F8C',
        'qc-yellow': '#F4D500',
        'qc-black': '#000000',

        /* Quadricolor Neutrals */
        'qc-ink': '#2B302A',
        'qc-ink-2': '#555754',
        'qc-mute': '#8A8B88',
        'qc-line': '#E6E6E4',
        'qc-paper': '#F6F4F0',
        'qc-paper-tex': '#F1ECE5',
        'qc-white': '#FFFFFF',

        /* Dark Mode Surfaces */
        'qc-bg-dark': '#0F1014',
        'qc-card-dark': '#1A1C20',

        /* Gradient Colors (Individual) */
        'qc-grad-orange': '#F39C2A',
        'qc-grad-coral': '#E15D69',
        'qc-grad-pink': '#E83B8E',

        /* Semantic Aliases */
        'color-bg': 'var(--color-bg)',
        'color-surface': 'var(--color-surface)',
        'color-border': 'var(--color-border)',
        'color-text': 'var(--color-text)',
        'color-text-2': 'var(--color-text-2)',
        'color-muted': 'var(--color-muted)',
        'color-primary': 'var(--color-primary)',
        'color-magenta': 'var(--color-magenta)',
        'color-yellow': 'var(--color-yellow)',
        'color-black': 'var(--color-black)',
        'color-success': 'var(--color-success)',
        'color-warning': 'var(--color-warning)',
        'color-error': 'var(--color-error)',
        'color-info': 'var(--color-info)',
      },
      spacing: {
        's-1': '4px',
        's-2': '8px',
        's-3': '12px',
        's-4': '16px',
        's-5': '24px',
        's-6': '32px',
        's-7': '48px',
        's-8': '64px',
        's-9': '96px',
        's-10': '128px',
        's-11': '160px',
      },
      borderRadius: {
        'qc-xs': '6px',
        'qc-sm': '10px',
        'qc-md': '16px',
        'qc-lg': '24px',
        'qc-pill': '999px',
      },
      boxShadow: {
        'qc-sm': '0 3px 10px rgba(20, 20, 20, 0.14)',
        'qc-md': '0 12px 28px rgba(20, 20, 20, 0.18)',
        'qc-lg': '0 28px 70px rgba(20, 20, 20, 0.28)',
        'qc-pop': '0 18px 42px rgba(232, 59, 142, 0.38)',
      },
      fontSize: {
        'qc-hero': '72px',
        'qc-display': '56px',
        'qc-h1': '40px',
        'qc-h2': '28px',
        'qc-h3': '22px',
        'qc-body': '18px',
        'qc-small': '14px',
        'qc-micro': '11px',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'qc-gradient': 'var(--qc-gradient)',
        'qc-gradient-wide': 'var(--qc-gradient-wide)',
        'qc-ig-ring': 'var(--qc-ig-ring)',
      },
    },
  },
  plugins: [],
}

export default config
